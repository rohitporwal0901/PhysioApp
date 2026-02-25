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
          50:  '#edfaf8',
          100: '#d1f4ef',
          200: '#a8e9de',
          300: '#6fd8ca',
          400: '#3cc0b0',
          500: '#0F9B8E', // Core teal — updated from design
          600: '#0d8679',
          700: '#0b6e64',
          800: '#0a5750',
          900: '#09413c',
        },
        secondary: {
          400: '#34D399',
          500: '#10B981', // Emerald green
          600: '#059669',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9', // Sky blue
          600: '#0284c7',
        },
        surface:     '#ffffff',
        background:  '#f0faf9',     // light teal tint
        darkbg:      '#0d1f1e',     // very dark teal
        darkcard:    '#152928',
        status: {
          success: '#10B981',
          warning: '#f59e0b',
          danger:  '#ef4444',
          info:    '#0ea5e9',
        }
      },
      boxShadow: {
        'glass':      '0 4px 6px -1px rgba(15,155,142,0.08), 0 2px 4px -1px rgba(15,155,142,0.04)',
        'glow':       '0 0 20px rgba(15,155,142,0.25)',
        'glow-lg':    '0 0 40px rgba(15,155,142,0.20)',
        'card':       '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in-up':   'fadeInUp 0.6s ease-out forwards',
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'slide-in':     'slideIn 0.5s ease-out forwards',
        'blob':         'blob 7s infinite',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(15,155,142,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(15,155,142,0.6)' },
        },
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-2000': { 'animation-delay': '2s' },
        '.animation-delay-4000': { 'animation-delay': '4s' },
        '.animation-delay-1000': { 'animation-delay': '1s' },
        '.bg-glassmorphism': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255,255,255,0.5)',
        },
        '.text-gradient': {
          'background':  'linear-gradient(135deg, #0F9B8E, #10B981)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      };
      addUtilities(newUtilities);
    }
  ],
}
