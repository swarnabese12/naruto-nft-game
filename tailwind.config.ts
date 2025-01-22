/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shake: "shake 0.5s ease-in-out",
      },
      fontFamily: {
        game: ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
};