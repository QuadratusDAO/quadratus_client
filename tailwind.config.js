/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      specialElite: ["Special Elite", "cursive"],
    },
    extend: {
      colors: {
        offWhite: "#fcfcfc",
        offWhiteHover: "#f0f0f0",
        offBlack: "#26272b",
        offBlackHover: "#4a4a4a",
        offGray: "#f4f4f5",
        accent: "#915eff",
        accentHover: "#7448d4",
        bgAccent: "#1c1d20",
        borderColor: "#e4e4e7",
        backgroundColor: "#fafafa",
      },
    },
  },
  plugins: [],
};
