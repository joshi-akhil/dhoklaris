/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dhokla: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          golden: '#F4C430',
          khaman: '#FFB800',
        },
        curry: {
          dark: '#14281D',
          leaf: '#1E442F',
          light: '#2E6F40',
          lime: '#4ADE80',
        },
        saffron: {
          DEFAULT: '#FF7722',
          glow: '#FFA044',
        },
        slatebg: {
          darkest: '#0F1412',
          card: '#161F1A',
          border: '#24342B',
        }
      },
      fontFamily: {
        game: ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Cabinet Grotesk"', '"Outfit"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-subtle': 'bounce 2s infinite',
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
