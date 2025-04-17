/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#BF4B54",
        secondary: "#46658C",
        light: "#F2E4BB",
        accent1: "#D98C4A",
        accent2: "#D99379",
      },
    },
  },
  plugins: [],
};
