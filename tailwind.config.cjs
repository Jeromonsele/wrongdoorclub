/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Arial"],
        display: ["Cabinet Grotesk", "Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        cream: "#FAF6EF",
        amber: {
          50: "#FFF8E7",
          100: "#FFEFC2",
          200: "#FFE59A",
          300: "#FFD466",
          400: "#FFB938",
          500: "#FF9C0A",
          600: "#E08007",
          700: "#B36205",
          800: "#804604",
          900: "#4D2A02"
        },
        clay: "#2E2A25"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      gradientColorStops: {
        "sun-1": "#FFF3C4",
        "sun-2": "#FFD08A",
        "sun-3": "#FFAF70"
      }
    }
  },
  plugins: []
};

