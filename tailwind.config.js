/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sda: {
          blue: '#003060', // Navy Blue
          gold: '#BF9553', // Gold approximation
        },
      },
    },
  },
  plugins: [],
}
