"""
Services Package: Auth, Document Management, and Study Services
"""
from app.services.auth_service import get_current_user, create_access_token, get_password_hash, verify_password
from app.services.document_service import process_and_store_pdf, get_user_documents, get_document_by_id
from app.services.study_service import handle_chat_message, get_student_performance_overview

__all__ = [
    "get_current_user",
    "create_access_token",
    "get_password_hash",
    "verify_password",
    "process_and_store_pdf",
    "get_user_documents",
    "get_document_by_id",
    "handle_chat_message",
    "get_student_performance_overview"
]
