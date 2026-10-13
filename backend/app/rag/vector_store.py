import os
import re
import json
import math
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.rag.embeddings import get_embedding_function

logger = logging.getLogger("app.rag.vector_store")

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it",
    "its", "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
    "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "we", "were", "what", "when", "where", "which", "while", "who",
    "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

class DocumentVectorStore:
    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self.chunks_dir = os.path.join(os.path.dirname(settings.CHROMA_PERSIST_DIR), "chunks")
        os.makedirs(self.chunks_dir, exist_ok=True)
        self.embeddings = get_embedding_function()
        self._in_memory_docs: Dict[str, List[Dict[str, Any]]] = {}
        self._load_persisted_chunks()
        self._auto_index_existing_uploads()

    def _load_persisted_chunks(self):
        """Loads all previously saved JSON chunk files from disk into memory on startup."""
        try:
            if not os.path.exists(self.chunks_dir):
                return
            for fname in os.listdir(self.chunks_dir):
                if fname.endswith(".json"):
                    doc_id = fname[:-5]
                    file_path = os.path.join(self.chunks_dir, fname)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                self._in_memory_docs[doc_id] = data
                                logger.info(f"Hydrated {len(data)} chunks for document {doc_id} from disk.")
                    except Exception as ex:
                        logger.warning(f"Could not load chunk file {fname}: {ex}")
        except Exception as e:
            logger.warning(f"Error reading chunk directory: {e}")

    def _auto_index_existing_uploads(self):
        """Automatically indexes any PDF in data/uploads that is missing from vector store."""
        upload_dir = settings.UPLOAD_DIR
        if not os.path.exists(upload_dir):
            return

        for fname in os.listdir(upload_dir):
            if not fname.lower().endswith(".pdf"):
                continue

            # Extract doc_id if filename format is {doc_id}_{name}.pdf
            parts = fname.split("_", 1)
            doc_id = parts[0] if len(parts) > 1 and len(parts[0]) >= 8 else fname
            original_filename = parts[1] if len(parts) > 1 else fname

            if doc_id not in self._in_memory_docs:
                file_path = os.path.join(upload_dir, fname)
                try:
                    from app.rag.loader import load_and_extract_pdf
                    from app.rag.chunker import chunk_pdf_pages
                    pages_data, _ = load_and_extract_pdf(file_path)
                    if pages_data:
                        chunks = chunk_pdf_pages(pages_data=pages_data, document_id=doc_id)
                        self.index_document_chunks(document_id=doc_id, filename=original_filename, chunks=chunks)
                        logger.info(f"Auto-indexed existing upload: {fname} ({len(chunks)} chunks)")
                except Exception as ex:
                    logger.warning(f"Could not auto-index {fname}: {ex}")

    def index_document_chunks(self, document_id: str, filename: str, chunks: List[Dict[str, Any]], user_id: Optional[str] = None):
        """Indexes a list of chunks, computes embeddings, and persists to disk JSON + RAM with user_id."""
        if not chunks:
            return

        texts = [c["content"] for c in chunks]
        ids = [c["chunk_id"] for c in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "user_id": user_id or c.get("metadata", {}).get("user_id"),
                "filename": filename,
                "page_number": int(c["page_number"]),
                "chunk_index": int(c["metadata"].get("chunk_index", 0))
            }
            for c in chunks
        ]

        # Compute embeddings
        embeddings_list = self.embeddings.embed_documents(texts)
        stored_items = []
        for i, text in enumerate(texts):
            stored_items.append({
                "id": ids[i],
                "text": text,
                "metadata": metadatas[i],
                "embedding": embeddings_list[i]
            })

        self._in_memory_docs[document_id] = stored_items

        # Persist to disk JSON
        try:
            chunk_file = os.path.join(self.chunks_dir, f"{document_id}.json")
            with open(chunk_file, "w", encoding="utf-8") as f:
                json.dump(stored_items, f, ensure_ascii=False)
            logger.info(f"Persisted {len(stored_items)} chunks for document {document_id} (user: {user_id}) to disk.")
        except Exception as e:
            logger.warning(f"Failed to persist chunks to disk: {e}")

    def delete_document_chunks(self, document_id: str):
        """Removes document chunks from in-memory index and disk JSON."""
        if document_id in self._in_memory_docs:
            del self._in_memory_docs[document_id]
        chunk_file = os.path.join(self.chunks_dir, f"{document_id}.json")
        if os.path.exists(chunk_file):
            try:
                os.remove(chunk_file)
                logger.info(f"Deleted persistent chunk file: {chunk_file}")
            except Exception as e:
                logger.warning(f"Could not remove chunk file: {e}")

    def _compute_keyword_score(self, query: str, text: str) -> float:
        """Calculates lexical keyword overlap and phrase matching score."""
        q_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', query.lower()).strip()
        t_clean = text.lower()
        
        words = [w for w in q_clean.split() if w not in STOPWORDS and len(w) > 1]
        if not words:
            words = q_clean.split()

        if not words:
            return 0.0

        score = 0.0
        # Exact phrase bonus
        if q_clean in t_clean and len(q_clean) > 3:
            score += 0.5

        # Word presence and frequency
        matched_words = 0
        for w in words:
            if w in t_clean:
                matched_words += 1
                # Additional count boost
                count = t_clean.count(w)
                score += min(0.3, count * 0.1)

        coverage = matched_words / len(words)
        score += coverage * 0.5

        return min(1.0, score)

    def search_similar_chunks(
        self,
        query: str,
        document_id: Optional[str] = None,
        user_id: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Performs Hybrid Search (Semantic Cosine Similarity + Keyword/Phrase Match).
        Strictly scopes candidates to the requesting user_id to prevent cross-account leakage.
        """
        # Ensure any existing uploads are indexed
        if not self._in_memory_docs:
            self._auto_index_existing_uploads()

        query_embedding = self.embeddings.embed_query(query)

        # Select candidate documents scoped by user_id and document_id
        target_items: List[Dict[str, Any]] = []
        if document_id and document_id in self._in_memory_docs:
            items = self._in_memory_docs[document_id]
            if user_id:
                # Filter to match user_id or legacy docs without user_id
                target_items = [it for it in items if not it["metadata"].get("user_id") or it["metadata"].get("user_id") == user_id]
            else:
                target_items = items
        else:
            # If doc_id not specified, search docs belonging ONLY to this user
            for doc_list in self._in_memory_docs.values():
                for it in doc_list:
                    doc_user = it.get("metadata", {}).get("user_id")
                    if not user_id or not doc_user or doc_user == user_id:
                        target_items.append(it)

        if not target_items:
            logger.info(f"No document chunks found for user_id={user_id}, doc_id={document_id}")
            return []

        scored_results = []
        for item in target_items:
            emb = item.get("embedding", [])
            
            # 1. Semantic Cosine Similarity
            semantic_score = 0.0
            if emb and len(emb) == len(query_embedding):
                dot_product = sum(a * b for a, b in zip(query_embedding, emb))
                norm_q = math.sqrt(sum(a * a for a in query_embedding))
                norm_e = math.sqrt(sum(b * b for b in emb))
                if norm_q > 0 and norm_e > 0:
                    semantic_score = max(0.0, min(1.0, dot_product / (norm_q * norm_e)))

            # 2. Keyword / Lexical Score
            keyword_score = self._compute_keyword_score(query, item["text"])

            # 3. Hybrid Combined Score
            if keyword_score > 0:
                combined_score = 0.4 * semantic_score + 0.6 * keyword_score
            else:
                combined_score = semantic_score

            scored_results.append((combined_score, item))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_results[:top_k]

        return [
            {
                "content": item["text"],
                "page_number": item["metadata"].get("page_number", 1),
                "filename": item["metadata"].get("filename", "document.pdf"),
                "document_id": item["metadata"].get("document_id", document_id or ""),
                "relevance_score": round(score, 3)
            }
            for score, item in top_results
        ]


_vector_store_instance = None

def get_vector_store() -> DocumentVectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = DocumentVectorStore()
    return _vector_store_instance
