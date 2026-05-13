// ── Botmaker Design System tokens ─────────────────────────────────────────────
// Source: botmaker-design-system.md
// All values mapped from Figma variable names to usable constants.

export const color = {
  // Primary
  primary:       '#304FFE',
  primaryUltraLight: '#E6EAFF',
  primaryLight:  '#D6DCFF',
  primaryMidLight: '#ADB8FF',
  primaryMidDark: '#1D2DC4',
  primaryDark:   '#0026CA',
  primaryHover:  '#EDEEF5',
  primaryPressed: '#001B8C',

  // Neutral
  black:    '#000000',
  grey900:  '#212121',
  grey800:  '#424242',
  grey700:  '#616161',
  grey600:  '#757575',
  grey500:  '#9E9E9E',
  grey400:  '#BDBDBD',
  grey300:  '#E0E0E0',
  grey200:  '#EEEEEE',
  grey100:  '#F5F5F5',
  grey50:   '#FAFAFA',
  white:    '#FFFFFF',

  // States — Normal
  success:     '#02C66A',
  warning:     '#F5A623',
  error:       '#FB1531',
  information: '#304FFE',

  // States — Dark
  successDark:  '#068D80',
  warningDark:  '#9C6511',
  errorDark:    '#CE031B',
  infoDark:     '#0026CA',

  // States — Light
  successLight:  '#D7F7E8',
  warningLight:  '#FFF6D6',
  errorLight:    '#FAE6E8',
  infoLight:     '#E6EAFF',

  // Background
  bgPage:    '#FFFFFF',
  bgSubtle:  '#F5F5F5',
  bgMuted:   '#EEEEEE',
  bgCard:    '#FFFFFF',
  bgAI:      '#F5F7FF',

  // Semantic text
  textPrimary:   '#212121',
  textSecondary: '#757575',
  textTertiary:  '#9E9E9E',
  textDisabled:  '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  textLink:      '#304FFE',

  // Semantic border
  borderSubtle:  '#EEEEEE',
  borderDefault: '#E0E0E0',
  borderStrong:  '#9E9E9E',
  borderFocus:   '#304FFE',
  borderError:   '#FB1531',
} as const

export const spacing = {
  xxxSm:  4,
  xxSm:   8,
  xSm:   12,
  sm:    16,
  xBig:  24,
  xxxBig: 32,
  xLg:   48,
} as const

export const radius = {
  sm:  4,
  md:  8,
  lg: 16,
  xlg: 32,
} as const

// Text styles: size / lineHeight / weight
// "Semibold" = Roboto Medium 500 (historical naming)
export const text = {
  displayLg:  { size: 40, lh: 48 },
  displaySm:  { size: 36, lh: 44 },
  h1:         { size: 32, lh: 40 },
  h2:         { size: 28, lh: 36 },
  h3:         { size: 24, lh: 32 },
  h4:         { size: 20, lh: 28 },
  h5:         { size: 18, lh: 24 },
  h6:         { size: 16, lh: 22 },
  paragraphLg:   { size: 18, lh: 28 },
  paragraphNm:   { size: 16, lh: 24 },
  paragraphSm:   { size: 14, lh: 20 },
  paragraphXs:   { size: 12, lh: 17 },
  paragraphXxs:  { size: 10, lh: 14 },
  // Labels
  labelCaps: { size: 10, lh: 14, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 700 },
  hint:      { size: 12, lh: 17 },
} as const

export const font = {
  family: "'Roboto', sans-serif",
  regular: 400,
  medium: 500,   // DS calls this "Semibold"
  bold: 700,
} as const

export const shadow = {
  small:  '0 0 3px rgba(130,130,130,0.15)',
  medium: '0 0 7px rgba(0,0,0,0.15)',
} as const

// Shorthand for inline styles
export const ds = { color, spacing, radius, text, font, shadow }
