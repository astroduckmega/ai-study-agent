import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.tools.evaluation_tools import evaluate_answers_tool

logger = logging.getLogger("app.agents.evaluation")

async def evaluation_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Test Evaluation Agent Node in LangGraph.
    Grades submitted answers, explains correct/incorrect logic, and diagnoses weak areas.
    """
    logger.info("Executing Test Evaluation Agent Node...")
    eval_input = state.get("evaluation_data") or {}
    test_id = eval_input.get("test_id")
    student_answers = eval_input.get("answers", [])
    user_id = state.get("user_id", "anonymous")
    time_taken = eval_input.get("time_taken_seconds", 0)

    if not test_id:
        return {
            "error": "No test ID provided for evaluation.",
            "final_output": "Please submit your completed answers for evaluation."
        }

    eval_result = await evaluate_answers_tool(
        test_id=test_id,
        user_id=user_id,
        student_answers=student_answers,
        time_taken_seconds=time_taken
    )

    executed_step = {
        "step_number": len(state.get("executed_steps", [])) + 1,
        "agent_name": "evaluation_agent",
        "action": f"Evaluated {eval_result['total_questions']} answers. Calculated score: {eval_result['score_percentage']}%.",
        "status": "completed",
        "output_summary": f"Correct: {eval_result['correct_count']}/{eval_result['total_questions']}. Weak topics: {eval_result['weak_topics_identified']}."
    }

    return {
        "evaluation_data": eval_result,
        "final_output": f"Test Evaluation Complete: You scored {eval_result['score_percentage']}% ({eval_result['correct_count']}/{eval_result['total_questions']} correct). {eval_result['improvement_feedback']}",
        "follow_up_suggestions": [
            "Explain my incorrect answers in detail",
            "Generate a remedial test on my weak topics",
            "Show my overall score trend across all tests"
        ],
        "executed_steps": state.get("executed_steps", []) + [executed_step]
    }
