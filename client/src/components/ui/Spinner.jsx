import React from 'react';
import tokens from '../../theme/tokens.js';

export default function Spinner({ size = 24, color }) {
  const c = color || tokens.colors.primary;
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid ${tokens.colors.borderLight}`,
      borderTop: `3px solid ${c}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
