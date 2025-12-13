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
        // Remove CSS variables for now - use direct colors
        primary: "#FF6B35",
        'primary-foreground': "#ffffff",
        secondary: "#1A535C",
        'secondary-foreground': "#ffffff",
        accent: "#FFE66D",
        'accent-foreground': "#000000",
        // Malawi colors
        'malawi-red': '#FF6B35',
        'malawi-blue': '#1A535C',
        'malawi-yellow': '#FFE66D',
        'malawi-green': '#4ECDC4',
        'malawi-purple': '#6C63FF',
        'malawi-dark': '#1A1A2E',
        'malawi-light': '#F7F9FC',
      },
      fontFamily: {
  sans: ['var(--font-inter)', 'sans-serif'],
  heading: ['var(--font-poppins)', 'sans-serif'],
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
  // Remove plugins for now
  plugins: [],
}
export default config