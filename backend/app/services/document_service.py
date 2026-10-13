import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.database.connection import get_db
from app.rag.loader import load_and_extract_pdf
from app.rag.chunker import chunk_pdf_pages
from app.rag.vector_store import get_vector_store

logger = logging.getLogger("app.services.document")

async def process_and_store_pdf(file: UploadFile, user_id: str) -> Dict[str, Any]:
    """
    Validates uploaded PDF, saves it, extracts text and metadata,
    chunks pages, generates embeddings, and indexes into vector store.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are supported.")

    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Save uploaded file
    try:
        content = await file.read()
        # File size limit check
        if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.")
        with open(file_path, 'wb') as out_file:
            out_file.write(content)
    except Exception as e:
        logger.error(f"Failed to save uploaded PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Extract text & metadata
    try:
        pages_data, metadata_summary = load_and_extract_pdf(file_path)
    except Exception as e:
        logger.error(f"Error extracting PDF: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to process PDF content: {str(e)}")

    # Chunk PDF
    chunks = chunk_pdf_pages(
        pages_data=pages_data,
        document_id=doc_id,
        chunk_size=1000,
        chunk_overlap=200
    )

    # Vector store indexing
    vector_store = get_vector_store()
    vector_store.index_document_chunks(
        document_id=doc_id,
        filename=file.filename,
        chunks=chunks,
        user_id=user_id
    )

    doc_record = {
        "_id": doc_id,
        "id": doc_id,
        "user_id": user_id,
        "filename": file.filename,
        "file_path": file_path,
        "metadata": {
            "filename": file.filename,
            "file_size_bytes": metadata_summary["file_size_bytes"],
            "total_pages": metadata_summary["total_pages"],
            "total_chunks": len(chunks),
            "uploaded_at": datetime.utcnow(),
            "mime_type": "application/pdf",
            "topics": metadata_summary["topics"]
        },
        "status": "processed",
        "created_at": datetime.utcnow()
    }

    db = get_db()
    await db["documents"].insert_one(doc_record)
    logger.info(f"Document {doc_id} ('{file.filename}') processed and indexed with {len(chunks)} chunks.")

    return doc_record


async def get_user_documents(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves all documents uploaded by user."""
    db = get_db()
    cursor = db["documents"].find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    for d in docs:
        d["id"] = str(d.get("_id", ""))
    return docs


async def get_document_by_id(document_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetches a specific document by ID."""
    db = get_db()
    query = {"_id": document_id}
    if user_id:
        query["user_id"] = user_id
    doc = await db["documents"].find_one(query)
    if doc:
        doc["id"] = str(doc.get("_id", ""))
    return doc


async def delete_document(document_id: str, user_id: str) -> bool:
    """Deletes document record and associated file."""
    db = get_db()
    doc = await db["documents"].find_one({"_id": document_id, "user_id": user_id})
    if not doc:
        return False

    if os.path.exists(doc.get("file_path", "")):
        try:
            os.remove(doc["file_path"])
        except Exception as e:
            logger.warning(f"Failed to remove physical file: {e}")

    try:
        vector_store = get_vector_store()
        vector_store.delete_document_chunks(document_id=document_id)
    except Exception as e:
        logger.warning(f"Failed to remove vector store chunks: {e}")

    await db["documents"].delete_one({"_id": document_id})
    return True
