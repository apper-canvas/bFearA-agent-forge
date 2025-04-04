import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronsUpDown } from 'lucide-react'

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-surface-200 dark:border-surface-700 py-1 pl-1 pr-2 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
      >
        <div className="user-avatar">
          <img 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-medium whitespace-nowrap max-w-[80px] truncate">Sarah Chen</span>
        <ChevronsUpDown size={14} className="text-surface-400" />
      </button>
      
      <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
          <p className="text-sm font-medium">Sarah Chen</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">sarah.chen@example.com</p>
          <span className="text-xs px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded mt-1 inline-block">Pro Account</span>
        </div>
        
        <div className="py-1">
          <button className="dropdown-item">
            <User size={16} />
            <span>Profile</span>
          </button>
          <button className="dropdown-item">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
        
        <div className="dropdown-divider"></div>
        
        <div className="py-1">
          <button className="dropdown-item text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile