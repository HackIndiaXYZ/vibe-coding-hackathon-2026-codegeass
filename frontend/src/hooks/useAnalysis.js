/**
 * Custom hook for managing contract analysis state and API calls.
 */

import { useState, useCallback } from 'react';
import { analyzeDocument, generateCounterOffer } from '../lib/api';

/**
 * @typedef {'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'} AnalysisStatus
 */

export function useAnalysis() {
  const [status, setStatus] = useState('idle');
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [counterOffer, setCounterOffer] = useState(null);
  const [counterOfferLoading, setCounterOfferLoading] = useState(false);

  const uploadFile = useCallback(async (file) => {
    setStatus('uploading');
    setError(null);
    setAnalysisData(null);
    setCounterOffer(null);

    try {
      // Short delay for upload animation
      await new Promise(r => setTimeout(r, 500));
      setStatus('analyzing');

      const result = await analyzeDocument(file);
      setAnalysisData(result);
      setStatus('complete');
      return result;
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setStatus('error');
      throw err;
    }
  }, []);

  const requestCounterOffer = useCallback(async (clauseText, riskLevel, contractType) => {
    setCounterOfferLoading(true);
    try {
      const result = await generateCounterOffer({
        clauseText,
        riskLevel,
        contractType: contractType || analysisData?.contract_type || 'general',
      });
      setCounterOffer(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCounterOfferLoading(false);
    }
  }, [analysisData]);

  const loadData = useCallback((data) => {
    setAnalysisData(data);
    setStatus('complete');
    setError(null);
    setCounterOffer(null);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setAnalysisData(null);
    setError(null);
    setCounterOffer(null);
  }, []);

  return {
    status,
    analysisData,
    error,
    counterOffer,
    counterOfferLoading,
    uploadFile,
    requestCounterOffer,
    setCounterOffer,
    loadData,
    reset,
  };
}
