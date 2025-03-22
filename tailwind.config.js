
import tailwindForms from '@tailwindcss/forms';
import tailwindTypography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in the src folder
  ],
  theme: {
    extend: {
      // Add customizations to the default theme here
      colors: {
        primary: "#3490dc", // Example custom color
        secondary: "#ffed4a",
        danger: "#e3342f",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Example custom font
      },
    },
  },
  plugins: [
    // Add Tailwind plugins here
    tailwindForms, // Example plugin for form styling
    tailwindTypography, // Example plugin for typography
  ],
};