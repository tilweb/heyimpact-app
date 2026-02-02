const tokens = {
  colors: {
    primary: '#0B3D2C',       // Adacor dark green
    primaryLight: '#1A5C42',
    primaryDark: '#072A1E',
    accent: '#2ECC71',        // Bright green accent
    accentLight: '#A3E4C1',
    background: '#F5F7FA',    // Light gray background
    surface: '#FFFFFF',
    surfaceHover: '#F0F2F5',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    success: '#10B981',
    successLight: '#D1FAE5',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    white: '#FFFFFF',
    // Module colors for ESRS topics
    environmental: '#059669',
    social: '#7C3AED',
    governance: '#2563EB',
    // Score colors
    scoreRed: '#DC2626',
    scoreYellow: '#F59E0B',
    scoreGreen: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
  },
  typography: {
    fontFamily: "'Source Sans Pro', 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: 11,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      xxxl: 28,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  layout: {
    headerHeight: 60,
    sidebarWidth: 280,
    maxContentWidth: 1200,
  },
};
export default tokens;
