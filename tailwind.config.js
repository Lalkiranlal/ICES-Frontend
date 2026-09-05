/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#f4f4f5',
        card: {
          DEFAULT: '#09090c',
          foreground: '#f4f4f5',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        surface: {
          ground: '#000000',
          panel: '#09090c',
          elevated: '#111115',
          hover: '#16161b',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.16)',
          focus: '#ffffff',
        },
        text: {
          lead: '#ffffff',
          body: '#a1a1aa',
          muted: '#71717a',
          dim: '#52525b',
        },
        status: {
          crimson: '#ef4444',
          crimsonDim: 'rgba(239, 68, 68, 0.1)',
          emerald: '#10b981',
          emeraldDim: 'rgba(16, 185, 129, 0.1)',
          amber: '#f59e0b',
          amberDim: 'rgba(245, 158, 11, 0.1)',
          cyan: '#38bdf8',
          cyanDim: 'rgba(56, 189, 248, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle-card': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'minimal-popover': '0 12px 32px rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
}


