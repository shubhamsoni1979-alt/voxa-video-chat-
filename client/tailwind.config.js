/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serifHeading: ['Merriweather', 'Playfair Display', 'serif'],
        heading: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        spidey2: {
          crimson: '#B8001C',
          darkCrimson: '#8B0014',
          deepRed: '#A0001A',
          black: '#0A0A0A',
          charcoal: '#141414',
          white: '#FFFFFF',
          offWhite: '#F8FAFC',
          yellow: '#FFC72C'
        }
      },
      boxShadow: {
        'spidey-shadow': '0 20px 40px rgba(184, 0, 28, 0.3)',
        'spidey-card': '0 25px 50px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-spidey': 'pulseSpidey 2s infinite ease-in-out',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        pulseSpidey: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
