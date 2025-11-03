import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Overlay Fade (dark + blur) */}
            <motion.div
                className="absolute inset-0 bg-black/20 backdrop-blur-md z-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Page Content Animation */}
            <motion.div
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -40, filter: "blur(8px)" }}
                transition={{
                duration: 0.7,
                ease: "easeOut",
                }}
                className="relative z-10"
            >
            {children}
            </motion.div>
        </div>
    )
}
export default PageTransition