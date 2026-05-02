/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Space Grotesk"', 'sans-serif'],
      mono: ['"Space Mono"', 'monospace'],
    },
    extend: {
      colors: {
        bg: '#F2F0EB',
        card: '#FAFAF7',
        cardSecondary: '#F5F3EE',
        inkPrimary: '#1A1A1A',
        inkSecondary: '#555550',
        inkMuted: '#888880',
        accentPrimary: '#2D5A27',
        accentLight: '#C8E6C0',
        gold: '#B8860B',
        goldLight: '#FFF3CC',
        red: '#C0392B',
        redLight: '#FDECEA',
        blue: '#1A3A5C',
        blueLight: '#E8F0FB',
        borderLight: 'rgba(0,0,0,0.08)'
      },
      borderRadius: {
        'std': '28px',
        'hero': '36px',
        'chip': '20px'
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.6s cubic-bezier(.34,1.56,.64,1) backwards',
      }
    },
  },
  plugins: [],
}
