/**
 * DepthSensor Component
 * 
 * Displays current depth/water level with visual indicator
 * Shows depth value with animated water level
 */

export default function DepthSensor({ 
  depth = 0,
  maxDepth = 10,
  unit = "m",
  label = "Depth"
}) {
  const percentage = Math.min((depth / maxDepth) * 100, 100);

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex gap-4">
        {/* Depth Visualization */}
        <div className="relative w-20 h-32 bg-navy-lighter rounded-lg overflow-hidden border border-white/10">
          {/* Water Level */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
            style={{ height: `${percentage}%` }}
          >
            {/* Wave Animation */}
            <div className="absolute inset-0 bg-white/20">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 animate-pulse"></div>
            </div>
          </div>
          
          {/* Depth Markers */}
          {[25, 50, 75].map((mark) => (
            <div 
              key={mark}
              className="absolute left-0 right-0 border-t border-white/20"
              style={{ top: `${100 - mark}%` }}
            ></div>
          ))}
        </div>

        {/* Depth Info */}
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white mb-2">
            {depth.toFixed(2)}
            <span className="text-lg text-gray-400 ml-1">{unit}</span>
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current:</span>
              <span className="text-white font-semibold">{depth.toFixed(2)} {unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Depth:</span>
              <span className="text-gray-300">{maxDepth} {unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Level:</span>
              <span className="text-blue-400 font-semibold">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

