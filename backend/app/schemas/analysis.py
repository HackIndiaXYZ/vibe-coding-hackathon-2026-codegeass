"""Pydantic models for LexiGuard analysis responses."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class RiskLevel(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
    SAFE = "safe"


class RiskCategory(str, Enum):
    HAZARD = "critical_hazard"
    HIDDEN_FEE = "hidden_fee"
    EXIT_CLAUSE = "exit_clause"
    GENERAL = "general"


class ClauseRisk(BaseModel):
    """A single risky clause identified in the contract."""
    id: str = Field(..., description="Unique identifier for the clause")
    text: str = Field(..., description="Original clause text from the contract")
    risk_level: RiskLevel = Field(..., description="Severity of the risk")
    category: RiskCategory = Field(..., description="Category of risk")
    plain_english: str = Field(..., description="Plain English translation of the clause")
    explanation: str = Field(..., description="Why this clause is risky")
    page: int = Field(default=1, description="Page number where clause appears")
    paragraph: int = Field(default=0, description="Paragraph index on the page")


class GhostClause(BaseModel):
    """A missing clause that should be present in the contract."""
    id: str = Field(..., description="Unique identifier")
    title: str = Field(..., description="What is missing")
    description: str = Field(..., description="Why this matters")
    risk_level: RiskLevel = Field(default=RiskLevel.WARNING)
    suggested_language: str = Field(..., description="Suggested clause text to add")
    category: str = Field(default="missing_protection", description="Type of missing protection")


class ComparisonItem(BaseModel):
    """Comparison of a contract term against industry standards."""
    term: str = Field(..., description="The contract term being compared")
    your_contract: str = Field(..., description="What your contract says")
    industry_standard: str = Field(..., description="What is standard in the industry")
    verdict: str = Field(..., description="better, standard, or worse")
    details: str = Field(default="", description="Additional context")


class ComparisonResult(BaseModel):
    """Overall comparison results."""
    contract_type: str = Field(default="general", description="Detected contract type")
    items: list[ComparisonItem] = Field(default_factory=list)
    summary: str = Field(default="", description="Overall comparison summary")


class CounterOfferRequest(BaseModel):
    """Request to generate counter-offer for a clause."""
    clause_text: str = Field(..., description="The risky clause text")
    risk_level: str = Field(..., description="The risk level")
    context: str = Field(default="", description="Additional context about the contract")
    contract_type: str = Field(default="general", description="Type of contract")


class CounterOfferPoint(BaseModel):
    """A single counter-offer negotiation point."""
    bullet: str = Field(..., description="The counter-offer point text")
    tone: str = Field(default="professional", description="Tone of the point")


class CounterOfferResponse(BaseModel):
    """Response containing counter-offer negotiation points."""
    original_clause: str
    points: list[CounterOfferPoint] = Field(default_factory=list)
    email_snippet: str = Field(default="", description="Ready-to-send email paragraph")


class ExtractedPage(BaseModel):
    """Text extracted from a single PDF page."""
    page_number: int
    content: str
    paragraphs: list[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    """Complete analysis response from LexiGuard."""
    filename: str
    total_pages: int = Field(default=0)
    risk_score: int = Field(default=0, ge=0, le=100)
    risk_summary: str = Field(default="")
    contract_type: str = Field(default="general")
    clauses: list[ClauseRisk] = Field(default_factory=list)
    ghost_clauses: list[GhostClause] = Field(default_factory=list)
    comparison: ComparisonResult = Field(default_factory=ComparisonResult)
    extracted_text: list[ExtractedPage] = Field(default_factory=list)
