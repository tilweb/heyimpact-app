import React from 'react';
import tokens from '../../theme/tokens.js';

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    <path d="M5 3l1 3.2L9 7 6 8l-1 3-1-3-3-1 3.2-1L5 3z" />
    <path d="M19 17l1 2.2L22 20l-2 .8-1 2.2-1-2.2L16 20l2-.8L19 17z" />
  </svg>
);

export default function Button({ children, onClick, variant = 'primary', disabled, style: customStyle, size = 'md', icon, type = 'button' }) {
  const sizes = {
    sm: { padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`, fontSize: tokens.typography.fontSize.sm },
    md: { padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`, fontSize: tokens.typography.fontSize.md },
    lg: { padding: `${tokens.spacing.md}px ${tokens.spacing.xl}px`, fontSize: tokens.typography.fontSize.lg },
  };

  const variants = {
    primary: {
      background: disabled ? tokens.colors.textLight : tokens.colors.primary,
      color: tokens.colors.white,
      border: 'none',
    },
    secondary: {
      background: tokens.colors.surface,
      color: tokens.colors.primary,
      border: `1px solid ${tokens.colors.border}`,
    },
    danger: {
      background: disabled ? tokens.colors.textLight : tokens.colors.error,
      color: tokens.colors.white,
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: tokens.colors.primary,
      border: 'none',
    },
    ai: {
      background: disabled ? tokens.colors.textLight : 'linear-gradient(135deg, #8B5CF6, #6366F1, #3B82F6)',
      color: tokens.colors.white,
      border: 'none',
    },
  };

  const isAI = variant === 'ai';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: tokens.radii.sm,
        fontWeight: tokens.typography.fontWeight.semibold,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        fontFamily: tokens.typography.fontFamily,
        ...customStyle,
      }}
    >
      {isAI && <SparklesIcon />}
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
