import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home as HomeIcon } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-surface-200 dark:text-surface-800">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-surface-800 dark:text-surface-200">Page Not Found</div>
          </div>
        </div>
        
        <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <HomeIcon size={18} />
            Return Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound