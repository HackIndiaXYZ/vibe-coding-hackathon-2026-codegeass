"""LLM-powered contract analysis using Google Gemini with few-shot prompting."""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

ANALYSIS_SYSTEM_PROMPT = """You are a senior litigator and legal risk analyst with 20 years of experience reviewing contracts. Your role is to protect the weaker party (tenant, employee, customer) from predatory, unfair, or hidden terms.

Analyze the provided contract text and output a JSON object with the following structure. Be thorough, precise, and err on the side of caution — flag anything that could disadvantage the weaker party.

Output ONLY valid JSON with this exact structure:
{
  "risk_score": <integer 0-100, where 0 is safe and 100 is extremely risky>,
  "risk_summary": "<2-3 sentence overall assessment>",
  "contract_type": "<rental|employment|saas|service|nda|freelance|general>",
  "clauses": [
    {
      "id": "clause_<number>",
      "text": "<exact quote from contract>",
      "risk_level": "<critical|warning|info>",
      "category": "<critical_hazard|hidden_fee|exit_clause|general>",
      "plain_english": "<what this clause actually means in simple language>",
      "explanation": "<why this is risky and what the user should watch out for>",
      "page": <page number>,
      "paragraph": <paragraph index on that page>
    }
  ]
}

CLASSIFICATION RULES:
- "critical_hazard": Clauses that could cause significant financial, legal, or personal harm. Examples: unlimited liability, automatic renewal with no exit, waiver of legal rights, unilateral modification rights.
- "hidden_fee": Clauses that impose costs not immediately obvious. Examples: late fees, administrative charges, escalation clauses, charges for standard maintenance.
- "exit_clause": Clauses related to termination, cancellation, or exit. Examples: early termination penalties, notice period requirements, non-compete post-termination, forfeit of deposits.
- "general": Other clauses worth noting that don't fit the above categories.

RISK SCORING:
- 0-20: Standard, fair contract with minor observations
- 21-40: Some clauses worth negotiating but generally reasonable
- 41-60: Several concerning clauses that could disadvantage the weaker party
- 61-80: Multiple high-risk clauses, strongly recommend legal review
- 81-100: Highly predatory contract, do not sign without major revisions

FEW-SHOT EXAMPLES:

Example 1 - Rental Agreement Clause:
Input: "The Landlord reserves the right to increase rent at any time during the lease period with 7 days written notice."
Output clause:
{
  "id": "clause_1",
  "text": "The Landlord reserves the right to increase rent at any time during the lease period with 7 days written notice.",
  "risk_level": "critical",
  "category": "critical_hazard",
  "plain_english": "Your landlord can raise your rent whenever they want, and they only need to tell you 7 days before the increase takes effect.",
  "explanation": "Most jurisdictions require 30-60 days notice for rent increases, and many prohibit mid-lease increases entirely. A 7-day notice period is extremely aggressive and could lead to sudden, unaffordable rent hikes.",
  "page": 1,
  "paragraph": 0
}

Example 2 - Hidden Fee:
Input: "A non-refundable administrative fee of $500 shall be charged upon lease signing, separate from the security deposit."
Output clause:
{
  "id": "clause_2",
  "text": "A non-refundable administrative fee of $500 shall be charged upon lease signing, separate from the security deposit.",
  "risk_level": "warning",
  "category": "hidden_fee",
  "plain_english": "You pay $500 just for signing the lease, and you never get it back — this is on top of your security deposit.",
  "explanation": "Administrative fees are often used to extract additional non-refundable money. This $500 is essentially a hidden cost of moving in that you cannot recover.",
  "page": 1,
  "paragraph": 0
}"""


async def analyze_contract(full_text: str, pages_data: list[dict]) -> dict:
    """
    Analyze contract text using Google Gemini with few-shot prompting.
    
    Args:
        full_text: The complete contract text.
        pages_data: List of page data with page numbers and paragraphs.
    
    Returns:
        Parsed analysis result as a dictionary.
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        system_instruction=ANALYSIS_SYSTEM_PROMPT,
    )

    # Build the user prompt with page context
    page_context = ""
    for page in pages_data:
        page_context += f"\n--- PAGE {page['page_number']} ---\n"
        for i, para in enumerate(page['paragraphs']):
            page_context += f"[Paragraph {i}] {para}\n"

    user_prompt = f"""Analyze the following contract and return the structured JSON analysis.

CONTRACT TEXT:
{page_context}

Remember: Output ONLY valid JSON. Be thorough — flag every clause that could disadvantage the weaker party."""

    response = model.generate_content(
        user_prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        # Fallback: try to extract JSON from the response
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
        else:
            result = {
                "risk_score": 50,
                "risk_summary": "Analysis completed but response parsing failed. Please try again.",
                "contract_type": "general",
                "clauses": []
            }

    return result
