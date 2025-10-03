import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'glass-fill': 'rgba(255, 255, 255, 0.5)',
        'glass-stroke': 'rgba(255, 255, 255, 0.7)',
        'light-bg': '#f8fafc',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-aurora': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-main': 'linear-gradient(to right, #4f46e5, #7c3aed)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 0 100px -20px rgba(99, 102, 241, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
