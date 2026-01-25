import { createTamagui } from 'tamagui';

const tokens = {
  color: {
    background: '#f8fafc',
    backgroundSoft: '#ffffff',
    text: '#0f172a',
    muted: '#6b7280',
    border: '#d1d5db',
    primary: '#0a7ea4',
    primaryContrast: '#ffffff',
    danger: '#ef4444',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    'true': 8,
  },
  radius: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
  },
  size: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    'true': 12,
  },
  zIndex: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    'true': 1,
  },
};

const fonts = {
  body: {
    family: 'System',
    size: {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
      5: 20,
      6: 24,
      'true': 16,
    },
    lineHeight: {
      1: 16,
      2: 18,
      3: 22,
      4: 24,
      5: 28,
      6: 32,
      'true': 22,
    },
    weight: {
      1: '300',
      2: '400',
      3: '500',
      4: '600',
      5: '700',
      6: '800',
      'true': '400',
    },
    letterSpacing: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      'true': 0,
    },
  },
};

const themes = {
  light: {
    background: tokens.color.background,
    backgroundSoft: tokens.color.backgroundSoft,
    text: tokens.color.text,
    muted: tokens.color.muted,
    border: tokens.color.border,
    primary: tokens.color.primary,
  },
  dark: {
    background: '#020617',
    backgroundSoft: '#111827',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#1f2937',
    primary: '#38bdf8',
  },
};

const shorthands = {
  p: 'padding',
  px: 'paddingHorizontal',
  py: 'paddingVertical',
  m: 'margin',
  mx: 'marginHorizontal',
  my: 'marginVertical',
};

const media = {
  sm: { maxWidth: 600 },
  md: { maxWidth: 900 },
  lg: { maxWidth: 1200 },
  short: { maxHeight: 700 },
  tall: { minHeight: 700 },
  hover: { hover: 'hover' },
  pointerCoarse: { pointer: 'coarse' },
};

const config = createTamagui({
  tokens,
  themes,
  fonts,
  shorthands,
  media,
});

export default config;
