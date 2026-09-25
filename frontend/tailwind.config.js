/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#08090B',
        surface: '#0E1116',
        elevated: '#131720',
        border: '#242A35',
        'text-primary': '#F4F7FA',
        'text-secondary': '#8B95A7',
        'accent-cyan': '#67E8F9',
        'accent-violet': '#8B7CFF',
        success: '#5EE6A8',
        warning: '#F5C76A',
        error: '#FF6B7A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      borderColor: {
        DEFAULT: '#242A35',
      },
    },
  },
  plugins: [],
}
