from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.database.models import ChatRequest, ChatResponse
from app.services.study_service import handle_chat_message
from app.database.connection import get_db

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    response = await handle_chat_message(
        user_id=user_id,
        message=req.message,
        document_id=req.document_id,
        session_id=req.session_id
    )
    return response

@router.get("/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    document_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    db = get_db()
    query: Dict[str, Any] = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id
    if document_id:
        query["document_id"] = document_id

    cursor = db["chat_history"].find(query).sort("created_at", 1).limit(50)
    messages = await cursor.to_list(length=50)
    for m in messages:
        m["id"] = str(m.get("_id", ""))
    return messages
