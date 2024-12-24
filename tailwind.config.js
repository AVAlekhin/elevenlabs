/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient-spin 8s linear infinite, gradient-move 4s ease infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      borderColor: {
        DEFAULT: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 