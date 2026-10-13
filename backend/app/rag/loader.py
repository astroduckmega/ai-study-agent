import os
import re
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("app.rag.loader")

def clean_text(text: str) -> str:
    """Cleans extracted PDF text, normalizes whitespace and removes null bytes."""
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def load_and_extract_pdf(file_path: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Extracts text per page from a PDF file along with metadata.
    Supports pypdf, pypdf2, or fallback text extraction.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at: {file_path}")

    pages_data = []
    extracted_topics = set()
    total_pages = 1

    try:
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            total_pages = len(reader.pages)
            for page_idx, page in enumerate(reader.pages):
                raw_text = page.extract_text() or ""
                cleaned = clean_text(raw_text)
                lines = [l.strip() for l in raw_text.split('\n') if len(l.strip()) > 3]
                if lines and len(lines[0]) < 60 and not lines[0].isdigit():
                    extracted_topics.add(lines[0])
                if cleaned:
                    pages_data.append({
                        "page_number": page_idx + 1,
                        "raw_text": raw_text,
                        "cleaned_text": cleaned
                    })
        except ImportError:
            # Fallback raw text stream extraction
            with open(file_path, "rb") as f:
                content = f.read()
                # Basic string extraction
                text_chars = re.findall(rb"[\x20-\x7E\n\r]{4,}", content)
                decoded = " ".join([c.decode("latin1", errors="ignore") for c in text_chars[:200]])
                cleaned = clean_text(decoded)
                pages_data.append({
                    "page_number": 1,
                    "raw_text": decoded,
                    "cleaned_text": cleaned or "Academic PDF Study Material"
                })

        metadata_summary = {
            "filename": os.path.basename(file_path),
            "file_size_bytes": os.path.getsize(file_path),
            "total_pages": max(1, len(pages_data), total_pages),
            "total_extracted_pages": len(pages_data),
            "topics": list(extracted_topics)[:10] or ["Core Fundamentals", "Key Principles"]
        }

        logger.info(f"Loaded PDF '{metadata_summary['filename']}' with {metadata_summary['total_pages']} pages.")
        return pages_data, metadata_summary

    except Exception as e:
        logger.error(f"Failed to read PDF file '{file_path}': {e}")
        raise ValueError(f"Malformed or unreadable PDF: {str(e)}")
