"""PDF text extraction service using pdfplumber (pure Python)."""

import pdfplumber
import io
from app.schemas.analysis import ExtractedPage


def extract_text_from_pdf(file_bytes: bytes) -> list[ExtractedPage]:
    """
    Extract text from a PDF file, organized by page and paragraphs.
    
    Args:
        file_bytes: Raw bytes of the uploaded PDF file.
    
    Returns:
        List of ExtractedPage objects with page content and paragraphs.
    """
    pages = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text() or ""

            # Split into paragraphs (double newline or significant whitespace)
            raw_paragraphs = text.split("\n\n")
            paragraphs = [
                p.strip().replace("\n", " ")
                for p in raw_paragraphs
                if p.strip() and len(p.strip()) > 10
            ]

            pages.append(ExtractedPage(
                page_number=page_num + 1,
                content=text.strip(),
                paragraphs=paragraphs,
            ))

    return pages


def get_pdf_metadata(file_bytes: bytes) -> dict:
    """Extract metadata from a PDF file."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        metadata = pdf.metadata or {}
        page_count = len(pdf.pages)

    return {
        "title": metadata.get("Title", ""),
        "author": metadata.get("Author", ""),
        "subject": metadata.get("Subject", ""),
        "page_count": page_count,
    }
