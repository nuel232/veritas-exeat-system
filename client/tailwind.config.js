/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(8px) rotate(-1deg)' },
          '66%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        'slide-in-left': {
          'from': { transform: 'translateX(-50px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
} 