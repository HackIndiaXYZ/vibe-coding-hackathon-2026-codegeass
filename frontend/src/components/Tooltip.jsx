/**
 * Tooltip — Glassmorphic hover tooltip for "Plain English" translations.
 */

import { motion, AnimatePresence } from 'framer-motion';
import './Tooltip.css';

export default function Tooltip({ children, content, visible, position = {} }) {
  return (
    <div className="tooltip-wrapper" style={position}>
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            className="tooltip-popup"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="tooltip-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="0.5" fill="var(--emerald-400)"/>
              </svg>
              <span>Plain English</span>
            </div>
            <p className="tooltip-content">{content}</p>
            <div className="tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
