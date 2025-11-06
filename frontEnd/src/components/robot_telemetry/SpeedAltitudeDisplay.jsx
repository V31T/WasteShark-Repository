/**
 * SpeedAltitudeDisplay Component
 * 
 * Displays groundspeed
 * Shows movement data
 */

export default function SpeedAltitudeDisplay({ 
  groundspeed = 0,
  label = "Groundspeed"
}) {
  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{groundspeed.toFixed(1)} m/s</p>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/20">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Speed Active</span>
        </div>
      </div>
    </div>
  );
}

