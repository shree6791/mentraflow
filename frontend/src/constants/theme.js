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
    primary: '#1a1a1a',
    secondary: '#666',
    muted: '#888',
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

// Helper function to convert theme to CSS custom properties
export const getCSSVariables = () => {
  return {
    // Primary Colors
    '--color-primary-teal': COLORS.primary.teal,
    '--color-primary-ocean': COLORS.primary.ocean,
    
    // Secondary Colors
    '--color-secondary-yellow': COLORS.secondary.yellow,
    '--color-secondary-coral': COLORS.secondary.coral,
    
    // Contrast Colors
    '--color-contrast-indigo': COLORS.contrast.indigo,
    '--color-contrast-purple': COLORS.contrast.purple,
    
    // Retention Colors
    '--color-retention-green': COLORS.retention.green,
    '--color-retention-yellow': COLORS.retention.yellow,
    '--color-retention-red': COLORS.retention.red,
    
    // Text Colors
    '--color-text-dark': COLORS.text.dark,
    '--color-text-gray': COLORS.text.gray,
    '--color-text-light': COLORS.text.light,
    '--color-text-primary': COLORS.text.primary || COLORS.text.dark,
    '--color-text-secondary': COLORS.text.secondary || COLORS.text.gray,
    '--color-text-muted': COLORS.text.muted || COLORS.text.light,
    
    // Background Colors
    '--color-bg-light': COLORS.background.light,
    '--color-bg-surface': COLORS.background.surface,
    '--color-bg-divider': COLORS.background.divider,
    
    // Spacing
    '--spacing-xs': SPACING.xs,
    '--spacing-sm': SPACING.sm,
    '--spacing-md': SPACING.md,
    '--spacing-lg': SPACING.lg,
    '--spacing-xl': SPACING.xl,
    '--spacing-xxl': SPACING.xxl,
    
    // Border Radius
    '--radius-sm': BORDER_RADIUS.sm,
    '--radius-md': BORDER_RADIUS.md,
    '--radius-lg': BORDER_RADIUS.lg,
    '--radius-full': BORDER_RADIUS.full,
    
    // Shadows
    '--shadow-sm': SHADOWS.sm,
    '--shadow-md': SHADOWS.md,
    '--shadow-lg': SHADOWS.lg,
    '--shadow-xl': SHADOWS.xl,
  };
};

// Function to inject CSS variables into document
export const injectThemeVariables = () => {
  const variables = getCSSVariables();
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
