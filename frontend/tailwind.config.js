/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          dark: '#0D47A1',
          light: '#E3F2FD'
        },
        slate: {
          background: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0'
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626'
        }
      }
    },
  },
  plugins: [],
}
