/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070A0F',
        surface: {
          DEFAULT: '#0D121F',
          card: '#111827',
          elevated: '#172033',
          border: '#1F293D',
          hover: '#24304A',
        },
        emergency: {
          flame: '#FF5722',
          red: '#EF4444',
          amber: '#F59E0B',
          glow: 'rgba(255, 87, 34, 0.25)',
        },
        cyber: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
