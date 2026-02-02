import React from 'react';
import tokens from '../../theme/tokens.js';

const variants = {
  info: { bg: tokens.colors.infoLight, border: tokens.colors.info, icon: 'ℹ️' },
  warning: { bg: tokens.colors.warningLight, border: tokens.colors.warning, icon: '⚠️' },
  error: { bg: tokens.colors.errorLight, border: tokens.colors.error, icon: '❌' },
  success: { bg: tokens.colors.successLight, border: tokens.colors.success, icon: '✅' },
};

export default function InfoBox({ children, variant = 'info', style: customStyle }) {
  const v = variants[variant] || variants.info;
  return (
    <div style={{
      padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
      background: v.bg,
      borderLeft: `4px solid ${v.border}`,
      borderRadius: tokens.radii.sm,
      fontSize: tokens.typography.fontSize.md,
      color: tokens.colors.text,
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacing.sm,
      ...customStyle,
    }}>
      <span>{v.icon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
