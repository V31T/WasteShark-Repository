/**
 * PageTransition Component - Smooth page transition animations
 * 
 * OPTIMIZATION CHANGES:
 * 1. Removed expensive filter blur for better performance
 * 2. Reduced backdrop blur intensity for smoother rendering
 * 3. Enhanced animation timing with smoother easing curves
 * 4. Added exit animations for better page transitions
 * 5. Optimized z-index layering
 * 6. Improved overlay fade animation
 * 
 * NOTE: This component wraps page content to provide smooth
 * entrance/exit animations when navigating between pages.
 */

import { motion } from "framer-motion"

const PageTransition = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Overlay Fade - Enhanced with smoother animation */}
            <motion.div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ 
                    duration: 0.6, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.1
                }}
                onAnimationComplete={() => {
                    // Overlay fades out, content is now visible
                }}
            />

            {/* Page Content Animation - Optimized for performance */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.1
                }}
                className="relative z-10"
            >
                {children}
            </motion.div>
        </div>
    )
}

export default PageTransition