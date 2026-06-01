/**
 * RiskGauge — Animated SVG circular gauge (0-100) with dynamic color gradient.
 */

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import './RiskGauge.css';

export default function RiskGauge({ score = 0, label = 'Risk Score' }) {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);

  // Animate the counter
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startVal = displayScore;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startVal + (score - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const getColor = (val) => {
    if (val <= 20) return '#10b981';
    if (val <= 40) return '#34d399';
    if (val <= 60) return '#f59e0b';
    if (val <= 80) return '#f97316';
    return '#ef4444';
  };

  const getGlow = (val) => {
    if (val <= 40) return 'rgba(16, 185, 129, 0.4)';
    if (val <= 60) return 'rgba(245, 158, 11, 0.4)';
    return 'rgba(239, 68, 68, 0.4)';
  };

  const getRiskLabel = (val) => {
    if (val <= 20) return 'Low Risk';
    if (val <= 40) return 'Moderate';
    if (val <= 60) return 'Elevated';
    if (val <= 80) return 'High Risk';
    return 'Critical';
  };

  const color = getColor(score);
  const glowColor = getGlow(score);
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="risk-gauge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gauge-container" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          className="gauge-svg"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const isMajor = i % 10 === 0;
            const len = isMajor ? 8 : 4;
            const x1 = size / 2 + (radius - len) * Math.cos(rad);
            const y1 = size / 2 + (radius - len) * Math.sin(rad);
            const x2 = size / 2 + (radius + 2) * Math.cos(rad);
            const y2 = size / 2 + (radius + 2) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            );
          })}

          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="gauge-center">
          <span className="gauge-score" style={{ color }}>{displayScore}</span>
          <span className="gauge-label">{getRiskLabel(score)}</span>
        </div>

        {/* Glow ring */}
        <motion.div
          className="gauge-glow"
          animate={{
            boxShadow: [
              `0 0 20px ${glowColor}`,
              `0 0 40px ${glowColor}`,
              `0 0 20px ${glowColor}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ borderColor: color }}
        />
      </div>

      <p className="gauge-title">{label}</p>
    </motion.div>
  );
}
