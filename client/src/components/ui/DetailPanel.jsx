import React from 'react';
import tokens from '../../theme/tokens.js';

export default function DetailPanel({ children, title }) {
  return (
    <div style={{
      position: 'sticky',
      top: tokens.spacing.xxxl,
      background: tokens.colors.surface,
      borderRadius: tokens.radii.xl,
      border: `1px solid ${tokens.colors.border}`,
      boxShadow: tokens.shadows.md,
      padding: tokens.spacing.xxl,
      maxHeight: `calc(100vh - ${tokens.layout.headerHeight + tokens.spacing.xxxl * 2}px)`,
      overflowY: 'auto',
    }}>
      {title && (
        <h3 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.lg, color: tokens.colors.text }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
