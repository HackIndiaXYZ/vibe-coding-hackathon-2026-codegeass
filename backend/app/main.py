import os
import asyncio
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from app.services.pdf_extractor import extract_text_from_pdf, get_pdf_metadata
from app.services.llm_analyzer import analyze_contract
from app.services.ghost_detector import detect_ghost_clauses
from app.services.counter_offer import generate_counter_offer

load_dotenv()

app = Flask(__name__)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "lexiguard-api"})

@app.route("/api/analyze", methods=["POST"])
def analyze_document():
    if "file" not in request.files:
        return jsonify({"detail": "No file uploaded"}), 400
        
    file = request.files["file"]
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"detail": "Only PDF files are supported"}), 400

    try:
        file_bytes = file.read()
        
        # 1. Extract Text
        pages = extract_text_from_pdf(file_bytes)
        metadata = get_pdf_metadata(file_bytes)
        
        if not pages:
            return jsonify({"detail": "Could not extract text from the PDF"}), 400

        full_text = "\n\n".join(p.content for p in pages)
        pages_data = [p.model_dump() for p in pages]

        # Run asyncio event loop for LLM tasks
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def run_analysis():
            # Run analysis and ghost detection concurrently
            analysis_task = analyze_contract(full_text, pages_data)
            ghost_task = detect_ghost_clauses(full_text, metadata.get("title", "general"))
            return await asyncio.gather(analysis_task, ghost_task)
            
        analysis_result, ghost_clauses = loop.run_until_complete(run_analysis())
        loop.close()

        # Combine results
        analysis_result["filename"] = file.filename
        analysis_result["total_pages"] = metadata["page_count"]
        analysis_result["ghost_clauses"] = ghost_clauses
        analysis_result["extracted_text"] = [
            {"page_number": p.page_number, "content": p.content, "paragraphs": p.paragraphs}
            for p in pages
        ]

        return jsonify(analysis_result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": f"Analysis failed: {str(e)}"}), 500


@app.route("/api/counter-offer", methods=["POST"])
def counter_offer():
    data = request.json
    if not data or "clause_text" not in data:
        return jsonify({"detail": "clause_text is required"}), 400
        
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            generate_counter_offer(
                clause_text=data["clause_text"],
                risk_level=data.get("risk_level", "warning"),
                context=data.get("context", ""),
                contract_type=data.get("contract_type", "general")
            )
        )
        loop.close()
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": f"Counter-offer generation failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
