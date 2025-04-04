import React from 'react'

const Tooltip = ({ children, content, position = 'top' }) => {
  let positionClasses = ''
  
  switch (position) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      break
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2'
      break
    case 'left':
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2'
      break
    case 'right':
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2'
      break
    default:
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2'
  }
  
  return (
    <div className="tooltip-trigger relative">
      {children}
      <div className={`tooltip ${positionClasses}`}>
        {content}
        <div className={`absolute w-0 h-0 border-4 border-transparent ${
          position === 'top' ? 'border-t-surface-900 dark:border-t-surface-800 bottom-[-8px] left-1/2 -translate-x-1/2' : 
          position === 'bottom' ? 'border-b-surface-900 dark:border-b-surface-800 top-[-8px] left-1/2 -translate-x-1/2' : 
          position === 'left' ? 'border-l-surface-900 dark:border-l-surface-800 right-[-8px] top-1/2 -translate-y-1/2' : 
          'border-r-surface-900 dark:border-r-surface-800 left-[-8px] top-1/2 -translate-y-1/2'
        }`}></div>
      </div>
    </div>
  )
}

export default Tooltip