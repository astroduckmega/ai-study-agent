import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.tools.summary_tools import generate_summary_tool

logger = logging.getLogger("app.agents.summary")

async def summary_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Summary Agent Node in LangGraph.
    Extracts summary parameters from user prompt, executes summary generation tool,
    and attaches structured summary result to state.
    """
    logger.info("Executing Summary Agent Node...")
    prompt = state.get("user_prompt", "").lower()
    doc_id = state.get("document_id")

    if not doc_id:
        return {
            "error": "No study document selected. Please upload or select a PDF document first.",
            "final_output": "Please select a study document to generate a summary."
        }

    # Determine summary type from prompt
    summary_type = "detailed"
    if "short" in prompt or "quick" in prompt or "brief" in prompt:
        summary_type = "short"
    elif "exam" in prompt or "high yield" in prompt:
        summary_type = "exam_oriented"
    elif "formula" in prompt or "equation" in prompt:
        summary_type = "formulas"
    elif "definition" in prompt or "glossary" in prompt:
        summary_type = "definitions"
    elif "key point" in prompt or "bullet" in prompt:
        summary_type = "key_points"
    elif "chapter" in prompt:
        summary_type = "chapter_wise"

    summary_result = await generate_summary_tool(
        document_id=doc_id,
        summary_type=summary_type,
        custom_instruction=state.get("user_prompt")
    )

    executed_step = {
        "step_number": len(state.get("executed_steps", [])) + 1,
        "agent_name": "summary_agent",
        "action": f"Generated '{summary_type}' summary from document.",
        "status": "completed",
        "output_summary": f"Generated {len(summary_result['content'])} characters summary with {len(summary_result['key_takeaways'])} key takeaways."
    }

    return {
        "summary_data": summary_result,
        "final_output": summary_result["content"],
        "follow_up_suggestions": [
            "Generate a 5-question mock test on this summary",
            "Explain key definitions in simpler terms",
            "What are the most likely exam questions for this chapter?"
        ],
        "executed_steps": state.get("executed_steps", []) + [executed_step]
    }
