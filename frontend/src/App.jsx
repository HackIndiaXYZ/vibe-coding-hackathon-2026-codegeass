import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysis } from './hooks/useAnalysis';
import { saveToHistory } from './components/History';

import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import DocumentViewer from './components/DocumentViewer';
import RiskGauge from './components/RiskGauge';
import RiskIntelPanel from './components/RiskIntelPanel';
import GhostClauseAlert from './components/GhostClauseAlert';
import CounterOfferModal from './components/CounterOfferModal';
import ComparisonMode from './components/ComparisonMode';
import Dashboard from './components/Dashboard';
import History from './components/History';

export default function App() {
  const {
    status,
    analysisData,
    error,
    counterOffer,
    counterOfferLoading,
    uploadFile,
    requestCounterOffer,
    setCounterOffer,
    loadData,
    reset,
  } = useAnalysis();

  const [activeTab, setActiveTab] = useState('analyze');
  const [activeClauseId, setActiveClauseId] = useState(null);
  const [viewMode, setViewMode] = useState('risk');

  // Save to history when analysis completes via fresh upload
  const [lastSavedFile, setLastSavedFile] = useState(null);
  useEffect(() => {
    if (status === 'complete' && analysisData && analysisData.filename !== lastSavedFile) {
      saveToHistory(analysisData);
      setLastSavedFile(analysisData.filename);
    }
  }, [status, analysisData, lastSavedFile]);

  const handleReset = () => {
    setActiveClauseId(null);
    setViewMode('risk');
    setLastSavedFile(null);
    reset();
    setActiveTab('analyze');
  };

  const handleRequestCounterOffer = (clause) => {
    requestCounterOffer(clause.text, clause.risk_level, analysisData?.contract_type);
  };

  const handleLoadFromHistory = (data) => {
    loadData(data);
    setLastSavedFile(data.filename); // prevent re-saving
    setActiveTab('analyze');
  };

  const hasAnalysis = status === 'complete' && analysisData;

  return (
    <div className="app-layout">
      <Navbar
        onReset={handleReset}
        hasAnalysis={hasAnalysis}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span>⚠️ {error}</span>
            <button onClick={handleReset} className="btn btn-ghost btn-sm">Try Again</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'analyze' && (
          <motion.main
            key="analyze"
            className={`workspace ${!hasAnalysis ? 'workspace-full' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* LEFT PANE */}
            <div className="pane pane-left">
              <AnimatePresence mode="wait">
                {!hasAnalysis ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ height: '100%', display: 'flex' }}
                  >
                    <UploadZone onUpload={uploadFile} status={status} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ height: '100%', overflow: 'hidden' }}
                  >
                    <DocumentViewer
                      pages={analysisData.extracted_text}
                      clauses={analysisData.clauses}
                      activeClauseId={activeClauseId}
                      onClauseClick={setActiveClauseId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT PANE */}
            <AnimatePresence>
              {hasAnalysis && (
                <motion.div
                  className="pane pane-right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="glass-panel" style={{ padding: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <button
                      className={`btn ${viewMode === 'risk' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex: 1 }}
                      onClick={() => setViewMode('risk')}
                    >
                      Risk Analysis
                    </button>
                    <button
                      className={`btn ${viewMode === 'compare' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ flex: 1 }}
                      onClick={() => setViewMode('compare')}
                    >
                      Industry Comparison
                    </button>
                  </div>

                  {viewMode === 'risk' ? (
                    <>
                      <div className="glass-panel" style={{ marginBottom: 'var(--space-md)' }}>
                        <RiskGauge score={analysisData.risk_score} label="Overall Risk Score" />
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 var(--space-lg) var(--space-lg)' }}>
                          {analysisData.risk_summary}
                        </p>
                      </div>

                      <RiskIntelPanel
                        clauses={analysisData.clauses}
                        activeClauseId={activeClauseId}
                        onClauseClick={setActiveClauseId}
                        onRequestCounterOffer={handleRequestCounterOffer}
                      />

                      <GhostClauseAlert ghostClauses={analysisData.ghost_clauses} />
                    </>
                  ) : (
                    <div className="glass-panel" style={{ padding: 'var(--space-lg)' }}>
                      <ComparisonMode comparison={analysisData.comparison} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}

        {activeTab === 'dashboard' && (
          <motion.main
            key="dashboard"
            className="workspace workspace-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard analysisData={analysisData} />
          </motion.main>
        )}

        {activeTab === 'history' && (
          <motion.main
            key="history"
            className="workspace workspace-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <History onLoadAnalysis={handleLoadFromHistory} />
          </motion.main>
        )}
      </AnimatePresence>

      <CounterOfferModal
        isOpen={counterOfferLoading || !!counterOffer}
        onClose={() => {
          if (!counterOfferLoading) setCounterOffer(null);
        }}
        data={counterOffer}
        isLoading={counterOfferLoading}
      />
    </div>
  );
}
