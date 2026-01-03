/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        intensity: {
          'very-low': '#7CB342',
          'low': '#8BC34A',
          'moderate': '#FFC107',
          'high': '#FF9800',
          'very-high': '#F44336',
        }
      }
    },
  },
  plugins: [],
}
