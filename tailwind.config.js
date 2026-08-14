/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lotto: {
          yellow: '#FBC400',
          blue: '#69C8F2',
          red: '#FF7272',
          gray: '#AAAAAA',
          green: '#B0D840',
        }
      },
      animation: {
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shine': 'shine 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.3) rotate(-10deg)', opacity: '0' },
          '70%': { transform: 'scale(1.1) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        shine: {
          '100%': { left: '125%' },
        }
      }
    },
  },
  plugins: [],
}
