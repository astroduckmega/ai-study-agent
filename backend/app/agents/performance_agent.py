import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.tools.analytics_tools import get_test_history_tool, analyze_weak_topics_tool
from app.llm.provider import invoke_llm_text
from app.llm.prompts import PERFORMANCE_ANALYSIS_SYSTEM_PROMPT

logger = logging.getLogger("app.agents.performance")

async def performance_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Performance & Personalized Learning Agent Node in LangGraph.
    Synthesizes test history, identifies persistent knowledge gaps, and prescribes learning paths.
    """
    logger.info("Executing Performance Agent Node...")
    user_id = state.get("user_id", "anonymous")
    doc_id = state.get("document_id")

    history = await get_test_history_tool(user_id=user_id, document_id=doc_id, limit=10)
    weak_topics = await analyze_weak_topics_tool(user_id=user_id, document_id=doc_id)

    total_tests = len(history)
    avg_score = round(sum(h.get("score_percentage", 0) for h in history) / total_tests, 1) if total_tests > 0 else 0.0

    history_summary = f"Total tests: {total_tests}, Average score: {avg_score}%\n"
    for h in history[:5]:
        history_summary += f"- Test: {h.get('document_name')}, Score: {h.get('score_percentage')}%, Weak: {', '.join(h.get('weak_topics_identified', []))}\n"

    weak_summary = "\n".join([f"- {w.get('topic')}: {w.get('incorrect_attempts', 0)} mistakes out of {w.get('total_questions_attempted', 0)} attempts ({int(w.get('error_rate', 0)*100)}% error rate)" for w in weak_topics])

    analysis_prompt = f"""Student Performance History:
{history_summary}

Weak Topics Recorded:
{weak_summary or 'No recorded mistakes yet.'}

Provide an encouraging, concise study diagnostic:
1. Identify the top 2-3 topics needing immediate attention.
2. Outline specific steps for revision.
3. Recommend whether the student is ready for an advanced practice test.
"""

    analysis_text = await invoke_llm_text(
        system_prompt=PERFORMANCE_ANALYSIS_SYSTEM_PROMPT,
        user_prompt=analysis_prompt
    )

    executed_step = {
        "step_number": len(state.get("executed_steps", [])) + 1,
        "agent_name": "performance_agent",
        "action": f"Analyzed {total_tests} past tests and identified {len(weak_topics)} weak topics.",
        "status": "completed",
        "output_summary": f"Average Score: {avg_score}%. Persistent weak areas: {[w.get('topic') for w in weak_topics[:3]]}."
    }

    performance_payload = {
        "total_tests": total_tests,
        "average_score": avg_score,
        "weak_topics": weak_topics,
        "recent_tests": history[:5],
        "diagnostic_text": analysis_text
    }

    return {
        "performance_data": performance_payload,
        "final_output": analysis_text,
        "follow_up_suggestions": [
            "Generate a remedial test on my weak topics now",
            "Summarize the hardest topics for me",
            "Ask a clarifying question on my weakest topic"
        ],
        "executed_steps": state.get("executed_steps", []) + [executed_step]
    }
