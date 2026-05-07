/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0f172a',
          900: '#111827',
          800: '#1f2937',
        },
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          300: '#67e8f9',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        signal: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
        card: '0 10px 30px rgba(15, 23, 42, 0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
