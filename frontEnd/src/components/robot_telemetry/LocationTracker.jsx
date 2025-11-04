/**
 * LocationTracker Component
 * 
 * Displays current location with coordinates
 * Shows location name and GPS coordinates
 */

export default function LocationTracker({ 
  location = "Unknown",
  latitude = 0,
  longitude = 0,
  label = "Current Location"
}) {
  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white mb-2">{location}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-xs text-gray-500">LAT:</span>
              <span className="font-mono">{latitude.toFixed(6)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-xs text-gray-500">LON:</span>
              <span className="font-mono">{longitude.toFixed(6)}</span>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/20">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* GPS Status Indicator */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400">GPS Signal Active</span>
      </div>
    </div>
  );
}

