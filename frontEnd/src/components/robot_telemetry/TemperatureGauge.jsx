/**
 * TemperatureGauge Component
 * 
 * Displays temperature readings with visual indicators
 * Shows current, min, and max temperatures with color coding
 */

export default function TemperatureGauge({ 
  temperature = 0, 
  unit = "°C",
  label = "Temperature",
  min = 0,
  max = 100,
  warning = 80
}) {
  const isWarning = temperature >= warning;
  const isCritical = temperature >= max * 0.95;

  const getColor = () => {
    if (isCritical) return 'text-red-500';
    if (isWarning) return 'text-orange-500';
    return 'text-blue-400';
  };

  const getBgColor = () => {
    if (isCritical) return 'bg-red-500/20';
    if (isWarning) return 'bg-orange-500/20';
    return 'bg-blue-500/20';
  };

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold ${getColor()}`}>
            {temperature.toFixed(1)}{unit}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${getBgColor()}`}>
          <svg className={`w-6 h-6 ${getColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Temperature Range Indicator */}
      <div className="relative w-full h-2 bg-navy-lighter rounded-full overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 opacity-50"></div>
        <div 
          className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300"
          style={{ left: `${Math.min((temperature / max) * 100, 100)}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span className="text-orange-400">⚠ {warning}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

