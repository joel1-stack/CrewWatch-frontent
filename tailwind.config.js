/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cabin: { 900: "#0b1220", 800: "#111c33", 700: "#1a2a47" },
        ok: "#22c55e",
        warn: "#eab308",
        alert: "#f97316",
        danger: "#ef4444"
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      }
    }
  },
  plugins: []
};
