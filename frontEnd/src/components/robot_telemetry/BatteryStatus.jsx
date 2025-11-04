/**
 * BatteryStatus Component
 * 
 * Displays battery level with visual indicators and color coding
 * Shows percentage, visual bar, and status icon
 */

export default function BatteryStatus({ battery = 0, label = "Battery" }) {
  // Determine color based on battery level
  const getColor = () => {
    if (battery > 70) return 'from-green-500 to-green-600';
    if (battery > 40) return 'from-yellow-500 to-yellow-600';
    if (battery > 20) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getBgColor = () => {
    if (battery > 70) return 'bg-green-500/20';
    if (battery > 40) return 'bg-yellow-500/20';
    if (battery > 20) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{battery}%</p>
        </div>
        <div className={`p-3 rounded-lg ${getBgColor()}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      </div>
      
      {/* Battery Bar */}
      <div className="relative w-full h-3 bg-navy-lighter rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-500 relative`}
          style={{ width: `${Math.min(battery, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      {/* Status Text */}
      <p className="text-xs text-gray-400 mt-2">
        {battery > 70 ? 'Excellent' : battery > 40 ? 'Good' : battery > 20 ? 'Low' : 'Critical'}
      </p>
    </div>
  );
}

