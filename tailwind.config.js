/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - #4560FF and its shades
        primary: {
          50:  '#eef0ff',
          100: '#dde1ff',
          200: '#bbc3ff',
          300: '#99a5ff',
          400: '#7787ff',
          500: '#4560FF', // Main color
          600: '#3a50d9',
          700: '#2e40b3',
          800: '#23308c',
          900: '#172066',
          950: '#0b1040',
        },
        // Secondary color - #EBF3FF for badges and active states
        secondary: '#EBF3FF',
      },
    },
  },
  plugins: [],
}



