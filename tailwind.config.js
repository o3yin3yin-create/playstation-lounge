/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clash: {
          black: "#171717",
          dark: "#121212",
          surface: "#1E1E1E",
          card: "#242424",
          cardhover: "#2D2D2D",
          orange: "#F25623",
          "orange-hover": "#E04816",
          "orange-subtle": "rgba(242, 86, 35, 0.15)",
          darkgray: "#4D4D4D",
          lightgray: "#DEDEDE",
          border: "#4D4D4D",
          muted: "#8C8C8C",
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        clash: ['"Rubik Burned"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
