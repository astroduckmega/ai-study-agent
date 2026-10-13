import uuid
import logging
from typing import Dict, Any, List
from datetime import datetime
from app.database.connection import get_db
from app.tools.analytics_tools import save_test_result_tool, update_weak_topics_after_test

logger = logging.getLogger("app.tools.evaluation")

async def evaluate_answers_tool(
    test_id: str,
    user_id: str,
    student_answers: List[Dict[str, str]], # [{"question_id": "q1", "selected_answer": "..."}]
    time_taken_seconds: int = 0
) -> Dict[str, Any]:
    """
    Tool: Objectively scores a test, provides explanations, identifies weak areas, and persists results.
    """
    db = get_db()
    test_record = await db["tests"].find_one({"_id": test_id})
    if not test_record:
        raise ValueError(f"Test with ID {test_id} not found.")

    questions_map = {q["question_id"]: q for q in test_record.get("questions", [])}
    results = []
    correct_count = 0
    total_questions = len(questions_map)
    topic_scores: Dict[str, Dict[str, int]] = {} # topic -> {correct: 0, total: 0}

    # Map student answers
    answer_dict = {a["question_id"]: a["selected_answer"] for a in student_answers}

    for q_id, q_data in questions_map.items():
        stu_ans = answer_dict.get(q_id, "").strip()
        correct_ans = q_data.get("correct_answer", "").strip()
        topic = q_data.get("topic", "General")

        if topic not in topic_scores:
            topic_scores[topic] = {"correct": 0, "total": 0}
        topic_scores[topic]["total"] += 1

        is_correct = False
        score_awarded = 0.0

        # Normalization comparison for MCQ & True/False
        if q_data.get("question_type") in ["mcq", "true_false"]:
            if stu_ans and correct_ans and (stu_ans.lower() == correct_ans.lower() or stu_ans.lower().startswith(correct_ans.lower()[:3])):
                is_correct = True
                score_awarded = 1.0
        else:
            # Short answer keyword / length heuristic
            if stu_ans and len(stu_ans) > 5 and any(word in stu_ans.lower() for word in correct_ans.lower().split()[:3]):
                is_correct = True
                score_awarded = 1.0
            elif stu_ans and len(stu_ans) > 15:
                is_correct = True
                score_awarded = 0.75

        if is_correct:
            correct_count += 1
            topic_scores[topic]["correct"] += 1

        results.append({
            "question_id": q_id,
            "question": q_data.get("question", ""),
            "topic": topic,
            "student_answer": stu_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "score_awarded": score_awarded,
            "explanation": q_data.get("explanation", ""),
            "page_reference": q_data.get("page_reference", 1)
        })

    score_percentage = round((correct_count / total_questions * 100) if total_questions > 0 else 0.0, 1)
    accuracy = round((correct_count / total_questions) if total_questions > 0 else 0.0, 2)
    incorrect_count = total_questions - correct_count

    weak_topics = []
    strong_topics = []
    for topic, stats in topic_scores.items():
        rate = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
        if rate < 0.6:
            weak_topics.append(topic)
        else:
            strong_topics.append(topic)

    # Feedback generation
    if score_percentage >= 80:
        feedback = "Outstanding performance! You have a solid grasp of this material. Ready for harder problems."
    elif score_percentage >= 50:
        feedback = f"Good effort! You showed strength in {', '.join(strong_topics[:2]) or 'basic concepts'}, but need more revision on {', '.join(weak_topics[:2]) or 'advanced topics'}."
    else:
        feedback = f"Needs focused review. We recommend checking the summary and re-taking a targeted quiz on: {', '.join(weak_topics[:2]) or 'core chapters'}."

    result_id = str(uuid.uuid4())
    evaluation_result = {
        "_id": result_id,
        "result_id": result_id,
        "test_id": test_id,
        "user_id": user_id,
        "document_id": test_record.get("document_id"),
        "document_name": test_record.get("document_name", "Document"),
        "total_questions": total_questions,
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "score_percentage": score_percentage,
        "accuracy": accuracy,
        "time_taken_seconds": time_taken_seconds,
        "questions_result": results,
        "weak_topics_identified": weak_topics,
        "strong_topics_identified": strong_topics,
        "improvement_feedback": feedback,
        "submitted_at": datetime.utcnow()
    }

    # Save to history & update weak topics
    await save_test_result_tool(evaluation_result)
    await update_weak_topics_after_test(user_id, test_record.get("document_id"), test_record.get("document_name"), topic_scores)

    return evaluation_result
