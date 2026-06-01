/**
 * GhostClauseAlert — Missing protection warnings.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import './GhostClauseAlert.css';

export default function GhostClauseAlert({ ghostClauses = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!ghostClauses || ghostClauses.length === 0) return null;

  return (
    <div className="ghost-clause-section">
      <div className="ghost-header">
        <h3 className="ghost-title">
          <span className="ghost-icon animate-float">👻</span>
          Missing Protections (Ghost Clauses)
        </h3>
        <p className="ghost-subtitle">What's NOT in your contract that should be.</p>
      </div>

      <div className="ghost-list">
        {ghostClauses.map((ghost) => (
          <GhostCard 
            key={ghost.id} 
            ghost={ghost} 
            isExpanded={expandedId === ghost.id}
            onToggle={() => setExpandedId(expandedId === ghost.id ? null : ghost.id)}
          />
        ))}
      </div>
    </div>
  );
}

function GhostCard({ ghost, isExpanded, onToggle }) {
  return (
    <motion.div 
      className="ghost-card"
      whileHover={{ scale: 1.01 }}
      onClick={onToggle}
    >
      <div className="ghost-card-header">
        <div className="ghost-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--risk-warning)" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Missing: {ghost.title}
        </div>
      </div>

      <p className="ghost-card-desc">{ghost.description}</p>

      <motion.div 
        className="ghost-card-suggestion-wrapper"
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
      >
        <div className="ghost-card-suggestion">
          <strong>Suggested Language to Add:</strong>
          <p className="mono">"{ghost.suggested_language}"</p>
        </div>
      </motion.div>
      
      <div className="ghost-card-footer">
        {isExpanded ? 'Hide suggestion' : 'View suggested language'}
      </div>
    </motion.div>
  );
}
