/**
 * SpeedMeter Component
 * 
 * Displays current speed with visual indicators
 * Shows speed value, unit, and animated gauge
 */

export default function SpeedMeter({ 
  speed = 0,
  maxSpeed = 10,
  unit = "m/s",
  label = "Speed"
}) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100);

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">
            {speed.toFixed(2)}
            <span className="text-lg text-gray-400 ml-2">{unit}</span>
          </p>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/20">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {/* Speed Gauge */}
      <div className="relative">
        <svg className="w-full h-24" viewBox="0 0 200 100">
          {/* Background Arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-navy-lighter"
          />
          {/* Speed Arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="text-cyan-400 transition-all duration-500"
          />
          {/* Center Text */}
          <text x="100" y="75" textAnchor="middle" fill="currentColor" className="text-xs fill-gray-400">
            Max: {maxSpeed} {unit}
          </text>
        </svg>
      </div>

      {/* Speed Status */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>0 {unit}</span>
        <span className="text-white font-semibold">{percentage.toFixed(0)}%</span>
        <span>{maxSpeed} {unit}</span>
      </div>
    </div>
  );
}

