/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reemplaza el gray azulado de Tailwind por zinc (neutral sin tinte azul)
        gray: colors.zinc,
        primary: {
          DEFAULT: '#FF7EB9', // Rosa claro del logo
          dark: '#E05C99',
          light: '#FFD1EA',
        },
        dark: {
          DEFAULT: '#000000',
          lighter: '#1a1a1a',
          light: '#2d2d2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
