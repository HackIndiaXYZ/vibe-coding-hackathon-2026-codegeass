/**
 * RiskIntelPanel — Expandable accordion categories for risks.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskCard from './RiskCard';
import './RiskIntelPanel.css';

export default function RiskIntelPanel({ 
  clauses, 
  activeClauseId, 
  onClauseClick,
  onRequestCounterOffer 
}) {
  // Group clauses by risk level
  const critical = clauses.filter(c => c.risk_level === 'critical');
  const warnings = clauses.filter(c => c.risk_level === 'warning');
  const info = clauses.filter(c => c.risk_level === 'info');

  return (
    <div className="risk-intel-panel">
      <RiskCategory 
        title="Critical Hazards" 
        count={critical.length}
        riskLevel="critical"
        defaultExpanded={critical.length > 0}
      >
        {critical.length > 0 ? (
          critical.map(clause => (
            <RiskCard 
              key={clause.id} 
              clause={clause}
              isActive={activeClauseId === clause.id}
              onClick={() => onClauseClick(clause.id)}
              onRequestCounterOffer={onRequestCounterOffer}
            />
          ))
        ) : (
          <div className="empty-category">No critical hazards found.</div>
        )}
      </RiskCategory>

      <RiskCategory 
        title="Hidden Fees & Gotchas" 
        count={warnings.length}
        riskLevel="warning"
        defaultExpanded={critical.length === 0 && warnings.length > 0}
      >
        {warnings.length > 0 ? (
          warnings.map(clause => (
            <RiskCard 
              key={clause.id} 
              clause={clause}
              isActive={activeClauseId === clause.id}
              onClick={() => onClauseClick(clause.id)}
            />
          ))
        ) : (
          <div className="empty-category">No hidden fees detected.</div>
        )}
      </RiskCategory>

      <RiskCategory 
        title="General Observations" 
        count={info.length}
        riskLevel="info"
      >
        {info.length > 0 ? (
          info.map(clause => (
            <RiskCard 
              key={clause.id} 
              clause={clause}
              isActive={activeClauseId === clause.id}
              onClick={() => onClauseClick(clause.id)}
            />
          ))
        ) : (
          <div className="empty-category">No general observations.</div>
        )}
      </RiskCategory>
    </div>
  );
}

function RiskCategory({ title, count, riskLevel, defaultExpanded = false, children }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`risk-category category-${riskLevel}`}>
      <motion.button 
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <div className="category-header-left">
          <div className={`category-icon icon-${riskLevel}`}>
            {riskLevel === 'critical' && '🔴'}
            {riskLevel === 'warning' && '🟡'}
            {riskLevel === 'info' && '🔵'}
          </div>
          <h3 className="category-title">{title}</h3>
          {count > 0 && (
            <span className={`category-badge badge-${riskLevel}`}>{count}</span>
          )}
        </div>
        
        <motion.div 
          className="category-chevron"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="category-content-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="category-content">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
