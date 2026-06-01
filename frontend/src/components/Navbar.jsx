/**
 * Navbar — Glassmorphic navigation bar with glowing borders and micro-interactions.
 */

import { motion } from 'framer-motion';
import './Navbar.css';

export default function Navbar({ onReset, hasAnalysis, activeTab, onTabChange }) {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <motion.button
          className="navbar-logo"
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 16.97 6.84 21.56 12 23C17.16 21.56 21 16.97 21 12V7L12 2Z" 
                    stroke="url(#shield-gradient)" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <path d="M9 12L11 14L15 10" stroke="url(#shield-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="shield-gradient" x1="3" y1="2" x2="21" y2="23">
                  <stop stopColor="#34d399"/>
                  <stop offset="1" stopColor="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">
            <span className="logo-lexi">Lexi</span>
            <span className="logo-guard">Guard</span>
          </span>
          <span className="logo-badge">AI</span>
        </motion.button>

        {/* Nav Items */}
        <div className="navbar-items">
          <NavItem icon="🔍" label="Analyze" active={activeTab === 'analyze'} onClick={() => onTabChange('analyze')} />
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <NavItem icon="📁" label="History" active={activeTab === 'history'} onClick={() => onTabChange('history')} />
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {hasAnalysis && (
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={onReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Analysis
            </motion.button>
          )}
          <motion.div
            className="status-dot"
            animate={{
              boxShadow: [
                '0 0 4px rgba(16,185,129,0.4)',
                '0 0 12px rgba(16,185,129,0.7)',
                '0 0 4px rgba(16,185,129,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.nav>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <motion.button
      className={`nav-item ${active ? 'nav-item-active' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="nav-item-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
      {active && (
        <motion.div
          className="nav-item-indicator"
          layoutId="nav-indicator"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
