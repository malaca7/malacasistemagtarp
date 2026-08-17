/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          purple: '#a855f7',
          emerald: '#10b981',
          danger: '#ef4444',
          dark: '#0f172a',
          card: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(244, 63, 94, 0.5), 0 0 10px rgba(244, 63, 94, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.9), 0 0 25px rgba(244, 63, 94, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
