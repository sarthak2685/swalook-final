/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This will cover all JS, JSX, TS, and TSX files in the src folder
    "./src/components/Pages/**/*.{js,jsx,ts,tsx}" // You can also explicitly mention the path to your components if needed
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
}