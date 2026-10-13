from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import get_current_user
from app.database.models import SummaryRequest, SummaryResponse
from app.tools.summary_tools import generate_summary_tool
from app.services.document_service import get_document_by_id

router = APIRouter()

@router.post("/generate", response_model=SummaryResponse)
async def generate_summary(
    req: SummaryRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    doc = await get_document_by_id(req.document_id, user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await generate_summary_tool(
        document_id=req.document_id,
        summary_type=req.summary_type,
        custom_instruction=req.custom_instruction,
        chapter_or_topic=req.chapter_or_topic
    )
    return result
