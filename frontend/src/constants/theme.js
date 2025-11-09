// Theme Constants - Single Source of Truth for Colors, Spacing, etc.

export const COLORS = {
  // Primary Colors
  primary: {
    teal: '#0E7C7B',
    ocean: '#118AB2',
  },
  
  // Secondary Colors
  secondary: {
    yellow: '#FFD166',
    coral: '#EF476F',
  },
  
  // Contrast Colors
  contrast: {
    indigo: '#073B4C',
    purple: '#6A4C93',
  },
  
  // Functional Colors
  retention: {
    green: '#06D6A0',
    yellow: '#FFD166',
    red: '#EF476F',
  },
  
  // Text Colors
  text: {
    dark: '#1F2937',
    gray: '#6B7280',
    light: '#9CA3AF',
  },
  
  // Background Colors
  background: {
    light: '#F9FAFB',
    surface: '#FFFFFF',
    divider: '#E5E7EB',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #EF476F, #FFD166)',
    teal: 'linear-gradient(135deg, #0E7C7B, #118AB2)',
    hero: 'linear-gradient(135deg, #073B4C 0%, #118AB2 40%, #FFD166 70%, #EF476F 100%)',
  },
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
};

export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1400px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.04)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
};

export const BORDER_RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
};
