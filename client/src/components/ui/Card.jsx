import React, { useState } from 'react';
import tokens from '../../theme/tokens.js';

export default function Card({ children, onClick, selected, style: customStyle, padding }) {
  const [hovered, setHovered] = useState(false);
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tokens.colors.surface,
        borderRadius: tokens.radii.lg,
        border: `1px solid ${selected ? tokens.colors.primary : tokens.colors.border}`,
        boxShadow: hovered && isClickable ? tokens.shadows.md : tokens.shadows.sm,
        padding: padding !== undefined ? padding : tokens.spacing.xl,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        transform: hovered && isClickable ? 'translateY(-1px)' : 'none',
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
}
