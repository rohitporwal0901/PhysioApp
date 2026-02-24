/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Core Teal (Buttons, Active links)
          600: '#0d9488', // Hover state
          900: '#134e4a', // Dark text / Headings
        },
        secondary: {
          500: '#0ea5e9', // Light Blue accent (Icons, badges)
        },
        surface: '#ffffff', // Card backgrounds
        background: '#f8fafc', // App background (Soft slate)
        status: {
          success: '#10b981', // Emerald for "Completed/Available"
          warning: '#f59e0b', // Amber for "Pending"
          danger: '#ef4444',  // Red for "Cancelled"
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
        }
      };
      addUtilities(newUtilities);
    }
  ],
}
