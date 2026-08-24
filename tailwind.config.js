/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0984e3',
        secondary: '#6c5ce7',
        dark: '#2d3436',
        success: '#00b894',
        danger: '#d63031',
        warning: '#f1c40f',
        light: '#f0f2f5',
      },
      fontFamily: {
        kantumruy: ['"Kantumruy Pro"', 'sans-serif'],
      },
      animation: {
        'bot-pulse': 'botPulse 2.5s ease-in-out infinite',
        'scan-laser': 'scanLaserABA 2.5s infinite linear',
        'slider-move': 'moveLeftToRight 35s linear infinite',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        botPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        scanLaserABA: {
          '0%': { top: '2%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '98%', opacity: '0' },
        },
        moveLeftToRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
