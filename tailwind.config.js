/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Paleta de marca: acento violeta + sombras suaves para un look actual sin perder legibilidad en tablas
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft:
          "0 2px 15px -3px rgb(15 23 42 / 0.07), 0 4px 8px -4px rgb(15 23 42 / 0.05)",
        card:
          "0 0 0 1px rgb(15 23 42 / 0.05), 0 18px 50px -15px rgb(79 70 229 / 0.18)",
        glow: "0 0 40px -10px rgb(99 102 241 / 0.45)",
      },
      backgroundImage: {
        "app-mesh":
          "radial-gradient(900px circle at 15% 10%, rgb(224 231 255 / 0.9) 0%, transparent 55%), radial-gradient(700px circle at 85% 5%, rgb(207 250 254 / 0.55) 0%, transparent 45%), radial-gradient(800px circle at 50% 100%, rgb(243 232 255 / 0.7) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};
