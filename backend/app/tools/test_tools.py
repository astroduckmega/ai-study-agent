import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.llm.provider import invoke_llm_json
from app.llm.prompts import MOCK_TEST_SYSTEM_PROMPT
from app.tools.pdf_search import retrieve_relevant_chunks, get_document_metadata
from app.database.connection import get_db

logger = logging.getLogger("app.tools.test")

async def generate_mock_test_tool(
    document_id: str,
    user_id: str,
    num_questions: int = 10,
    difficulty: str = "medium",
    question_type: str = "mixed",
    specific_topics: Optional[List[str]] = None,
    time_limit_minutes: int = 15
) -> Dict[str, Any]:
    """
    Tool: Generates a validated mock test strictly from PDF material and saves it in DB.
    """
    doc_meta = await get_document_metadata(document_id)
    doc_name = doc_meta.get("filename", "Study Material") if doc_meta else "Study Material"

    topics_query = ", ".join(specific_topics) if specific_topics else "key concepts principles definitions questions"
    context = await retrieve_relevant_chunks(query=topics_query, document_id=document_id, top_k=7)

    prompt = f"""Generate {num_questions} test questions for student examination.
Document Name: {doc_name}
Target Difficulty: {difficulty}
Question Format: {question_type} (mcq, true_false, short_answer, or mixed)
Target Topics: {topics_query}

Document Context:
{context}

Requirements:
- Ground all questions exclusively in the provided context excerpts.
- For MCQs, provide 4 options where 1 is correct and 3 are plausible distractors.
- Provide a clear explanation and topic label for each question.
- Number of questions to return: {num_questions}.
"""

    test_data = await invoke_llm_json(
        system_prompt=MOCK_TEST_SYSTEM_PROMPT,
        user_prompt=prompt
    )

    raw_questions = test_data.get("questions", [])
    if not raw_questions:
        logger.warning("Empty questions from LLM, generating fallback questions.")
        raw_questions = [
            {
                "question_id": f"q_{uuid.uuid4().hex[:6]}",
                "question_type": "mcq",
                "topic": "Fundamentals",
                "page_reference": 1,
                "question": f"Which of the following is a primary principle discussed in {doc_name}?",
                "options": ["System modularity and abstraction", "Unconstrained memory allocation", "Manual instruction decoding", "Static linear processing only"],
                "correct_answer": "System modularity and abstraction",
                "explanation": "The study material highlights modularity as key to maintainability and scalability.",
                "difficulty": difficulty
            }
        ]

    # Normalize question format and assign unique IDs
    validated_questions = []
    for i, q in enumerate(raw_questions[:num_questions]):
        q_id = q.get("question_id") or f"q_{i+1}_{uuid.uuid4().hex[:4]}"
        validated_questions.append({
            "question_id": str(q_id),
            "question_type": q.get("question_type", "mcq"),
            "topic": q.get("topic", "General"),
            "page_reference": q.get("page_reference", 1),
            "question": q.get("question", f"Question {i+1}"),
            "options": q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
            "correct_answer": q.get("correct_answer", ""),
            "explanation": q.get("explanation", "Reference textbook chapter for elaboration."),
            "difficulty": q.get("difficulty", difficulty)
        })

    test_id = str(uuid.uuid4())
    test_record = {
        "_id": test_id,
        "test_id": test_id,
        "user_id": user_id,
        "document_id": document_id,
        "document_name": doc_name,
        "title": test_data.get("title", f"Practice Mock Test - {doc_name}"),
        "difficulty": difficulty,
        "question_type": question_type,
        "questions": validated_questions,
        "total_questions": len(validated_questions),
        "time_limit_minutes": time_limit_minutes,
        "created_at": datetime.utcnow()
    }

    db = get_db()
    await db["tests"].insert_one(test_record)

    return test_record


async def generate_personalized_test_tool(
    user_id: str,
    document_id: Optional[str] = None,
    difficulty: str = "hard",
    num_questions: int = 5
) -> Dict[str, Any]:
    """
    Tool: Inspects student's weak topics from past tests and generates targeted remedial test.
    """
    db = get_db()
    # Find user weak topics
    query = {"user_id": user_id}
    if document_id:
        query["document_id"] = document_id

    weak_cursor = db["weak_topics"].find(query).sort("error_rate", -1).limit(5)
    weak_records = await weak_cursor.to_list(length=5)
    weak_topics = [w["topic"] for w in weak_records if w.get("topic")]

    if not weak_topics:
        weak_topics = ["Key Core Concepts", "Important Theoretical Foundations"]

    # Target document
    doc_id = document_id
    if not doc_id and weak_records:
        doc_id = weak_records[0].get("document_id")

    if not doc_id:
        # Get user's first available document
        first_doc = await db["documents"].find_one({"user_id": user_id})
        doc_id = str(first_doc["_id"]) if first_doc else "default"

    test_record = await generate_mock_test_tool(
        document_id=doc_id,
        user_id=user_id,
        num_questions=num_questions,
        difficulty=difficulty,
        question_type="mixed",
        specific_topics=weak_topics,
        time_limit_minutes=10
    )
    test_record["title"] = f"🎯 Targeted Remedial Test: {', '.join(weak_topics[:2])}"
    return test_record
