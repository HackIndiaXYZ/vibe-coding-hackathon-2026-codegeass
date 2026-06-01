"""Industry Comparison Generator — compares contract terms against market standards."""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

COMPARISON_PROMPT = """You are a senior contract analyst with deep knowledge of industry benchmarks.
Your job is to compare the provided contract's terms against standard market practices.

Based on the contract type and content, identify 3 to 5 key terms (e.g., Notice Period, Liability Cap, Payment Terms, Non-compete duration).
For each term, state what the contract says, what the industry standard is, and provide a verdict (better, standard, or worse).

Output ONLY valid JSON with this exact structure:
{
  "contract_type": "<detected contract type>",
  "summary": "<Brief 2-sentence summary of how this contract compares to market standards>",
  "items": [
    {
      "term": "<e.g., Notice Period>",
      "your_contract": "<e.g., 7 days>",
      "industry_standard": "<e.g., 30 days>",
      "verdict": "<better|standard|worse>",
      "details": "<Brief explanation of the difference>"
    }
  ]
}
"""

async def compare_to_industry(full_text: str, contract_type: str = "general") -> dict:
    """
    Compare contract terms to industry standards.
    
    Args:
        full_text: The complete contract text.
        contract_type: The detected type of contract.
    
    Returns:
        Dictionary containing comparison results.
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        system_instruction=COMPARISON_PROMPT,
    )

    user_prompt = f"""Compare this {contract_type} contract against industry benchmarks.

CONTRACT TEXT:
{full_text[:15000]}

Extract key terms and compare them to market standards. Output ONLY valid JSON."""

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
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            result = json.loads(text[start:end])
        else:
            result = {
                "contract_type": contract_type,
                "summary": "Could not parse comparison data.",
                "items": []
            }

    return result
