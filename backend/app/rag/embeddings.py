import logging
import math
from typing import List, Optional
from app.config import settings

logger = logging.getLogger("app.rag.embeddings")

class FallbackSimpleEmbeddings:
    """Lightweight deterministic character n-gram embedding fallback."""
    def __init__(self, dim: int = 384):
        self.dim = dim

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_one(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_one(text)

    def _embed_one(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        tokens = text.lower().split()
        if not tokens:
            return vec
        for token in tokens:
            h = hash(token) % self.dim
            vec[h] += 1.0
        # Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec


class SafeEmbeddingsWrapper:
    """Wraps any LangChain embeddings provider and gracefully falls back to deterministic embeddings on error."""
    def __init__(self, primary_embeddings):
        self.primary = primary_embeddings
        self.fallback = FallbackSimpleEmbeddings()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            return self.primary.embed_documents(texts)
        except Exception as e:
            logger.warning(f"Primary embed_documents failed: {e}. Falling back to lightweight local embeddings.")
            return self.fallback.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        try:
            return self.primary.embed_query(text)
        except Exception as e:
            logger.warning(f"Primary embed_query failed: {e}. Falling back to lightweight local embeddings.")
            return self.fallback.embed_query(text)


_embedding_instance = None

def get_embedding_function():
    global _embedding_instance
    if _embedding_instance is not None:
        return _embedding_instance

    # 1. Try HuggingFace Sentence Transformers
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        logger.info(f"Loading HuggingFace embedding model: {settings.EMBEDDING_MODEL}...")
        hf_emb = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"}
        )
        _embedding_instance = SafeEmbeddingsWrapper(hf_emb)
        return _embedding_instance
    except Exception as e:
        logger.warning(f"Could not load HuggingFaceEmbeddings: {e}")

    # 2. Try Google Generative AI Embeddings
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY.startswith("AIzaSy"):
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            logger.info("Using GoogleGenerativeAIEmbeddings (models/text-embedding-004)...")
            google_emb = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GOOGLE_API_KEY
            )
            _embedding_instance = SafeEmbeddingsWrapper(google_emb)
            return _embedding_instance
        except Exception as e:
            logger.warning(f"Could not load GoogleGenerativeAIEmbeddings: {e}")

    # 3. Fallback
    logger.info("Using lightweight fallback embeddings.")
    _embedding_instance = FallbackSimpleEmbeddings()
    return _embedding_instance
