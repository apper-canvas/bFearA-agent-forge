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
        primary: {
          DEFAULT: '#6698FF',
          dark: '#4D7FFF',
          light: '#D4E1FF',
        },
        surface: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        n8n: {
          canvas: '#f8f9fb',
          canvasDark: '#1a1c23',
          node: '#ffffff',
          nodeDark: '#2d2e40',
          port: '#f8f9fb',
          portDark: '#1a1c23',
          portHover: '#9ca6bc',
          portActive: '#6698FF',
          connection: '#b9c2d4',
          connectionDark: '#525564',
        }
      },
      borderRadius: {
        'n8n': '0.375rem',
      },
      boxShadow: {
        'n8n-node': '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'n8n-node-dark': '0 4px 8px -2px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'n8n-node-selected': '0 0 0 2px rgba(102, 152, 255, 0.5), 0 4px 12px rgba(102, 152, 255, 0.2)',
      },
      strokeWidth: {
        '2': '2',
        '3': '3',
        '4': '4',
      },
    },
  },
  plugins: [],
}