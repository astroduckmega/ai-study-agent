from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import get_current_user
from app.database.models import (
    MockTestCreateRequest,
    MockTestResponse,
    PersonalizedTestRequest,
    TestSubmissionRequest,
    TestEvaluationResponse
)
from app.tools.test_tools import generate_mock_test_tool, generate_personalized_test_tool
from app.tools.evaluation_tools import evaluate_answers_tool
from app.tools.analytics_tools import get_test_history_tool
from app.database.connection import get_db

router = APIRouter()

@router.post("/generate", response_model=MockTestResponse)
async def generate_test(
    req: MockTestCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    test_record = await generate_mock_test_tool(
        document_id=req.document_id,
        user_id=user_id,
        num_questions=req.num_questions,
        difficulty=req.difficulty,
        question_type=req.question_type,
        specific_topics=req.specific_topics,
        time_limit_minutes=req.time_limit_minutes or 15
    )
    return test_record

@router.get("/{test_id}", response_model=MockTestResponse)
async def get_test(
    test_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    test = await db["tests"].find_one({"_id": test_id})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.post("/submit", response_model=TestEvaluationResponse)
async def submit_test(
    submission: TestSubmissionRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    evaluation = await evaluate_answers_tool(
        test_id=submission.test_id,
        user_id=user_id,
        student_answers=[a.dict() for a in submission.answers],
        time_taken_seconds=submission.time_taken_seconds or 0
    )
    return evaluation

@router.get("/history", response_model=List[TestEvaluationResponse])
async def get_history(
    document_id: Optional[str] = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    history = await get_test_history_tool(user_id=user_id, document_id=document_id, limit=limit)
    return history

@router.post("/personalized", response_model=MockTestResponse)
async def generate_personalized_test(
    req: PersonalizedTestRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    test = await generate_personalized_test_tool(
        user_id=user_id,
        document_id=req.document_id,
        difficulty=req.difficulty,
        num_questions=req.num_questions
    )
    return test
