/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#030712"
      },
      boxShadow: {
        glass: "0 20px 60px rgba(3, 7, 18, 0.45)"
      },
      backgroundImage: {
        "desktop-grid":
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.15), transparent 30%)"
      }
    }
  },
  plugins: []
};
