import { useState, useEffect } from 'react'
import MainFeature from './components/MainFeature'
import Navbar from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import { Bell, HelpCircle } from 'lucide-react'

function App() {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 flex flex-col">
      <Navbar>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" fill="#6698FF" stroke="#4D7FFF" strokeWidth="1.5" />
              <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" fill="white" stroke="#4D7FFF" strokeWidth="1.5" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-surface-800"></span>
          </div>
          <h1 className="text-lg font-semibold text-surface-900 dark:text-white">Agent Workflow</h1>
          <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">Beta</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 border border-surface-200 dark:border-surface-700 rounded-md overflow-hidden">
            <button className="btn-tab active">Editor</button>
            <button className="btn-tab">Templates</button>
            <button className="btn-tab">Settings</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="icon-btn" aria-label="Help">
            <HelpCircle size={18} />
          </button>
          <button className="icon-btn relative" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">2</span>
          </button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <UserProfile />
          <button className="btn btn-primary text-sm">
            Deploy
          </button>
        </div>
      </Navbar>
      
      <main className="flex-1 flex flex-col">
        <MainFeature />
      </main>
    </div>
  )
}

export default App