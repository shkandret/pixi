export const colors = {
  brand: {
    purple: {
      50: { value: '#faf5ff' },
      100: { value: '#f3e8ff' },
      200: { value: '#e9d5ff' },
      500: { value: '#a855f7' },
      600: { value: '#9333ea' },
      700: { value: '#7e22ce' },
      800: { value: '#6b21a8' },
    },
    pink: {
      300: { value: '#f472b6' },
      400: { value: '#f02e65' },
      500: { value: '#ec4899' },
      600: { value: '#db2777' },
      800: { value: '#9d174d' },
    },
    green: {
      400: { value: '#34d399' },
      500: { value: '#10b981' },
      600: { value: '#059669' },
    },
    red: {
      400: { value: '#f87171' },
      500: { value: '#ef4444' },
      600: { value: '#dc2626' },
    },
    dark: {
      900: { value: '#0b0b16' },
      800: { value: '#131326' },
      700: { value: '#1b1b33' },
    },
  },
  neutral: {
    white: { value: '#ffffff' },
    gray: { value: '#9ca3af' },
  },
  translucent: {
    glass: { value: 'rgba(20, 20, 35, 0.6)' },
    stage: { value: 'rgba(15, 15, 27, 0.95)' },
    purpleGlow: { value: 'rgba(170, 59, 255, 0.3)' },
    purpleHover: { value: 'rgba(170, 59, 255, 0.15)' },
    whiteSubtle: { value: 'rgba(255, 255, 255, 0.08)' },
    overlay: { value: 'rgba(10, 10, 20, 0.9)' },
    overlaySuccess: { value: 'rgba(10, 22, 18, 0.92)' },
    hudHighlight: { value: 'rgba(255, 255, 255, 0.03)' },
  },
}

export const semanticColors = {
  bg: {
    primary: { value: '{colors.brand.dark.900}' },
    secondary: { value: '{colors.brand.dark.800}' },
    panel: { value: '{colors.translucent.glass}' },
    stage: { value: '{colors.translucent.stage}' },
    overlay: { value: '{colors.translucent.overlay}' },
    overlaySuccess: { value: '{colors.translucent.overlaySuccess}' },
    purpleHover: { value: '{colors.translucent.purpleHover}' },
    hudHighlight: { value: '{colors.translucent.hudHighlight}' },
  },
  text: {
    primary: { value: '{colors.neutral.white}' },
    secondary: { value: '{colors.neutral.gray}' },
    accent: { value: '{colors.brand.purple.500}' },
  },
  border: {
    accent: { value: '{colors.translucent.purpleGlow}' },
    subtle: { value: '{colors.translucent.whiteSubtle}' },
  },
  status: {
    success: { value: '{colors.brand.green.400}' },
    successDimmed: { value: '{colors.brand.green.600}' },
    error: { value: '{colors.brand.red.400}' },
    errorDimmed: { value: '{colors.brand.red.600}' },
  },
}

