import uuid
from typing import List, Dict, Any

def _fallback_split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Splits text into chunks by sentences/paragraphs."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start += (chunk_size - chunk_overlap)
    return chunks

def chunk_pdf_pages(
    pages_data: List[Dict[str, Any]],
    document_id: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[Dict[str, Any]]:
    """
    Chunks extracted pages while preserving page number and document reference metadata.
    """
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "; ", " ", ""]
        )
        splitter_fn = text_splitter.split_text
    except ImportError:
        splitter_fn = lambda t: _fallback_split_text(t, chunk_size, chunk_overlap)

    chunks: List[Dict[str, Any]] = []

    for page_entry in pages_data:
        page_num = page_entry["page_number"]
        text = page_entry["cleaned_text"]

        if not text:
            continue

        split_texts = splitter_fn(text)
        for idx, split_content in enumerate(split_texts):
            chunk_id = f"{document_id}_p{page_num}_c{idx}_{uuid.uuid4().hex[:6]}"
            chunks.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "page_number": page_num,
                "content": split_content,
                "metadata": {
                    "document_id": document_id,
                    "page_number": page_num,
                    "chunk_index": idx,
                    "char_count": len(split_content)
                }
            })

    return chunks
