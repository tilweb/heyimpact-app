import React from 'react';
import tokens from '../../theme/tokens.js';

export default function PlaceholderBox({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.spacing.xxxxl,
      textAlign: 'center',
      background: tokens.colors.borderLight,
      borderRadius: tokens.radii.lg,
      border: `2px dashed ${tokens.colors.border}`,
    }}>
      {icon && <div style={{ fontSize: 48, marginBottom: tokens.spacing.lg }}>{icon}</div>}
      {title && <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.sm }}>{title}</div>}
      {description && <div style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, maxWidth: 400, marginBottom: tokens.spacing.xl }}>{description}</div>}
      {action}
    </div>
  );
}
