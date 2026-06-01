/**
 * DocumentViewer — Renders extracted PDF text with heat-mapped highlighting
 * and hover-to-translate tooltips for legal jargon.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DocumentViewer.css';

export default function DocumentViewer({ pages, clauses, activeClauseId, onClauseClick }) {
  const [hoveredClause, setHoveredClause] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const clauseRefs = useRef({});

  // Scroll to active clause when clicked from RiskCard
  useEffect(() => {
    if (activeClauseId && clauseRefs.current[activeClauseId]) {
      clauseRefs.current[activeClauseId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeClauseId]);

  const getHighlightClass = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'highlight-critical';
      case 'warning': return 'highlight-warning';
      case 'info': return 'highlight-info';
      default: return '';
    }
  };

  const handleMouseEnter = useCallback((clause, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setTooltipPos({
      top: rect.top - (containerRect?.top || 0) - 10,
      left: rect.left - (containerRect?.left || 0) + rect.width / 2,
    });
    setHoveredClause(clause);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredClause(null);
  }, []);

  // Build a map of clause text fragments for highlighting
  const buildHighlightedContent = (paragraph, pageNum) => {
    const matchingClauses = clauses?.filter(c => c.page === pageNum) || [];
    
    if (matchingClauses.length === 0) {
      return <span>{paragraph}</span>;
    }

    // Find which clauses match this paragraph
    const matches = matchingClauses.filter(c => {
      const clauseSnippet = c.text.substring(0, 60).toLowerCase();
      return paragraph.toLowerCase().includes(clauseSnippet);
    });

    if (matches.length === 0) {
      return <span>{paragraph}</span>;
    }

    // Highlight the entire paragraph with the highest-risk match
    const highestRisk = matches.reduce((prev, curr) => {
      const order = { critical: 3, warning: 2, info: 1, safe: 0 };
      return (order[curr.risk_level] || 0) > (order[prev.risk_level] || 0) ? curr : prev;
    }, matches[0]);

    return (
      <span
        ref={el => { if (el) clauseRefs.current[highestRisk.id] = el; }}
        className={`clause-highlight ${getHighlightClass(highestRisk.risk_level)} ${activeClauseId === highestRisk.id ? 'clause-active' : ''}`}
        onMouseEnter={(e) => handleMouseEnter(highestRisk, e)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClauseClick?.(highestRisk.id)}
        role="button"
        tabIndex={0}
        aria-label={`Risk clause: ${highestRisk.plain_english}`}
      >
        {paragraph}
        <span className={`clause-risk-indicator badge badge-${highestRisk.risk_level}`}>
          {highestRisk.risk_level}
        </span>
      </span>
    );
  };

  const totalPages = pages?.length || 0;

  return (
    <motion.div
      className="document-viewer glass-panel-static"
      ref={containerRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="doc-header">
        <div className="doc-header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
          </svg>
          <span className="doc-title">Contract Document</span>
          <span className="doc-pages">{totalPages} pages</span>
        </div>
        <div className="doc-header-right">
          <div className="doc-legend">
            <span className="legend-item"><span className="legend-dot legend-critical"></span>Critical</span>
            <span className="legend-item"><span className="legend-dot legend-warning"></span>Warning</span>
            <span className="legend-item"><span className="legend-dot legend-info"></span>Info</span>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="doc-pagination">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            ←
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            →
          </button>
        </div>
      )}

      {/* Document Content */}
      <div className="doc-content">
        <AnimatePresence mode="wait">
          {pages?.map((page, pageIdx) => (
            (totalPages <= 1 || page.page_number === currentPage) && (
              <motion.div
                key={page.page_number}
                className="doc-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {totalPages > 1 && (
                  <div className="page-divider">
                    <span>Page {page.page_number}</span>
                  </div>
                )}
                {page.paragraphs.map((para, paraIdx) => (
                  <div key={`${pageIdx}-${paraIdx}`} className="doc-paragraph mono">
                    {buildHighlightedContent(para, page.page_number)}
                  </div>
                ))}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredClause && (
          <motion.div
            className="clause-tooltip"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tooltip-head">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="0.5" fill="var(--emerald-400)"/>
              </svg>
              <span>Plain English</span>
            </div>
            <p>{hoveredClause.plain_english}</p>
            <div className="tooltip-tip" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
