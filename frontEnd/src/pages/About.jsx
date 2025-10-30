import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const About = () => {
  return (
    <div className="min-h-screen bg-navy">
      {/* Hero Section: Main value proposition */}
      <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white py-24 relative overflow-hidden">
        {/* Background decorative elements - Multi-colored */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About Us
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Learn more about the team behind WasteShark and our mission to revolutionize waste management with cutting-edge technology.
            </motion.p>
          </div>

        </div>
      </section>
    </div>
  )
}

export default About