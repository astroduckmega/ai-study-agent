from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.services.auth_service import get_current_user
from app.services.document_service import process_and_store_pdf, get_user_documents, get_document_by_id, delete_document
from app.database.models import DocumentResponse

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    doc_record = await process_and_store_pdf(file=file, user_id=user_id)
    return doc_record

@router.get("", response_model=List[DocumentResponse])
async def list_documents(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("_id"))
    docs = await get_user_documents(user_id=user_id)
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    doc = await get_document_by_id(document_id=document_id, user_id=user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{document_id}")
async def remove_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("_id"))
    success = await delete_document(document_id=document_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return {"status": "success", "message": "Document deleted successfully"}
