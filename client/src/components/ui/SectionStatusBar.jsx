import React, { useState } from 'react';
import tokens from '../../theme/tokens.js';
import { useSectionStatus } from '../../hooks/useSectionStatus.js';
import { STATUS_CONFIG, STATUS_ORDER } from '../../utils/sectionStatusConstants.js';

export default function SectionStatusBar({ route }) {
  const { getStatus, setStatus } = useSectionStatus();
  const current = getStatus(route);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(current.status);
  const [name, setName] = useState('');

  const config = STATUS_CONFIG[current.status] || STATUS_CONFIG.draft;

  const needsName = (s) => s === 'review' || s === 'approved';
  const isDowngrade = STATUS_ORDER.indexOf(selectedStatus) < STATUS_ORDER.indexOf(current.status);

  const handleOpen = () => {
    setSelectedStatus(current.status);
    setName('');
    setOpen(true);
  };

  const handleConfirm = () => {
    if (needsName(selectedStatus) && !isDowngrade && !name.trim()) return;
    setStatus(route, selectedStatus, needsName(selectedStatus) && !isDowngrade ? name.trim() : null);
    setOpen(false);
  };

  const nameInfo = [];
  if (current.reviewedBy) nameInfo.push(`Zu prüfen durch: ${current.reviewedBy}`);
  if (current.approvedBy) nameInfo.push(`Freigegeben von: ${current.approvedBy}`);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing.md,
      padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
      background: tokens.colors.surfaceHover,
      borderRadius: tokens.radii.sm,
      marginBottom: tokens.spacing.xxl,
      flexWrap: 'wrap',
      position: 'relative',
    }}>
      {/* Badge */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing.xs,
        padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`,
        borderRadius: tokens.radii.full,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.white,
        background: config.color,
      }}>
        {config.label}
      </span>

      {/* Name info */}
      {nameInfo.length > 0 && (
        <span style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.textSecondary,
        }}>
          {nameInfo.join(' · ')}
        </span>
      )}

      {/* Change button */}
      <button
        onClick={handleOpen}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.radii.sm,
          padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`,
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.text,
          cursor: 'pointer',
        }}
      >
        Status ändern
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: tokens.spacing.xs,
          background: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.radii.md,
          boxShadow: tokens.shadows.lg,
          padding: tokens.spacing.lg,
          zIndex: 100,
          minWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing.md,
        }}>
          {/* Status select */}
          <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              borderRadius: tokens.radii.sm,
              border: `1px solid ${tokens.colors.border}`,
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.text,
              background: tokens.colors.surface,
            }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>

          {/* Name field (required when upgrading to review/approved) */}
          {needsName(selectedStatus) && !isDowngrade && (
            <>
              <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                {selectedStatus === 'review' ? 'Zu prüfen durch' : 'Freigegeben von'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name eingeben..."
                style={{
                  padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                  borderRadius: tokens.radii.sm,
                  border: `1px solid ${tokens.colors.border}`,
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.text,
                }}
              />
            </>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: tokens.spacing.sm, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                borderRadius: tokens.radii.sm,
                border: `1px solid ${tokens.colors.border}`,
                background: tokens.colors.surface,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.text,
                cursor: 'pointer',
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              disabled={needsName(selectedStatus) && !isDowngrade && !name.trim()}
              style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                borderRadius: tokens.radii.sm,
                border: 'none',
                background: tokens.colors.primary,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.white,
                cursor: 'pointer',
                opacity: needsName(selectedStatus) && !isDowngrade && !name.trim() ? 0.5 : 1,
              }}
            >
              Bestätigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
