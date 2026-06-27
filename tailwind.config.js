/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./options.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#ccd5e4',
          300: '#a7b8d2',
          400: '#7b95bc',
          500: '#5c78a3',
          600: '#485f86',
          700: '#3b4e6d',
          800: '#33415c',
          900: '#2b374e',
          950: '#1d2435',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
