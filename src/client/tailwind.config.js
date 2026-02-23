/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        chat: {
          bg: '#0b141a',
          panel: '#111b21',
          sidebar: '#202c33',
          bubble: { sent: '#005c4b', received: '#202c33' },
          accent: '#00a884',
          text: '#e9edef',
          muted: '#8696a0',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
