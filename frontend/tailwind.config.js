/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: '#2F6B4F',
        soil: '#8B5E3C',
        accent: '#3A8DDE',
        background: '#F4F7F5',
        'text-dark': '#1E2A24',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.08)',
        soft: '0 4px 24px rgba(0,0,0,0.06)',
        glow: '0 0 20px rgba(47, 107, 79, 0.25)',
        'glow-accent': '0 0 20px rgba(58, 141, 222, 0.2)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
      },
      transitionDuration: {
        slow: '400ms',
        natural: '500ms',
      },
    },
  },
  plugins: [],
}
