import tokens from '../theme/tokens.js';

export const SECTION_ROUTES = [
  '/organization', '/iro', '/materiality',
  '/environmental', '/social', '/governance', '/targets',
];

export const STATUS_CONFIG = {
  draft:    { label: 'Entwurf',     color: tokens.colors.textLight },
  review:   { label: 'Zu prüfen',   color: tokens.colors.warning },
  approved: { label: 'Freigegeben', color: tokens.colors.success },
};

export const STATUS_ORDER = ['draft', 'review', 'approved'];
