import React from 'react';
import tokens from '../../theme/tokens.js';

export default function ScoreIndicator({ score, threshold, label }) {
  const color = score >= threshold ? tokens.colors.scoreRed
    : score >= threshold * 0.8 ? tokens.colors.scoreYellow
    : tokens.colors.scoreGreen;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color }}>{score}</span>
      {label && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>/ {threshold} {label}</span>}
    </div>
  );
}
