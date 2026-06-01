/**
 * RiskCard — Displays an individual risky clause with action buttons.
 */

import { motion } from 'framer-motion';
import './RiskCard.css';

export default function RiskCard({ 
  clause, 
  isActive, 
  onClick, 
  onRequestCounterOffer 
}) {
  const isCritical = clause.risk_level === 'critical';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`risk-card risk-card-${clause.risk_level} ${isActive ? 'risk-card-active' : ''}`}
      onClick={onClick}
    >
      <div className="risk-card-header">
        <span className={`badge badge-${clause.risk_level}`}>
          {clause.category.replace('_', ' ')}
        </span>
        <span className="risk-card-location">Page {clause.page}</span>
      </div>
      
      <div className="risk-card-body">
        <h4 className="risk-card-title">{clause.plain_english}</h4>
        <div className="risk-card-excerpt mono">
          "{clause.text.substring(0, 80)}{clause.text.length > 80 ? '...' : ''}"
        </div>
        <p className="risk-card-explanation">{clause.explanation}</p>
      </div>
      
      {isCritical && (
        <div className="risk-card-actions">
          <motion.button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRequestCounterOffer(clause);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Generate Counter-Offer
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
