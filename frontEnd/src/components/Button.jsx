/**
 * Button Component - Reusable UI Element
 * 
 * UML ANALYSIS:
 * This component implements the Strategy pattern with variant-based styling.
 * Acts as a reusable presentation component.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Strategy Pattern: Different button variants (primary, secondary, danger, success)
 * 2. Presentation Component: Pure UI element with minimal logic
 * 3. Polymorphism: Single component handles multiple button types
 * 
 * VARIANTS:
 * - primary: Main action (royal blue)
 * - secondary: Secondary action (gray)
 * - danger: Destructive action (red)
 * - success: Positive action (green)
 */

const Button = ({ children, onClick, variant = 'primary', disabled = false, type = 'button', className = '' }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Strategy Pattern: Different styling based on variant
  const variants = {
    primary: 'bg-royal text-white hover:bg-blue-600 focus:ring-royal',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  }
  
  const disabledStyles = 'opacity-50 cursor-not-allowed'
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
