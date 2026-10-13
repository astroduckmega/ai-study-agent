import re
import logging
from typing import Dict, Any
from app.agents.state import AgentState
from app.tools.test_tools import generate_mock_test_tool, generate_personalized_test_tool

logger = logging.getLogger("app.agents.test")

async def mock_test_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Mock Test Agent Node in LangGraph.
    Parses question count and difficulty parameters, generates validated test questions from PDF,
    and returns interactive test structure.
    """
    logger.info("Executing Mock Test Agent Node...")
    prompt = state.get("user_prompt", "").lower()
    doc_id = state.get("document_id")
    user_id = state.get("user_id", "anonymous")

    if not doc_id:
        return {
            "error": "Please select a study document to generate a mock test from.",
            "final_output": "Please upload or select a study document to generate practice questions."
        }

    # Extract number of questions if mentioned in prompt
    num_questions = 5
    match_num = re.search(r'\b(5|10|15|20|25|30)\b', prompt)
    if match_num:
        num_questions = int(match_num.group(1))

    # Difficulty
    difficulty = "medium"
    if "easy" in prompt:
        difficulty = "easy"
    elif "hard" in prompt or "difficult" in prompt or "advanced" in prompt:
        difficulty = "hard"

    # Question Type
    q_type = "mixed"
    if "mcq" in prompt or "multiple choice" in prompt:
        q_type = "mcq"
    elif "true false" in prompt or "true/false" in prompt:
        q_type = "true_false"
    elif "short answer" in prompt:
        q_type = "short_answer"

    # Check if request is personalized on weak topics
    if "weak" in prompt or "mistake" in prompt or "wrong" in prompt:
        test_result = await generate_personalized_test_tool(
            user_id=user_id,
            document_id=doc_id,
            difficulty=difficulty,
            num_questions=num_questions
        )
    else:
        test_result = await generate_mock_test_tool(
            document_id=doc_id,
            user_id=user_id,
            num_questions=num_questions,
            difficulty=difficulty,
            question_type=q_type,
            time_limit_minutes=max(5, num_questions * 2)
        )

    executed_step = {
        "step_number": len(state.get("executed_steps", [])) + 1,
        "agent_name": "mock_test_agent",
        "action": f"Generated {len(test_result['questions'])}-question {difficulty} mock test ({q_type}).",
        "status": "completed",
        "output_summary": f"Test ID: {test_result['test_id']} with {len(test_result['questions'])} validated questions."
    }

    return {
        "test_data": test_result,
        "final_output": f"Generated a {len(test_result['questions'])}-question mock test titled '{test_result['title']}'. Click 'Take Test' to start your interactive practice exam.",
        "follow_up_suggestions": [
            "Start the test now",
            "Generate a harder test on formulas",
            "Give me a quick review of the key topics first"
        ],
        "executed_steps": state.get("executed_steps", []) + [executed_step]
    }
