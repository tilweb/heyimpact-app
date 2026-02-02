import React, { useEffect } from 'react';
import tokens from '../../theme/tokens.js';

export default function Modal({ open, onClose, title, children, width = 600 }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.colors.surface,
          borderRadius: tokens.radii.xl,
          boxShadow: tokens.shadows.lg,
          width: `min(${width}px, 90vw)`,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing.xl}px ${tokens.spacing.xxl}px`,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}>
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, margin: 0 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: tokens.colors.textSecondary, padding: 4 }}>
            ✕
          </button>
        </div>
        <div style={{ padding: tokens.spacing.xxl, overflow: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
