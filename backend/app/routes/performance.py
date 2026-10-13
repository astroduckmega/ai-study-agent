from typing import Optional, List
from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.database.models import PerformanceOverview, WeakTopicRecord
from app.services.study_service import get_student_performance_overview
from app.tools.analytics_tools import analyze_weak_topics_tool

router = APIRouter()

@router.get("/overview", response_model=PerformanceOverview)
async def get_performance_overview(
    document_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    data = await get_student_performance_overview(user_id=user_id, document_id=document_id)
    return data

@router.get("/weak-topics", response_model=List[WeakTopicRecord])
async def get_weak_topics(
    document_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    weak_topics = await analyze_weak_topics_tool(user_id=user_id, document_id=document_id)
    return weak_topics
