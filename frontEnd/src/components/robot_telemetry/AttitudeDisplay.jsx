/**
 * AttitudeDisplay Component
 * 
 * Displays robot attitude with Roll, Pitch, and Yaw angles
 * Shows orientation in 3D space
 */

export default function AttitudeDisplay({ 
  roll = 0,
  pitch = 0,
  yaw = 0,
  label = "Attitude"
}) {
  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/20">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
      </div>

      {/* Attitude Values */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Roll:</span>
          <span className="text-xl font-bold text-white">{roll.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Pitch:</span>
          <span className="text-xl font-bold text-white">{pitch.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Yaw:</span>
          <span className="text-xl font-bold text-white">{yaw.toFixed(1)}°</span>
        </div>
      </div>

      {/* Visual Indicator */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Orientation Active</span>
        </div>
      </div>
    </div>
  );
}

