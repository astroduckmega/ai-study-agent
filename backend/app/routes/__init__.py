"""
API Routes Package
"""
from fastapi import APIRouter
from app.routes.auth import router as auth_router
from app.routes.documents import router as documents_router
from app.routes.summary import router as summary_router
from app.routes.chat import router as chat_router
from app.routes.tests import router as tests_router
from app.routes.performance import router as performance_router
from app.routes.coordinator import router as coordinator_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(documents_router, prefix="/documents", tags=["Documents & RAG"])
api_router.include_router(summary_router, prefix="/summary", tags=["Summary Agent"])
api_router.include_router(chat_router, prefix="/chat", tags=["Ask PDF & Chat"])
api_router.include_router(tests_router, prefix="/tests", tags=["Mock Test & Evaluation"])
api_router.include_router(performance_router, prefix="/performance", tags=["Performance & Personalized Learning"])
api_router.include_router(coordinator_router, prefix="/coordinator", tags=["Coordinator Agent"])

__all__ = ["api_router"]
