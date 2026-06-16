import { createTheme } from '@mui/material/styles'
import { colors, typography, shape } from './tokens'

const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    grey: colors.grey,
  },
  typography: {
    fontFamily: typography.fontFamily,
    fontWeightRegular: typography.fontWeightRegular,
    fontWeightMedium: typography.fontWeightMedium,
    fontWeightBold: typography.fontWeightBold,
    h1: { fontSize: '2.5rem', fontWeight: typography.fontWeightBold, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: typography.fontWeightBold, lineHeight: 1.25 },
    h3: { fontSize: '1.75rem', fontWeight: typography.fontWeightMedium, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: typography.fontWeightMedium, lineHeight: 1.35 },
    h5: { fontSize: '1.25rem', fontWeight: typography.fontWeightMedium, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: typography.fontWeightBold, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
    button: { fontWeight: typography.fontWeightMedium, textTransform: 'none' as const },
  },
  shape: {
    borderRadius: shape.borderRadius,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
  },
})

export default theme
