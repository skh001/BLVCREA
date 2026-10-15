/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50:  '#fff1f4',
          100: '#ffe4ea',
          200: '#ffc9d5',
          300: '#ff9db3',
          400: '#ff6689',
          500: '#ff3366',
          600: '#ed1a4c',
          700: '#c8103c',
          800: '#a81037',
          900: '#8f1234',
        },
        blush: {
          50:  '#fdf8f8',
          100: '#faf0f0',
          200: '#f5e0e2',
          300: '#edc5c9',
          400: '#e0a0a8',
          500: '#d07a86',
          600: '#b85a6a',
          700: '#984455',
          800: '#7d3847',
          900: '#69313e',
        },
        cream: '#fdf9f7',
        petal: '#f9eef0',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        script: ['Great Vibes', 'cursive'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
