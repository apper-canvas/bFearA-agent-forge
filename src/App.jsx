import MainFeature from './components/MainFeature'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-900">
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" fill="#6698FF" stroke="#4D7FFF" strokeWidth="1.5" />
              <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" fill="white" stroke="#4D7FFF" strokeWidth="1.5" />
            </svg>
            <h1 className="text-lg font-semibold text-surface-900 dark:text-white">Agent Workflow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="btn btn-outline text-sm">
              Load
            </button>
            <button className="btn btn-primary text-sm">
              Deploy
            </button>
          </div>
        </div>
      </header>
      
      <main>
        <MainFeature />
      </main>
    </div>
  )
}

export default App