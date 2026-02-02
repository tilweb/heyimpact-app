import React from 'react';
import tokens from '../../theme/tokens.js';

const statusColors = {
  'Entwurf': { bg: tokens.colors.infoLight, text: tokens.colors.info },
  'In Prüfung': { bg: tokens.colors.warningLight, text: tokens.colors.warning },
  'Final': { bg: tokens.colors.successLight, text: tokens.colors.success },
  'Geplant': { bg: tokens.colors.infoLight, text: tokens.colors.info },
  'In Umsetzung': { bg: tokens.colors.warningLight, text: tokens.colors.warning },
  'Abgeschlossen': { bg: tokens.colors.successLight, text: tokens.colors.success },
  'Laufend': { bg: '#E0E7FF', text: '#4338CA' },
  'Umgesetzt': { bg: tokens.colors.successLight, text: tokens.colors.success },
  'Genehmigt': { bg: '#DBEAFE', text: '#2563EB' },
  'Auf Kurs': { bg: tokens.colors.successLight, text: tokens.colors.success },
  'Verzögert': { bg: tokens.colors.warningLight, text: tokens.colors.warning },
  'Erreicht': { bg: tokens.colors.successLight, text: tokens.colors.success },
};

export default function StatusBadge({ status }) {
  const colors = statusColors[status] || { bg: tokens.colors.borderLight, text: tokens.colors.textSecondary };
  return (
    <span style={{
      display: 'inline-block',
      padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
      background: colors.bg,
      color: colors.text,
      borderRadius: tokens.radii.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
    }}>
      {status}
    </span>
  );
}
