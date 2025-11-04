/**
 * Status Card Component - Display Key Metrics
 * 
 * UML ANALYSIS:
 * This component implements the Presentation pattern for displaying status information.
 * Uses the Decorator pattern for color variations.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Presentation Component: Displays data without business logic
 * 2. Strategy Pattern: Different color schemes based on status type
 * 3. Composition: Combines title, value, subtitle, and icon
 * 
 * USAGE:
 * Used in Dashboard to display system metrics (Active Robots, Total Cleaned, Efficiency)
 */

const StatusCard = ({ title, value, subtitle, icon, color = 'royal' }) => {
  // Strategy Pattern: Color variation based on status type
  const colorClasses = {
    royal: 'bg-royal',
    navy: 'bg-navy',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {icon && (
          <div className={`${colorClasses[color]} p-2 rounded-lg text-white`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default StatusCard
