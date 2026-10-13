import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.database.connection import get_db

logger = logging.getLogger("app.tools.analytics")

async def save_test_result_tool(result_data: Dict[str, Any]) -> str:
    """
    Tool: Persists evaluated test result in the MongoDB test_results collection.
    """
    db = get_db()
    await db["test_results"].insert_one(result_data)
    return str(result_data.get("_id"))

async def update_weak_topics_after_test(
    user_id: str,
    document_id: str,
    document_name: str,
    topic_scores: Dict[str, Dict[str, int]]
):
    """
    Updates student's cumulative weak topics registry based on new test metrics.
    """
    db = get_db()
    for topic, stats in topic_scores.items():
        incorrect = stats["total"] - stats["correct"]
        error_rate = incorrect / stats["total"] if stats["total"] > 0 else 0.0

        existing = await db["weak_topics"].find_one({
            "user_id": user_id,
            "document_id": document_id,
            "topic": topic
        })

        if existing:
            tot_att = existing.get("total_questions_attempted", 0) + stats["total"]
            tot_inc = existing.get("incorrect_attempts", 0) + incorrect
            new_err_rate = round(tot_inc / tot_att if tot_att > 0 else 0.0, 2)

            await db["weak_topics"].update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        "total_questions_attempted": tot_att,
                        "incorrect_attempts": tot_inc,
                        "error_rate": new_err_rate,
                        "last_tested_at": datetime.utcnow(),
                        "recommended_action": "Generate personalized quiz on this topic" if new_err_rate > 0.4 else "Maintain review"
                    }
                }
            )
        else:
            await db["weak_topics"].insert_one({
                "user_id": user_id,
                "document_id": document_id,
                "document_name": document_name,
                "topic": topic,
                "total_questions_attempted": stats["total"],
                "incorrect_attempts": incorrect,
                "error_rate": round(error_rate, 2),
                "last_tested_at": datetime.utcnow(),
                "recommended_action": "Review key chapter definitions" if error_rate > 0.3 else "Solid understanding"
            })

async def get_test_history_tool(user_id: str, document_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Tool: Retrieves chronological test results for a student.
    """
    db = get_db()
    query = {"user_id": user_id}
    if document_id:
        query["document_id"] = document_id

    cursor = db["test_results"].find(query).sort("submitted_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        it["id"] = str(it.get("_id", ""))
    return items

async def analyze_weak_topics_tool(user_id: str, document_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Tool: Retrieves ranked list of student's weak areas across past exams.
    """
    db = get_db()
    query = {"user_id": user_id}
    if document_id:
        query["document_id"] = document_id

    cursor = db["weak_topics"].find(query).sort("error_rate", -1).limit(10)
    records = await cursor.to_list(length=10)
    return records
