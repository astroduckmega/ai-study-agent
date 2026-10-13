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
        surface: {
          DEFAULT: '#0b1326',
          dim: '#0b1326',
          bright: '#31394d',
          lowest: '#060e20',
          low: '#131b2e',
          container: '#171f33',
          high: '#222a3d',
          highest: '#2d3449',
        },
        'on-surface': {
          DEFAULT: '#dae2fd',
          variant: '#c7c4d7',
        },
        outline: {
          DEFAULT: '#908fa0',
          variant: '#464554',
        },
        primary: {
          DEFAULT: '#c0c1ff',
          on: '#1000a9',
          container: '#8083ff',
          'on-container': '#0d0096',
          inverse: '#494bd6',
        },
        secondary: {
          DEFAULT: '#4edea3',
          on: '#003824',
          container: '#00a572',
          'on-container': '#00311f',
        },
        tertiary: {
          DEFAULT: '#ffb95f',
          on: '#472a00',
          container: '#ca8100',
          'on-container': '#3e2400',
        },
        error: {
          DEFAULT: '#ffb4ab',
          on: '#690005',
          container: '#93000a',
          'on-container': '#ffdad6',
        },
        brand: {
          50: '#f0f2ff',
          100: '#e1e0ff',
          200: '#c0c1ff',
          300: '#a4a7ff',
          400: '#8083ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
          950: '#0e0d29',
        },
        dark: {
          bg: '#0b1326',
          card: '#131b2e',
          surface: '#171f33',
          border: '#2d3449'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      }
    },
  },
  plugins: [],
}
