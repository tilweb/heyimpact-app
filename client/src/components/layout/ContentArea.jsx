import React from 'react';
import tokens from '../../theme/tokens.js';

export default function ContentArea({ children }) {
  return (
    <main style={{
      flex: 1,
      overflow: 'auto',
      padding: tokens.spacing.xxxl,
    }}>
      <div style={{ maxWidth: tokens.layout.maxContentWidth, margin: '0 auto' }}>
        {children}
      </div>
    </main>
  );
}
