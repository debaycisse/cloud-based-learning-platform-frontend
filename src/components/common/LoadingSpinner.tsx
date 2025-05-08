import { motion } from "framer-motion"

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px]">
      <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <div className="absolute top-0 left-0 h-12 w-12 flex items-center justify-center">
          <i className="fa-solid fa-graduation-cap text-primary-600 text-sm"></i>
        </div>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner
