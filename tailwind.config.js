/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        ember:   { DEFAULT: '#ea580c', dark: '#c2410c', light: '#fdf1ec' },
        steel:   { DEFAULT: '#1a1f2e', mid: '#252c3f', light: '#2f3850' },
        success: { DEFAULT: '#3ecf8e', light: '#edfaf4' },
        warn:    { DEFAULT: '#f5a623', light: '#fffbf0' },
        cold:    { DEFAULT: '#4a9eff', light: '#eef5ff' },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
