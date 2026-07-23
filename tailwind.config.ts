import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pratisig: {
          primary: '#1a3a5c',
          secondary: '#e8a020',
          accent: '#27ae60',
          danger: '#e74c3c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
