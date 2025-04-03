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
          DEFAULT: '#6698FF',
          light: '#87B5FF',
          dark: '#4D7FFF'
        },
        secondary: {
          DEFAULT: '#FF6D5A',
          light: '#FF8A7C',
          dark: '#E65A49'
        },
        accent: '#FFB446',
        surface: {
          50: '#f8fafc',   // Lightest
          100: '#f1f5f9',
          200: '#e2e8f0', 
          300: '#cbd5e1',
          400: '#94a3b8',  
          500: '#64748b',  
          600: '#475569',  
          700: '#334155',  
          800: '#1e293b',  
          900: '#0f172a'   // Darkest
        },
        n8n: {
          canvas: '#F9FAFC',
          canvasDark: '#22272E',
          grid: '#E5E7EB',
          gridDark: '#2D333B',
          node: '#FFFFFF',
          nodeDark: '#32363F',
          nodeHeader: '#F5F8FF',
          nodeHeaderDark: '#394256',
          port: '#DBEAFE',
          portDark: '#444C5F',
          portHover: '#3B82F6',
          portActive: '#2563EB',
          connection: '#C3D1EB',
          connectionDark: '#4D5566'
        }      
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'n8n-node': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'n8n-node-dark': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'n8n-node-selected': '0 0 0 2px #6698FF, 0 4px 8px rgba(0, 0, 0, 0.12)',
        'n8n-node-selected-dark': '0 0 0 2px #6698FF, 0 4px 8px rgba(0, 0, 0, 0.25)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        'n8n': '0.375rem'
      }    
    }  
  },
  plugins: [],
  darkMode: 'class',
}