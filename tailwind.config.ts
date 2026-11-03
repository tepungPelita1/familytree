import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          raise: 'var(--ink-raise)',
        },
        surface: 'var(--surface)',
        gold: {
          DEFAULT: 'var(--gold)',
          bright: 'var(--gold-bright)',
        },
        bronze: 'var(--bronze)',
        ivory: {
          DEFAULT: 'var(--ivory)',
          dim: 'var(--ivory-dim)',
        },
        grey: 'var(--grey)',
        rule: 'var(--rule)',
      },
      fontFamily: {
        serif: 'var(--font-spectral), Georgia, serif',
        sans: 'var(--font-archivo), system-ui, sans-serif',
      },
      maxWidth: {
        measure: '66ch',
      },
      transitionTimingFunction: {
        quiet: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
