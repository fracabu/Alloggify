/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb-inspired color palette
        primary: {
          50: '#fff5f7',
          100: '#ffe4e8',
          200: '#ffcdd6',
          300: '#ffaab8',
          400: '#ff7a91',
          500: '#FF385C', // Main Airbnb red
          600: '#e31c5f',
          700: '#c13584',
          800: '#a41063',
          900: '#8b0a50',
        },
        dark: {
          DEFAULT: '#222222',
          light: '#484848',
        },
        gray: {
          light: '#717171',
          lighter: '#B0B0B0',
          lightest: '#F7F7F7',
        },
      },
    },
  },
  plugins: [],
}
