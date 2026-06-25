/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9f0',
          100: '#fdf0d6',
          200: '#fbd9a3',
          300: '#f8c06a',
          400: '#F8D299',
          500: '#F5A151',
          600: '#e07a1f',
          700: '#b85c12',
          800: '#944616',
          900: '#773a17',
          950: '#411c07',
        },
        amber: {
          warm: '#F8D299',
          hot: '#F5A151',
        },
        chat: {
          bg: '#f0f2f5',
          'dark-bg': '#0d1117',
          sidebar: '#ffffff',
          'dark-sidebar': '#1a1f2e',
          'msg-out': '#F8D299',
          'msg-in': '#ffffff',
          'dark-msg-out': '#d4882a',
          'dark-msg-in': '#253348',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
        'message-pop': 'messagePop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ripple': 'ripple 0.6s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        messagePop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        }
      },
      boxShadow: {
        'message': '0 1px 2px rgba(0,0,0,0.12)',
        'message-hover': '0 4px 12px rgba(0,0,0,0.15)',
        'sidebar': '2px 0 20px rgba(0,0,0,0.08)',
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'float': '0 8px 32px rgba(0,0,0,0.15)',
        'glow': '0 0 20px rgba(245, 161, 81, 0.4)',
      }
    },
  },
  plugins: [],
}
