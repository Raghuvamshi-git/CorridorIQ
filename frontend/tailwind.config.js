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
        transit: {
          bg: '#090d16',
          panel: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          indigo: '#4f46e5',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          slate: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}

