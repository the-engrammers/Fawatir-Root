/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#09090b", // Pure black/ink
          800: "#18181b",
          700: "#3f3f46",
          600: "#52525b",
          500: "#71717a",
          400: "#a1a1aa",
          200: "#e4e4e7", // Subtle borders
          100: "#f4f4f5", // Light hover states
          50: "#fafafa",
        },
        paper: {
          DEFAULT: "#FAFAFA", // Pristine off-white
          card: "rgba(255, 255, 255, 0.7)", // Translucent white for glass bento
        },
        brass: {
          DEFAULT: "#4F46E5", // Vibrant Indigo
          light: "#818CF8",
          dark: "#3730A3",
        },
        status: {
          success: "#059669",
          successBg: "rgba(16, 185, 129, 0.1)",
          warning: "#D97706",
          warningBg: "rgba(245, 158, 11, 0.1)",
          danger: "#DC2626",
          dangerBg: "rgba(239, 68, 68, 0.1)",
          info: "#2563EB",
          infoBg: "rgba(59, 130, 246, 0.1)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        bento: "0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.02)",
        'bento-hover': "0 30px 60px -15px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0,0,0,0.03)",
        glow: "0 0 20px rgba(79, 70, 229, 0.2)",
        glass: "inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0,0,0,0.02)",
        spatial: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        'spatial-hover': "0 35px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      },
      borderRadius: {
        card: "28px", // Even larger border radius for Spatial boxes
        super: "36px",
      },
      backgroundImage: {
        'gradient-ai': 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)',
        'spatial-bg': 'radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.04), transparent 25%), radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.04), transparent 25%)',
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        scan: "scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%, 100%": { top: "0%", opacity: "0" },
          "10%, 90%": { opacity: "1" },
          "50%": { top: "100%" },
        },
      }
    },
  },
  plugins: [],
};
