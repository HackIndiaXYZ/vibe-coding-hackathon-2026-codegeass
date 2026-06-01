/**
 * CounterOfferModal — Displays AI-generated negotiation points.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './CounterOfferModal.css';

export default function CounterOfferModal({ isOpen, onClose, data, isLoading }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="modal-close" onClick={onClose}>×</button>
            
            <div className="modal-header">
              <div className="modal-icon animate-pulse-glow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h2>Negotiation Playbook</h2>
              <p>Use these AI-generated points to push back on risky terms.</p>
            </div>

            {isLoading ? (
              <div className="modal-loading">
                <div className="step-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <p>Generating legal counter-offers...</p>
              </div>
            ) : data ? (
              <div className="modal-content">
                <div className="modal-section">
                  <label>Original Clause</label>
                  <div className="original-clause mono">
                    "{data.original_clause}"
                  </div>
                </div>

                <div className="modal-section">
                  <label>Suggested Counter-Offers</label>
                  <div className="points-list">
                    {data.points.map((point, idx) => (
                      <div key={idx} className="point-item">
                        <div className="point-bullet">{idx + 1}</div>
                        <p>{point.bullet}</p>
                        <button 
                          className="btn-copy" 
                          onClick={() => handleCopy(point.bullet, idx)}
                          title="Copy to clipboard"
                        >
                          {copiedIndex === idx ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {data.email_snippet && (
                  <div className="modal-section">
                    <label>Email Snippet</label>
                    <div className="email-snippet">
                      <p>{data.email_snippet}</p>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 'var(--space-sm)' }}
                        onClick={() => handleCopy(data.email_snippet, 'email')}
                      >
                        {copiedIndex === 'email' ? 'Copied!' : 'Copy Email Snippet'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
