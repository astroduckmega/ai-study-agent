import logging
from typing import List, Dict, Any, Optional
from app.rag.vector_store import get_vector_store
from app.database.connection import get_db

logger = logging.getLogger("app.tools.pdf_search")

async def search_pdf(query: str, document_id: Optional[str] = None, user_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Tool: Searches the vector store for semantic matches to the student's question/topic, scoped to user_id.
    """
    vector_store = get_vector_store()
    return vector_store.search_similar_chunks(query=query, document_id=document_id, user_id=user_id, top_k=top_k)

async def retrieve_relevant_chunks(query: str, document_id: Optional[str] = None, user_id: Optional[str] = None, top_k: int = 5) -> str:
    """
    Tool: Formats matching PDF chunks into a clean prompt context block with page citations.
    """
    chunks = await search_pdf(query=query, document_id=document_id, user_id=user_id, top_k=top_k)
    if not chunks:
        return "No relevant PDF chunks found."

    formatted_blocks = []
    for c in chunks:
        block = f"[Source: {c['filename']} | Page {c['page_number']} | Relevance: {c.get('relevance_score', 0.0)}]\n{c['content']}"
        formatted_blocks.append(block)

    return "\n\n---\n\n".join(formatted_blocks)

async def get_document_metadata(document_id: str) -> Optional[Dict[str, Any]]:
    """
    Tool: Fetches document details, total pages, title, and identified topics.
    """
    db = get_db()
    doc = await db["documents"].find_one({"_id": document_id})
    return doc
