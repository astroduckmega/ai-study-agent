import logging
from typing import Dict, Any, Optional
from app.llm.provider import invoke_llm_text
from app.llm.prompts import SUMMARY_SYSTEM_PROMPT
from app.tools.pdf_search import retrieve_relevant_chunks, get_document_metadata

logger = logging.getLogger("app.tools.summary")

async def generate_summary_tool(
    document_id: str,
    summary_type: str = "detailed",
    custom_instruction: Optional[str] = None,
    chapter_or_topic: Optional[str] = None
) -> Dict[str, Any]:
    """
    Tool: Generates a high-quality academic summary based on document content and requested type.
    """
    doc_meta = await get_document_metadata(document_id)
    doc_name = doc_meta.get("filename", "Study Material") if doc_meta else "Study Material"

    search_query = chapter_or_topic or "main concepts key principles architecture overview formulas summary"
    context = await retrieve_relevant_chunks(query=search_query, document_id=document_id, top_k=6)

    prompt = f"""Generate a '{summary_type}' summary for document '{doc_name}'.
Chapter/Topic Focus: {chapter_or_topic or 'Comprehensive overview'}
Additional Instructions: {custom_instruction or 'None'}

Study Material Excerpts:
{context}

Please provide a well-structured summary in Markdown format with:
1. Clear headings and bullet points.
2. Explanations of core principles.
3. Key formulas or definitions where appropriate.
4. A dedicated '### Key Takeaways' section.
"""

    summary_text = await invoke_llm_text(
        system_prompt=SUMMARY_SYSTEM_PROMPT,
        user_prompt=prompt
    )

    # Extract bullet points as key takeaways
    lines = summary_text.split('\n')
    takeaways = [l.strip().lstrip('*-•').strip() for l in lines if l.strip().startswith(('*', '-', '•'))][:5]

    return {
        "document_id": document_id,
        "document_name": doc_name,
        "summary_type": summary_type,
        "title": f"{summary_type.replace('_', ' ').title()} Summary: {doc_name}",
        "content": summary_text,
        "key_takeaways": takeaways if takeaways else ["Review core foundational definitions", "Practice exam questions on main topics"],
        "topics_covered": doc_meta.get("metadata", {}).get("topics", []) if doc_meta else []
    }
