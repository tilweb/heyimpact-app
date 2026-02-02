import React from 'react';
import tokens from '../../theme/tokens.js';

export default function ProgressBar({ value = 0, max = 100, label, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct >= 80 ? tokens.colors.success : pct >= 50 ? tokens.colors.warning : tokens.colors.error);

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>{label}</span>
          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: 8, background: tokens.colors.borderLight, borderRadius: tokens.radii.full, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: tokens.radii.full, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}
