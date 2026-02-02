import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import tokens from '../../theme/tokens.js';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Bestätigen', danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.xxl }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md }}>
        <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
