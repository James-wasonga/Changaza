/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          black: "#0B1210",
          deep: "#122019",
          card: "#152920",
          line: "#22392E",
        },
        gold: {
          DEFAULT: "#D4A54A",
          bright: "#EAC66B",
          dim: "#8A6A2E",
        },
        chalk: "#F3EFE6",
        mute: "#9BAAA0",
        coral: "#E2543A",
        teal: "#2E5C4C",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Work Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        pulseSoft: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        riseIn: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        riseIn: "riseIn 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
