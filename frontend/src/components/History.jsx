/**
 * History — Stores past analyses in localStorage and lets the user review them.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './History.css';

const HISTORY_KEY = 'lexiguard_history';

/** Save an analysis result to localStorage history. */
export function saveToHistory(analysisData) {
  try {
    const history = getHistory();
    const entry = {
      id: Date.now().toString(),
      filename: analysisData.filename,
      risk_score: analysisData.risk_score,
      contract_type: analysisData.contract_type,
      clause_count: analysisData.clauses?.length || 0,
      ghost_count: analysisData.ghost_clauses?.length || 0,
      timestamp: new Date().toISOString(),
      data: analysisData,
    };
    history.unshift(entry);
    // Keep last 20
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.warn('Failed to save to history:', e);
  }
}

/** Retrieve history from localStorage. */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function History({ onLoadAnalysis }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const getRiskColor = (score) => {
    if (score <= 20) return 'var(--risk-safe)';
    if (score <= 40) return 'var(--emerald-400)';
    if (score <= 60) return 'var(--risk-warning)';
    if (score <= 80) return '#f97316';
    return 'var(--risk-critical)';
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' at '
      + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">📁</div>
        <h2>No History Yet</h2>
        <p>Completed analyses will appear here so you can review them later.</p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <div>
          <h2 className="text-gradient">Analysis History</h2>
          <p className="history-subtitle">{history.length} past {history.length === 1 ? 'analysis' : 'analyses'}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      <div className="history-list">
        <AnimatePresence>
          {history.map((entry, idx) => (
            <motion.div
              key={entry.id}
              className="history-card glass-panel"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="history-card-left">
                <div
                  className="history-score"
                  style={{
                    color: getRiskColor(entry.risk_score),
                    borderColor: getRiskColor(entry.risk_score),
                    boxShadow: `0 0 12px ${getRiskColor(entry.risk_score)}30`,
                  }}
                >
                  {entry.risk_score}
                </div>
              </div>

              <div className="history-card-body">
                <h4 className="history-filename">{entry.filename}</h4>
                <div className="history-meta">
                  <span className="badge badge-info">{entry.contract_type}</span>
                  <span>{entry.clause_count} clauses flagged</span>
                  <span>{entry.ghost_count} ghost clauses</span>
                </div>
                <p className="history-date">{formatDate(entry.timestamp)}</p>
              </div>

              <div className="history-card-actions">
                <motion.button
                  className="btn btn-primary btn-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLoadAnalysis(entry.data)}
                >
                  View
                </motion.button>
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(entry.id)}
                >
                  ✕
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
