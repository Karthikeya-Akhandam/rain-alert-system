/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        card: "#0f172a",
        primary: "#38bdf8",
        border: "#1e293b",
      },
    },
  },
  plugins: [],
}
