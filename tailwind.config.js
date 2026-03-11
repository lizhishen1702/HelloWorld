/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
      }
    },
  },
  plugins: [],
}
