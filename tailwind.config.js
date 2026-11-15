/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Depth layers: Void behind everything, then lifted surfaces.
        void: "#03060F",
        deep: "#070C1B",
        orbiter: "#0D1426",
        panel: "#121A30",
        edge: "#1B2845",
        // NASA brand anchors, used sparingly.
        nasa: { blue: "#0B3D91", red: "#FC3D21" },
        // Mission control accent: the color that says the system is breathing.
        telemetry: { DEFAULT: "#22D3EE", glow: "#67E8F9" },
        // Text scale: never pure white against the deep background.
        ink: { DEFAULT: "#E6EDF7", dim: "#9FB0C6", muted: "#7C8AA0" },
        // Status ladder utility tones (bright values from STATUS_STYLE).
        ok: "#10B981",
        warn: "#FACC15",
        alarm: "#FB923C",
        danger: "#FC3D21"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(3,6,15,0.5)",
        lift: "0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px rgba(3,6,15,0.65)"
      }
    }
  },
  plugins: []
};
