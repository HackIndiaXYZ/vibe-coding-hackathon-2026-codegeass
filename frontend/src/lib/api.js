/**
 * API client for LexiGuard backend.
 * Uses relative URLs so that the Vite dev proxy (/api → localhost:8000) works automatically.
 */

/**
 * Upload and analyze a PDF contract.
 * @param {File} file - The PDF file to analyze.
 * @returns {Promise<object>} Analysis results.
 */
export async function analyzeDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Generate counter-offer points for a risky clause.
 * @param {object} params - Counter-offer request params.
 * @returns {Promise<object>} Counter-offer response.
 */
export async function generateCounterOffer({ clauseText, riskLevel, context, contractType }) {
  const response = await fetch('/api/counter-offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clause_text: clauseText,
      risk_level: riskLevel,
      context: context || '',
      contract_type: contractType || 'general',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Generation failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Health check for the backend.
 * @returns {Promise<object>}
 */
export async function healthCheck() {
  const response = await fetch('/api/health');
  return response.json();
}
