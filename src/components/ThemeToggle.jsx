import React from 'react'
import { Moon, Sun } from 'lucide-react'

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button 
      onClick={toggleTheme}
      className="relative w-10 h-5 bg-surface-200 dark:bg-surface-700 rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-surface-900"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span 
        className="absolute left-0.5 top-0.5 flex items-center justify-center w-4 h-4 bg-white dark:bg-primary rounded-full shadow-sm transform transition-transform duration-300 ease-in-out dark:translate-x-5"
      >
        {theme === 'light' ? 
          <Sun size={10} className="text-surface-600" /> : 
          <Moon size={10} className="text-white" />
        }
      </span>
    </button>
  )
}

export default ThemeToggle