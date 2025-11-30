export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",   
          dark: "#1e40af",      
          light: "#3b82f6",     
        },
        danger: {
          DEFAULT: "#dc2626",   
          dark: "#b91c1c",    
        },
        success: {
          DEFAULT: "#16a34a",  
          dark: "#15803d",     
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        200: "200ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),    
    require("@tailwindcss/typography"),
  ],
}
