import React from 'react';
import tokens from '../../theme/tokens.js';

export default function MetricCard({ label, value, unit, icon }) {
  return (
    <div style={{
      background: tokens.colors.surface,
      borderRadius: tokens.radii.md,
      border: `1px solid ${tokens.colors.border}`,
      padding: tokens.spacing.lg,
    }}>
      <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.xs }}>
        {icon && <span style={{ marginRight: tokens.spacing.xs }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: tokens.typography.fontSize.xxl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text }}>
        {value ?? '-'}
        {unit && <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.regular, color: tokens.colors.textSecondary, marginLeft: tokens.spacing.xs }}>{unit}</span>}
      </div>
    </div>
  );
}
