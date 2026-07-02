

export const Colors = {
  
  background: '#0B0C0E',
  surface: '#16181D',
  surfaceElevated: '#20232B',
  glass: 'rgba(255,255,255,0.02)',
  glassBorder: '#23262E',

  
  primary: '#5E6AD2',
  primaryLight: '#7A85E6',
  primaryDark: '#3F49A6',
  accent: '#5E6AD2',
  accentGlow: 'rgba(94,106,210,0.1)',

  
  live: '#EF4444',
  liveGlow: 'rgba(239,68,68,0.1)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0C0E',

  
  border: '#23262E',
  borderActive: '#5E6AD2',

  
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.4)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  xxl: 28,
  xxxl: 34,

  
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  
  tight: 1.25,
  normal: 1.45,
  relaxed: 1.6,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#5E6AD2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
};
