/**
 * Dashboard — Summary overview of the current analysis with key stats.
 */

import { motion } from 'framer-motion';
import RiskGauge from './RiskGauge';
import './Dashboard.css';

export default function Dashboard({ analysisData }) {
  if (!analysisData) {
    return (
      <div className="dashboard-empty">
        <div className="dashboard-empty-icon">📊</div>
        <h2>No Analysis Yet</h2>
        <p>Upload a contract on the <strong>Analyze</strong> tab to see your dashboard.</p>
      </div>
    );
  }

  const { clauses, ghost_clauses, risk_score, risk_summary, contract_type, total_pages, filename } = analysisData;
  const criticalCount = clauses.filter(c => c.risk_level === 'critical').length;
  const warningCount = clauses.filter(c => c.risk_level === 'warning').length;
  const infoCount = clauses.filter(c => c.risk_level === 'info').length;

  const stats = [
    { label: 'Contract Type', value: contract_type?.replace(/_/g, ' ') || 'General', icon: '📄' },
    { label: 'Total Pages', value: total_pages, icon: '📑' },
    { label: 'Clauses Flagged', value: clauses.length, icon: '⚠️' },
    { label: 'Ghost Clauses', value: ghost_clauses?.length || 0, icon: '👻' },
  ];

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-gradient">Dashboard</h2>
        <p className="dashboard-file">Analyzing: <strong>{filename}</strong></p>
      </motion.div>

      <div className="dashboard-grid">
        {/* Risk Gauge */}
        <motion.div
          className="dashboard-card dashboard-gauge-card glass-panel-static"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <RiskGauge score={risk_score} label="Overall Risk" />
          <p className="dashboard-summary">{risk_summary}</p>
        </motion.div>

        {/* Stats */}
        <div className="dashboard-stats">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <span className="stat-icon">{stat.icon}</span>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk Breakdown */}
        <motion.div
          className="dashboard-card glass-panel-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Risk Breakdown</h3>
          <div className="breakdown-bars">
            <BreakdownBar label="Critical" count={criticalCount} total={clauses.length} color="var(--risk-critical)" />
            <BreakdownBar label="Warning" count={warningCount} total={clauses.length} color="var(--risk-warning)" />
            <BreakdownBar label="Info" count={infoCount} total={clauses.length} color="var(--risk-info)" />
          </div>
        </motion.div>

        {/* Top Risks */}
        <motion.div
          className="dashboard-card glass-panel-static"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Top Concerns</h3>
          <div className="top-risks">
            {clauses
              .filter(c => c.risk_level === 'critical')
              .slice(0, 3)
              .map((c, i) => (
                <div key={c.id} className="top-risk-item">
                  <span className="top-risk-num">{i + 1}</span>
                  <p>{c.plain_english}</p>
                </div>
              ))}
            {criticalCount === 0 && (
              <p className="no-risks">No critical risks found — looking good! ✅</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BreakdownBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="breakdown-row">
      <span className="breakdown-label">{label}</span>
      <div className="breakdown-track">
        <motion.div
          className="breakdown-fill"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="breakdown-count" style={{ color }}>{count}</span>
    </div>
  );
}
