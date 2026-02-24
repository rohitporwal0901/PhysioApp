/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      heading: ['Outfit', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Core Teal (Healing, Fresh)
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          400: '#38bdf8',
          500: '#0ea5e9', // Sky Blue accent
          600: '#0284c7',
        },
        surface: '#ffffff',
        background: '#f8fafc',
        darkbg: '#0f172a', // Rich midnight blue
        darkcard: '#1e293b',
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(20, 184, 166, 0.08), 0 2px 4px -1px rgba(20, 184, 166, 0.04)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        }
      };
      addUtilities(newUtilities);
    }
  ],
}
