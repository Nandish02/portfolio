/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        heading: ["Nunito Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      colors: {
        background: "#FAFAFA",
        foreground: "#0f172a",
        primary: { DEFAULT: "#18181B", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#334155", foreground: "#FFFFFF" },
        muted: { DEFAULT: "#F1F5F9", foreground: "#64748B" },
        accent: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
          light: "#818CF8",
          dark: "#3730A3",
        },
        warm: {
          DEFAULT: "#F59E0B",
          rose: "#E11D48",
          emerald: "#059669",
          violet: "#7C3AED",
          sky: "#0284C7",
        },
        card: { DEFAULT: "#FFFFFF", foreground: "#0f172a" },
        border: "#E2E8F0",
        destructive: "#DC2626",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "gradient-x": "gradientX 6s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "blur-reveal": "blurReveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-reveal": "scaleReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "slide-up-spring": "slideUpSpring 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "typewriter-cursor": "typewriterBlink 0.7s steps(1) infinite",
        "spin-slow": "spin 12s linear infinite",
        "morph": "morph 8s ease-in-out infinite",
        "wave": "wave 20s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "draw-line": "drawLine 1.5s ease-out forwards",
        "rotate-in": "rotateIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "magnetic-hover": "magneticPulse 0.4s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        blurReveal: {
          "0%": { opacity: "0", filter: "blur(12px)", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", filter: "blur(0px)", transform: "translateY(0) scale(1)" },
        },
        scaleReveal: {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        slideUpSpring: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "60%": { opacity: "1", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typewriterBlink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 60% 30% 60% / 30% 60% 70% 40%" },
          "75%": { borderRadius: "60% 40% 60% 30% / 40% 50% 60% 50%" },
        },
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "100%" },
          "100%": { strokeDashoffset: "0%" },
        },
        rotateIn: {
          "0%": { opacity: "0", transform: "rotate(-10deg) scale(0.9)" },
          "100%": { opacity: "1", transform: "rotate(0deg) scale(1)" },
        },
        magneticPulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backgroundSize: {
        "300%": "300%",
        "400%": "400%",
      },
    },
  },
  plugins: [],
};
