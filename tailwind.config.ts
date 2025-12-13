import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Vibrant Malawi-inspired colors
        primary: {
          DEFAULT: "#FF6B35", // Vibrant Orange
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1A535C", // Teal Blue
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#FFE66D", // Bright Yellow
          foreground: "#000000",
        },
        malawi: {
          red: "#FF6B35",
          blue: "#1A535C",
          yellow: "#FFE66D",
          green: "#4ECDC4",
          purple: "#6C63FF",
          dark: "#1A1A2E",
          light: "#F7F9FC",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "slide-up": {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-malawi': 'linear-gradient(135deg, #FF6B35 0%, #FFE66D 50%, #4ECDC4 100%)',
        'gradient-vibrant': 'linear-gradient(90deg, #FF6B35, #FFE66D, #4ECDC4, #6C63FF)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config