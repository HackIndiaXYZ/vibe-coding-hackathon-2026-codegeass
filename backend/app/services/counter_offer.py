"""Counter-offer generator — produces negotiation bullet points for risky clauses."""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

COUNTER_OFFER_PROMPT = """You are a seasoned contract negotiation expert. Given a risky clause from a contract, generate practical counter-offer points that the weaker party can use to negotiate better terms.

Your response should be:
1. Professional and assertive in tone
2. Legally sound and reasonable
3. Ready to copy-paste into an email or letter

Output ONLY valid JSON with this structure:
{
  "original_clause": "<the clause being countered>",
  "points": [
    {
      "bullet": "<a specific, actionable counter-offer point>",
      "tone": "professional"
    }
  ],
  "email_snippet": "<a ready-to-send paragraph incorporating all three points, written as if addressing the other party>"
}

Generate exactly 3 counter-offer bullet points. Each should propose a specific, concrete change.

EXAMPLE:
Original clause: "The Landlord may terminate the lease at any time with 15 days notice."
Counter-offer points:
1. "I'd like to request that the termination notice period be extended to 60 days for both parties, which aligns with standard rental practices and provides adequate time to find alternative housing."
2. "I propose adding a clause that limits termination to 'for cause' reasons (non-payment, property damage, or lease violations), preventing arbitrary displacement."
3. "I'd also like to include a relocation assistance provision of one month's rent if the landlord terminates the lease without cause during the first 12 months."
"""


async def generate_counter_offer(clause_text: str, risk_level: str, context: str = "", contract_type: str = "general") -> dict:
    """
    Generate counter-offer negotiation points for a risky clause.
    
    Args:
        clause_text: The risky clause text.
        risk_level: The risk level of the clause.
        context: Additional context about the contract.
        contract_type: Type of contract.
    
    Returns:
        Counter-offer response dictionary.
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        system_instruction=COUNTER_OFFER_PROMPT,
    )

    user_prompt = f"""Generate counter-offer points for this risky clause from a {contract_type} contract.

RISKY CLAUSE (Risk Level: {risk_level}):
"{clause_text}"

{f'ADDITIONAL CONTEXT: {context}' if context else ''}

Generate 3 specific, actionable counter-offer bullet points and a ready-to-send email paragraph. Output ONLY valid JSON."""

    response = model.generate_content(
        user_prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
        else:
            result = {
                "original_clause": clause_text,
                "points": [
                    {"bullet": "Request specific modifications to this clause.", "tone": "professional"}
                ],
                "email_snippet": "I would like to discuss modifications to certain terms in the contract."
            }

    return result
