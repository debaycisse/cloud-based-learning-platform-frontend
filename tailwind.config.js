/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#EFF4F7",
          100: "#DCE7ED",
          200: "#B9CFDB",
          300: "#96B7C9",
          400: "#658A9E", // Light primary
          500: "#3A677F", // Medium primary
          600: "#1F4D66", // Main primary
          700: "#0A3349", // Dark primary
          800: "#021D2C", // Very dark primary
          900: "#011520",
          950: "#000A10",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#F0F3F7",
          100: "#DCE3ED",
          200: "#B9C7DB",
          300: "#96ABC9",
          400: "#6986A2", // Light secondary
          500: "#3D6082", // Medium secondary
          600: "#214568", // Main secondary
          700: "#0C2C4B", // Dark secondary
          800: "#02182D", // Very dark secondary
          900: "#010E1A",
          950: "#00060D",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        tertiary: {
          50: "#EFF4F5",
          100: "#DCE8EA",
          200: "#B9D1D5",
          300: "#96BAC0",
          400: "#60919A", // Light tertiary
          500: "#36717C", // Medium tertiary
          600: "#1C5863", // Main tertiary
          700: "#083D47", // Dark tertiary
          800: "#01242A", // Very dark tertiary
          900: "#001518",
          950: "#000A0C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "3/4": "75%",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      zIndex: {
        60: "60",
        70: "70",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
