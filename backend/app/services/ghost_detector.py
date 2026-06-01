"""Ghost Clause Detector — identifies missing protections in contracts."""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

GHOST_CLAUSE_PROMPT = """You are a senior contract review specialist. Your job is to identify what is MISSING from a contract — the "ghost clauses" that should be present but are not.

Most AI tools summarize what IS in a contract. You identify what is NOT there but SHOULD be.

Based on the contract type and content provided, identify missing protections that could leave the weaker party exposed.

COMMON MISSING PROTECTIONS BY CONTRACT TYPE:

RENTAL/LEASE:
- Utility responsibility (who pays for water, sewage, electricity, internet)
- Maintenance and repair obligations (who handles what)
- Security deposit return timeline and conditions
- Subletting/assignment rights
- Guest policies and limitations
- Renewal terms and rent increase caps
- Right to quiet enjoyment
- Mold/pest/environmental hazard disclosure
- Notice requirements for landlord entry
- Insurance requirements

EMPLOYMENT:
- IP assignment scope limitations
- Non-compete geographic and time restrictions
- Termination notice period
- Severance terms
- Remote work policies
- Benefits continuation after termination
- Dispute resolution mechanism
- Overtime compensation
- Performance review process
- Data privacy and monitoring disclosure

SaaS/SERVICE:
- SLA guarantees and uptime commitments
- Data portability and export rights
- Liability caps
- Data breach notification requirements
- Service modification notice period
- Refund/credit policies
- Data deletion upon termination
- Intellectual property ownership
- Force majeure provisions
- Indemnification terms

Output ONLY valid JSON with this structure:
{
  "ghost_clauses": [
    {
      "id": "ghost_<number>",
      "title": "<what is missing>",
      "description": "<why this matters and what could happen without it>",
      "risk_level": "<critical|warning|info>",
      "suggested_language": "<exact text the user could propose adding to the contract>",
      "category": "<utility|maintenance|financial|termination|privacy|liability|rights|other>"
    }
  ]
}

Be specific. Don't list everything — only flag protections that are genuinely absent AND relevant to this specific contract type."""


async def detect_ghost_clauses(full_text: str, contract_type: str) -> list[dict]:
    """
    Detect missing clauses (ghost clauses) in a contract.
    
    Args:
        full_text: The complete contract text.
        contract_type: The detected type of contract.
    
    Returns:
        List of ghost clause dictionaries.
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        system_instruction=GHOST_CLAUSE_PROMPT,
    )

    user_prompt = f"""Analyze this {contract_type} contract for MISSING protections and clauses.

CONTRACT TEXT:
{full_text[:15000]}

Identify the most important missing protections. Focus on omissions that could cause real harm. Output ONLY valid JSON."""

    response = model.generate_content(
        user_prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.3,
        ),
    )

    try:
        result = json.loads(response.text)
        return result.get("ghost_clauses", [])
    except json.JSONDecodeError:
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
            return result.get("ghost_clauses", [])
        return []
