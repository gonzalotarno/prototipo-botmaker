/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Botmaker primary palette
        brand: {
          DEFAULT: '#304FFE',
          dark:    '#0026CA',
          light:   '#7A7CFF',
          subtle:  '#E6EAFF',
          hover:   '#EEF1FF',
        },
        // Legacy aliases (keep existing code working)
        'brand-light':  '#E6EAFF',
        'brand-border': '#E6EAFF',
        'brand-hover':  '#EEF1FF',
        // Botmaker neutral greys
        bm: {
          900: '#212121',
          800: '#424242',
          600: '#757575',
          500: '#9E9E9E',
          300: '#E0E0E0',
          100: '#F5F5F5',
        },
      },
      fontFamily: {
        sans:  ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        pill: '100px',
      },
      boxShadow: {
        bm: '0px 5.342px 16.027px 0px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
