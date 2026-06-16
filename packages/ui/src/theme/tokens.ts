// Design tokens — single source of truth for the visual system.
// Change values here; everything else picks them up via the MUI theme.

export const colors = {
  primary: {
    main: '#0B7A75',
    light: '#3DA8A4',
    dark: '#075550',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#5C6BC0',
    light: '#8E99F3',
    dark: '#26418F',
    contrastText: '#ffffff',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#B71C1C',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
} as const

export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
} as const

export const shape = {
  borderRadius: 8,
} as const

export const spacing = {
  unit: 8,
} as const
