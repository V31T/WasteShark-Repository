import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Carousel = ({
  images = [],
  autoPlay = true,
  interval = 4000,
  transitionDuration = 0.8,
}) => {
  const [current, setCurrent] = useState(0)
  const length = images.length

  // Auto-slide
  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length)
    }, interval)
    return () => clearInterval(timer)
  }, [length, interval, autoPlay])

  // Handlers
  const nextSlide = () => setCurrent((prev) => (prev + 1) % length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + length) % length)

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl group">
      {/* Image Display */}
      <div className="relative h-80 sm:h-96 md:h-[30rem]">
        <AnimatePresence>
          {images.map(
            (src, index) =>
              index === current && (
                <motion.img
                  key={index}
                  src={src}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: transitionDuration, ease: "easeInOut" }}
                />
              )
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        &#10094;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-cyan-400 scale-110" : "bg-white/50"
            } transition-all duration-300`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel
