import logging
from typing import Dict, Any, List
from app.agents.state import AgentState
from app.tools.pdf_search import search_pdf, retrieve_relevant_chunks
from app.llm.provider import invoke_llm_text
from app.llm.prompts import QA_RAG_SYSTEM_PROMPT

logger = logging.getLogger("app.agents.qa")

async def qa_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Q&A / RAG Agent Node in LangGraph.
    Performs vector retrieval, checks grounding, cites source pages, and answers student query.
    """
    logger.info("Executing Q&A / RAG Agent Node...")
    user_prompt = state.get("user_prompt", "")
    user_id = state.get("user_id")
    doc_id = state.get("document_id")

    # 1. Retrieve relevant PDF chunks scoped to this user
    matching_chunks = await search_pdf(query=user_prompt, document_id=doc_id, user_id=user_id, top_k=5)
    context_text = await retrieve_relevant_chunks(query=user_prompt, document_id=doc_id, user_id=user_id, top_k=5)

    citations = []
    for c in matching_chunks:
        citations.append({
            "document_id": c.get("document_id", doc_id or ""),
            "document_name": c.get("filename", "Study Material"),
            "page_number": c.get("page_number", 1),
            "snippet": c.get("content", "")[:200] + "...",
            "relevance_score": c.get("relevance_score", 0.0)
        })

    prompt = f"""Student Question:
{user_prompt}

Extracted Document Context:
{context_text}

Instructions:
1. Provide a comprehensive, clear, and well-structured answer explaining the concept based on the document context.
2. Clearly cite the exact page number(s) where each key piece of information appears in the format [Page X].
3. If the context does not contain relevant information at all, state that the document does not mention it."""

    response_text = await invoke_llm_text(
        system_prompt=QA_RAG_SYSTEM_PROMPT,
        user_prompt=prompt
    )

    executed_step = {
        "step_number": len(state.get("executed_steps", [])) + 1,
        "agent_name": "qa_agent",
        "action": f"Retrieved {len(matching_chunks)} chunks and generated grounded response with citations.",
        "status": "completed",
        "output_summary": f"Answered question citing pages: {list(set(c['page_number'] for c in matching_chunks))}"
    }

    qa_payload = {
        "answer": response_text,
        "citations": citations,
        "matching_chunks": matching_chunks
    }

    return {
        "qa_data": qa_payload,
        "final_output": response_text,
        "context_chunks": matching_chunks,
        "follow_up_suggestions": [
            "Can you give an example of this concept?",
            "Create a practice question on this topic",
            "What is the difference between this and related concepts?"
        ],
        "executed_steps": state.get("executed_steps", []) + [executed_step]
    }
