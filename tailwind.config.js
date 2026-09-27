/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './explore/index.html',
    './src/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          base: 'var(--bg-base)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent-primary)',
          'accent-secondary': 'var(--accent-secondary)',
          gold: 'var(--accent-gold)',
          glow: 'var(--glow-primary)',
        },
        // Kept for backward compatibility with existing components
        garba: {
          50: '#fff5e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        surface: {
          900: 'var(--bg-base)',
          800: 'var(--bg-card)',
          700: 'var(--player-bg)',
          600: 'var(--chip-bg)',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
