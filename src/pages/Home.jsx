import { useState } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'

const Home = () => {
  const [showIntro, setShowIntro] = useState(true)
  
  return (
    <div className="container mx-auto px-4 py-8">
      {showIntro ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center py-12"
        >
          <h1 className="text-4xl font-bold mb-6">
            Build AI Agent Systems <span className="text-primary">Visually</span>
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 mb-8">
            AgentForge lets you design complex AI agent architectures through an intuitive 
            drag-and-drop interface. Connect components, configure properties, and generate 
            JSON configurations without writing code.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowIntro(false)}
            className="btn btn-primary text-lg px-8 py-3 shadow-lg"
          >
            Start Building
          </motion.button>
        </motion.div>
      ) : (
        <MainFeature />
      )}
    </div>
  )
}

export default Home