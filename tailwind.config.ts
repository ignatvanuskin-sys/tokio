import type { Config } from 'tailwindcss';

/**
 * Design system — "Precision Graphite".
 *
 * SOURCE: design decision (not business data).
 * Dark graphite/steel surfaces + one powerful accent (signal red, referencing
 * both automotive brake-signal language and the Japanese-flag red that matches
 * the "Токио" brand), plus restrained metallic gradients and hairline borders.
 *
 * Business data is NEVER defined here — see src/data/*.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07080A',
        graphite: '#0D0F12',
        surface: {
          DEFAULT: '#13161A',
          raised: '#181C21',
          sunken: '#0A0C0F',
        },
        hairline: 'rgba(255,255,255,0.08)',
        hairlineStrong: 'rgba(255,255,255,0.16)',
        steel: {
          50: '#F6F7F8',
          200: '#C9CED4',
          400: '#8C949D',
          600: '#5B636C',
          800: '#2A2F35',
        },
        accent: {
          DEFAULT: '#E0242F',
          bright: '#FF3B47',
          deep: '#A8161F',
          wash: 'rgba(224,36,47,0.12)',
        },
        ok: '#2FBF71',
        warn: '#E8A33D',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Mobile-first fluid scale. Clamps keep 320px readable and 1920px composed.
        'display-1': ['clamp(2.35rem, 9.5vw, 5.25rem)', { lineHeight: '0.94', letterSpacing: '-0.035em' }],
        'display-2': ['clamp(1.75rem, 5.6vw, 3rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-3': ['clamp(1.375rem, 4.4vw, 2rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        lead: ['clamp(1rem, 3.4vw, 1.1875rem)', { lineHeight: '1.55', letterSpacing: '-0.01em' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        meta: ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.06em' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.1em' }],
      },
      spacing: {
        gutter: 'clamp(1rem, 4.5vw, 2.5rem)',
        section: 'clamp(3.25rem, 9vw, 7rem)',
      },
      borderRadius: {
        card: '1rem',
        pill: '999px',
      },
      maxWidth: {
        shell: '78rem',
        prose: '42rem',
      },
      boxShadow: {
        // Restrained cinematic shadows — depth without mush.
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
        lift: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 32px 70px -30px rgba(0,0,0,0.95)',
        accent: '0 14px 40px -16px rgba(224,36,47,0.55)',
        sheet: '0 -24px 60px -20px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'metal-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 38%, rgba(255,255,255,0) 100%)',
        'accent-sheen': 'linear-gradient(135deg, #FF4A55 0%, #E0242F 52%, #A8161F 100%)',
        'fade-bottom': 'linear-gradient(180deg, rgba(7,8,10,0) 0%, rgba(7,8,10,0.85) 62%, #07080A 100%)',
      },
      keyframes: {
        'reveal-up': {
          from: { opacity: '0', transform: 'translate3d(0, 18px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'slow-zoom': {
          from: { transform: 'scale(1.04)' },
          to: { transform: 'scale(1.12)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(47,191,113,0.5)' },
          '70%': { boxShadow: '0 0 0 7px rgba(47,191,113,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(47,191,113,0)' },
        },
        'sheet-in': {
          from: { transform: 'translate3d(0, 100%, 0)' },
          to: { transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'reveal-up': 'reveal-up 0.62s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slow-zoom': 'slow-zoom 18s ease-out both',
        shimmer: 'shimmer 2.6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        'sheet-in': 'sheet-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.24s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
