/**
 * UploadZone — Smart drag-and-drop PDF upload with animated transitions.
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './UploadZone.css';

export default function UploadZone({ onUpload, status }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setFileName(files[0].name);
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
  }, [onUpload]);

  const isProcessing = status === 'uploading' || status === 'analyzing';

  return (
    <div className="upload-zone-wrapper">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            className="upload-processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="processing-content">
              <motion.div
                className="processing-rings"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div className="ring ring-outer" />
                <div className="ring ring-middle" />
                <div className="ring ring-inner" />
              </motion.div>

              <div className="processing-info">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {status === 'uploading' ? 'Uploading Document...' : 'Analyzing Contract...'}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {status === 'uploading'
                    ? `Processing ${fileName}`
                    : 'Our AI litigator is reviewing every clause'}
                </motion.p>

                <motion.div className="processing-steps">
                  <ProcessingStep
                    label="Document uploaded"
                    done={status === 'analyzing'}
                    active={status === 'uploading'}
                    delay={0.3}
                  />
                  <ProcessingStep
                    label="Extracting text & metadata"
                    done={status === 'analyzing'}
                    active={status === 'uploading'}
                    delay={0.5}
                  />
                  <ProcessingStep
                    label="AI risk analysis in progress"
                    done={false}
                    active={status === 'analyzing'}
                    delay={0.7}
                  />
                  <ProcessingStep
                    label="Ghost clause detection"
                    done={false}
                    active={status === 'analyzing'}
                    delay={0.9}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="upload-input"
              id="pdf-upload-input"
            />

            <motion.div
              className="upload-icon"
              animate={isDragging ? { scale: 1.15, y: -8 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="url(#upload-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="url(#upload-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="url(#upload-grad)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 15L12 12L15 15" stroke="url(#upload-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="upload-grad" x1="4" y1="2" x2="20" y2="22">
                    <stop stopColor="#34d399"/>
                    <stop offset="1" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            <div className="upload-text">
              <h3>{isDragging ? 'Drop your contract here' : 'Upload Your Contract'}</h3>
              <p>Drag & drop a PDF file or <span className="upload-browse">browse files</span></p>
              <div className="upload-formats">
                <span className="format-badge">PDF</span>
                <span className="format-info">Max 25MB</span>
              </div>
            </div>

            {/* Decorative corner glows */}
            <div className="upload-corner upload-corner-tl" />
            <div className="upload-corner upload-corner-tr" />
            <div className="upload-corner upload-corner-bl" />
            <div className="upload-corner upload-corner-br" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProcessingStep({ label, done, active, delay }) {
  return (
    <motion.div
      className={`processing-step ${done ? 'step-done' : ''} ${active ? 'step-active' : ''}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="step-indicator">
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-400)" strokeWidth="3">
            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : active ? (
          <div className="step-spinner" />
        ) : (
          <div className="step-dot" />
        )}
      </div>
      <span>{label}</span>
    </motion.div>
  );
}
