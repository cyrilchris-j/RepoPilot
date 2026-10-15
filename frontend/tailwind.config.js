/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base dark surfaces - Apple-style deep space
        bg:        '#080A0F',
        surface:   '#0D1117',
        elevated:  '#131B24',
        overlay:   '#1A2433',
        border:    '#1E2D40',
        'border-subtle': '#162030',

        // Text hierarchy
        'text-primary':   '#F0F6FF',
        'text-secondary': '#7A90A8',
        'text-muted':     '#4A5E72',

        // Premium accents
        'accent-blue':   '#3B82F6',
        'accent-cyan':   '#22D3EE',
        'accent-violet': '#8B5CF6',
        'accent-indigo': '#6366F1',
        'accent-pink':   '#EC4899',
        'accent-teal':   '#14B8A6',

        // Status
        success:  '#10B981',
        warning:  '#F59E0B',
        error:    '#EF4444',
        info:     '#3B82F6',
      },
      fontFamily: {
        sans:  ['"SF Pro Display"', '"SF Pro Text"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono:  ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"SF Pro Display"', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'glass': '1.25rem',
      },
      backdropBlur: {
        'glass': '20px',
        'heavy': '40px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)',
        'mesh-blue': 'radial-gradient(ellipse at top, #0D2545 0%, transparent 60%), radial-gradient(ellipse at bottom right, #1A1040 0%, transparent 60%)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 9s ease-in-out infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in':    'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':     'fadeIn 0.35s ease-out',
        'scale-in':    'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer':     'shimmer 2s linear infinite',
        'blink':       'blink 1s step-end infinite',
        'scan':        'scan 2s linear infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        scan: {
          '0%':   { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':    '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
        'glow-cyan':   '0 0 20px rgba(34, 211, 238, 0.25), 0 0 60px rgba(34, 211, 238, 0.08)',
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.1)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'inner-shine': 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'clay':        '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
        'elevated':    '0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
      },
      borderColor: {
        DEFAULT: '#1E2D40',
      },
    },
  },
  plugins: [],
}
