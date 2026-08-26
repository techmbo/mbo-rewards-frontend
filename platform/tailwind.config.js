/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdbfa",
          300: "#8ec2f5",
          400: "#5aa3eb",
          500: "#3486d9",
          600: "#1f6bb8",
          700: "#185692",
          800: "#164876",
          900: "#153c61",
          950: "#0c243d",
        },
        surface: {
          page: "#f3f5f8",
          card: "#ffffff",
          muted: "#e8ecf1",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        panel: "0.75rem",
      },
    },
  },
  plugins: [],
};
