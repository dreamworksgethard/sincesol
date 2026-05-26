/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#00000a',
          1: '#05060f',
          2: '#0a0b18',
          3: '#10111e',
        },
        brand: {
          cyan:    '#a0b8ff',
          primary: '#1800cc',
          bright:  '#3300ff',
          light:   'white',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%':   { transform: 'translate3d(-12%,-8%,0) rotate(-4deg)' },
          '50%':  { transform: 'translate3d(12%,8%,0)  rotate(6deg)' },
          '100%': { transform: 'translate3d(-12%,-8%,0) rotate(-4deg)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        'scroll-x': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        'sec-gradient': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'border-flow': {
          '0%':   { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        'check-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up':      'fade-up 0.55s ease both',
        aurora:         'aurora 16s ease-in-out infinite',
        shimmer:        'shimmer 1.6s ease-in-out',
        'scroll-x':     'scroll-x 30s linear infinite',
        pulse2:         'pulse2 2.4s ease-in-out infinite',
        scanline:       'scanline 3s linear infinite',
        'sec-gradient': 'sec-gradient 8s ease infinite',
        'check-in':     'check-in 0.4s ease both',
      },
    },
  },
  plugins: [],
}
