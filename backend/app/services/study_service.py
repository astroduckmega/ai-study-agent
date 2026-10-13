import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.agents.coordinator import get_coordinator_agent

logger = logging.getLogger("app.services.study")

async def handle_chat_message(
    user_id: str,
    message: str,
    document_id: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Processes a student chat message through the LangGraph Coordinator Agent,
    persisting conversation memory and citations.
    """
    db = get_db()
    sess_id = session_id or str(uuid.uuid4())

    # Execute Coordinator
    coordinator = get_coordinator_agent()
    result_state = await coordinator.execute(
        user_prompt=message,
        user_id=user_id,
        document_id=document_id,
        session_id=sess_id
    )

    qa_payload = result_state.get("qa_data") or {}
    citations = qa_payload.get("citations", [])
    agent_steps = result_state.get("executed_steps", [])
    final_output = result_state.get("final_output", "")
    follow_ups = result_state.get("follow_up_suggestions", [])

    # Persist message history in DB
    chat_entry = {
        "user_id": user_id,
        "session_id": sess_id,
        "document_id": document_id,
        "student_prompt": message,
        "agent_response": final_output,
        "citations": citations,
        "executed_steps": agent_steps,
        "created_at": datetime.utcnow()
    }
    await db["chat_history"].insert_one(chat_entry)

    return {
        "session_id": sess_id,
        "message": final_output,
        "citations": citations,
        "agent_steps": agent_steps,
        "suggested_followups": follow_ups,
        "test_data": result_state.get("test_data"),
        "summary_data": result_state.get("summary_data")
    }


async def get_student_performance_overview(user_id: str, document_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Synthesizes test results, weak topics, and study activity into a comprehensive analytics payload.
    """
    db = get_db()
    query = {"user_id": user_id}
    if document_id:
        query["document_id"] = document_id

    # Test history
    cursor = db["test_results"].find(query).sort("submitted_at", -1)
    test_history = await cursor.to_list(length=50)

    total_tests = len(test_history)
    total_questions = sum(t.get("total_questions", 0) for t in test_history)
    total_correct = sum(t.get("correct_count", 0) for t in test_history)

    avg_score = round(sum(t.get("score_percentage", 0) for t in test_history) / total_tests, 1) if total_tests > 0 else 0.0
    overall_accuracy = round(total_correct / total_questions, 2) if total_questions > 0 else 0.0

    # Weak topics
    weak_cursor = db["weak_topics"].find(query).sort("error_rate", -1)
    weak_records = await weak_cursor.to_list(length=20)
    for w in weak_records:
        w["id"] = str(w.get("_id", ""))

    strong_topics = set()
    for t in test_history:
        for st in t.get("strong_topics_identified", []):
            strong_topics.add(st)

    # Format recent tests for frontend charts
    recent_tests_formatted = []
    for t in test_history[:10]:
        recent_tests_formatted.append({
            "test_id": str(t.get("_id", "")),
            "document_name": t.get("document_name", "Practice Test"),
            "score": t.get("score_percentage", 0),
            "correct": t.get("correct_count", 0),
            "total": t.get("total_questions", 0),
            "date": t.get("submitted_at", datetime.utcnow()).strftime("%b %d, %H:%M")
        })

    recommendations = []
    if weak_records:
        top_weak = [w["topic"] for w in weak_records[:3]]
        recommendations.append(f"Focus revision on: {', '.join(top_weak)}.")
        recommendations.append("Generate a 5-question targeted remedial quiz to solidify these weak points.")
    else:
        recommendations.append("Keep up regular study testing to build your personalized mastery index.")
        recommendations.append("Upload additional chapters or mock exams for deeper practice.")

    return {
        "total_tests_taken": total_tests,
        "average_score": avg_score,
        "overall_accuracy": overall_accuracy,
        "total_questions_answered": total_questions,
        "weak_topics": weak_records,
        "strong_topics": list(strong_topics)[:10],
        "recent_tests": recent_tests_formatted,
        "recommendations": recommendations,
        "study_activity_streak_days": min(7, total_tests + 1)
    }
