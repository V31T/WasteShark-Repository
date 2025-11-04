/**
 * Carousel Component - Modern Layered Carousel Design
 * 
 * DESIGN INSPIRATION:
 * - Active card is large, white, centered, and prominent
 * - Inactive cards are smaller, semi-transparent, fanned out on sides
 * - Cards are layered with perspective effect showing depth
 * - Navigation arrows are white circular buttons with colored icons
 * - Pagination dots at bottom (active: solid, inactive: hollow)
 * 
 * OPTIMIZATION CHANGES:
 * 1. Multiple cards visible at once with layered effect
 * 2. Smooth perspective transitions between cards
 * 3. Enhanced navigation with better visual feedback
 * 4. Improved responsive design
 * 5. Better keyboard navigation support
 * 6. Optimized image loading with lazy loading
 * 7. Added ARIA labels for accessibility
 */

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"

const Carousel = ({
  images = [],
  autoPlay = true,
  interval = 4000,
  transitionDuration = 0.5,
}) => {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const length = images.length

  // Auto-slide with pause on hover
  useEffect(() => {
    if (!autoPlay || isHovered || length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length)
    }, interval)
    return () => clearInterval(timer)
  }, [length, interval, autoPlay, isHovered])

  // Memoized handlers
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % length)
  }, [length])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + length) % length)
  }, [length])

  const goToSlide = useCallback((index) => {
    setCurrent(index)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") prevSlide()
      if (e.key === "ArrowRight") nextSlide()
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [nextSlide, prevSlide])

  // Helper function to get visible cards with proper positioning
  const getCardIndex = (offset) => {
    const index = (current + offset + length) % length
    return index
  }

  if (length === 0) return null

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container - Centered with proper positioning */}
      <div className="relative h-[28rem] md:h-[32rem] lg:h-[36rem] w-full flex items-center justify-center">
        {/* Render visible cards with layering effect - Shows 5 cards total */}
        {[-2, -1, 0, 1, 2].map((offset) => {
          const cardIndex = getCardIndex(offset)
          const isActive = offset === 0
          const distance = Math.abs(offset)
          
          // Calculate positioning and scale to match design
          // Active card (offset 0) should be at x: 0 (centered)
          // Other cards offset by 140px per step
          const xOffset = offset * 140 // Horizontal offset for fanning effect
          const scale = isActive ? 1 : 0.7 - (distance * 0.08)
          const opacity = isActive ? 1 : 0.3 - (distance * 0.05)
          const zIndex = isActive ? 20 : 10 - distance

          return (
            <motion.div
              key={`${cardIndex}-${current}`}
              className="absolute"
              initial={false}
              animate={{
                x: `calc(-50% + ${xOffset}px)`,
                y: '-50%',
                scale: scale,
                opacity: Math.max(0.1, opacity),
              }}
              transition={{
                duration: transitionDuration,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onClick={!isActive ? () => goToSlide(cardIndex) : undefined}
              style={{ 
                zIndex: zIndex,
                cursor: !isActive ? 'pointer' : 'default',
                left: '50%',
                top: '50%',
              }}
            >
              <div
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive 
                    ? 'bg-white w-[22rem] md:w-[26rem] lg:w-[30rem] h-[18rem] md:h-[22rem] lg:h-[26rem] shadow-2xl' 
                    : 'bg-white/30 backdrop-blur-md w-[16rem] md:w-[18rem] lg:w-[20rem] h-[14rem] md:h-[16rem] lg:h-[18rem] shadow-lg hover:bg-white/40'
                }`}
              >
                <img
                  src={images[cardIndex]}
                  alt={`Slide ${cardIndex + 1} of ${length}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation Arrows - White circular buttons with colored icons (matching design) */}
      {length > 1 && (
        <>
          <motion.button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white text-cyan-500 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-30"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </motion.button>
          
          <motion.button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white text-cyan-500 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-30"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </motion.button>
        </>
      )}

      {/* Pagination Dots - Active: solid white circle, Inactive: hollow white circles */}
      {length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-30">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 ${
                index === current 
                  ? "w-3 h-3 bg-white rounded-full shadow-lg" 
                  : "w-3 h-3 border-2 border-white rounded-full bg-transparent hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
