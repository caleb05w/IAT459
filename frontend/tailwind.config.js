/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F4F2F0",
        secondary: "#999999",
        "gray-bg": "#F6F6F6",
        tertiary: "#E2E1DD",
      },
    },
  },
  plugins: [],
}
