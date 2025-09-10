/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // adjust based on your project
  ],
  theme: {
    extend: {
      colors: {
        customBlue: "#002349",
        customGold: "#957C3D",
      },
    },
  },
  plugins: [],
};
