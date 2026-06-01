/**
 * ComparisonMode — Visual comparison against industry standards.
 */

import { motion } from 'framer-motion';
import './ComparisonMode.css';

export default function ComparisonMode({ comparison }) {
  if (!comparison || !comparison.items || comparison.items.length === 0) return null;

  return (
    <div className="comparison-section">
      <div className="comparison-header">
        <h3 className="comparison-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="2">
            <path d="M12 20V10"/>
            <path d="M18 20V4"/>
            <path d="M6 20v-4"/>
          </svg>
          Industry Benchmarks
        </h3>
        <p className="comparison-subtitle">
          How this {comparison.contract_type} contract compares to market standards.
        </p>
      </div>

      <div className="comparison-grid">
        {comparison.items.map((item, idx) => (
          <ComparisonRow key={idx} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({ item, index }) {
  const isWorse = item.verdict === 'worse';
  const isBetter = item.verdict === 'better';
  const statusColor = isWorse ? 'var(--risk-critical)' : isBetter ? 'var(--risk-safe)' : 'var(--risk-info)';

  return (
    <motion.div 
      className="comparison-row"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="comparison-term">{item.term}</div>
      
      <div className="comparison-bars">
        <div className="comparison-bar-group">
          <div className="comparison-label">Market Standard</div>
          <div className="bar-track">
            <div className="bar-fill bar-standard" style={{ width: '60%' }} />
            <span className="bar-text">{item.industry_standard}</span>
          </div>
        </div>
        
        <div className="comparison-bar-group">
          <div className="comparison-label">Your Contract</div>
          <div className="bar-track">
            <div 
              className="bar-fill" 
              style={{ 
                width: isWorse ? '90%' : isBetter ? '40%' : '60%',
                backgroundColor: statusColor,
                boxShadow: `0 0 10px ${statusColor}40`
              }} 
            />
            <span className="bar-text">{item.your_contract}</span>
          </div>
        </div>
      </div>
      
      <div className="comparison-verdict">
        {isWorse && <span className="badge badge-critical">Worse than standard</span>}
        {isBetter && <span className="badge badge-safe">Better than standard</span>}
        {!isWorse && !isBetter && <span className="badge badge-info">Standard</span>}
      </div>
    </motion.div>
  );
}
