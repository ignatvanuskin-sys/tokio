import type { Config } from 'tailwindcss';

/**
 * Дизайн-система «Токио» — тёмный автомобильный стиль.
 *
 * Значения совпадают с дизайн-системой проекта «Керей»: графит/металл,
 * один акцент — оранжевый #ff5a1f, сжатая типографика Oswald для заголовков
 * и Inter для интерфейса. Те же CSS-переменные объявлены в globals.css, чтобы
 * произвольные значения вида bg-[var(--color-accent)] работали одинаково.
 *
 * Бизнес-данные здесь НЕ хранятся — см. src/data/*.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Фон и поверхности
        ink: '#0b0c0e',
        graphite: '#0f1114',
        surface: {
          DEFAULT: '#131518',
          raised: '#1a1d21',
          sunken: '#0e1012',
        },
        // Границы
        hairline: '#272c32',
        hairlineStrong: '#3a4149',
        // Текст: ink → chrome → muted → faint
        steel: {
          50: '#f4f5f6',
          200: '#c9cfd6',
          400: '#98a0aa',
          600: '#6a727c',
          800: '#3a4149',
        },
        // Единственный акцент
        accent: {
          DEFAULT: '#ff5a1f',
          bright: '#ff7a45',
          deep: '#cc4413',
          wash: 'rgba(255,90,31,0.12)',
          ink: '#0b0c0e',
        },
        ok: '#22c55e',
        warn: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-display)', 'Oswald', 'Arial Narrow', 'system-ui', 'sans-serif'],
        // Мета-подписи и числовые значения: системный моно, без загрузки файла.
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Клам-шкала Керей: заголовки = Oswald uppercase, крупно и сжато.
        'display-1': ['clamp(37px, 8.2vw, 74px)', { lineHeight: '1.06', letterSpacing: '0.005em' }],
        'display-2': ['clamp(28px, 5vw, 46px)', { lineHeight: '1.12' }],
        'display-3': ['clamp(20px, 3vw, 26px)', { lineHeight: '1.16' }],
        lead: ['clamp(15px, 2.6vw, 18px)', { lineHeight: '1.6' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        meta: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
        micro: ['0.6875rem', { lineHeight: '1.35', letterSpacing: '0.18em' }],
      },
      spacing: {
        gutter: '18px',
        section: 'clamp(48px, 9vw, 104px)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: '999px',
      },
      maxWidth: {
        shell: '1240px',
        prose: '46rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -28px rgba(0,0,0,0.9)',
        lift: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 32px 70px -34px rgba(0,0,0,0.95)',
        // Оранжевое свечение основной кнопки — как в «Керей».
        accent: '0 8px 30px -12px rgba(255,90,31,0.7)',
        sheet: '0 -20px 50px -20px rgba(0,0,0,0.85)',
      },
      keyframes: {
        'slow-zoom': {
          from: { transform: 'scale(1.04)' },
          to: { transform: 'scale(1.1)' },
        },
        'pulse-dot': {
          '0%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.5)' },
          '70%': { boxShadow: '0 0 0 7px rgba(34,197,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
        },
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s ease-out both',
        'pulse-dot': 'pulse-dot 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
