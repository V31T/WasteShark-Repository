/**
 * MotorStatus Component
 * 
 * Displays motor performance metrics
 * Shows RPM, power consumption, and temperature
 */

export default function MotorStatus({ 
  rpm = 0,
  maxRpm = 3000,
  power = 0,
  temperature = 0,
  status = "RUNNING",
  label = "Motor Status",
  motorName = "Main Motor"
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return 'text-green-500';
      case 'IDLE':
        return 'text-gray-400';
      case 'WARNING':
        return 'text-yellow-500';
      case 'ERROR':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-500/20';
      case 'IDLE':
        return 'bg-gray-500/20';
      case 'WARNING':
        return 'bg-yellow-500/20';
      case 'ERROR':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const rpmPercentage = Math.min((rpm / maxRpm) * 100, 100);

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-xl font-bold text-white mb-1">{motorName}</p>
          <p className={`text-sm font-semibold ${getStatusColor()}`}>{status}</p>
        </div>
        <div className={`p-3 rounded-lg ${getStatusBg()}`}>
          <svg className={`w-6 h-6 ${getStatusColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Motor Metrics */}
      <div className="space-y-3">
        {/* RPM */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">RPM</span>
            <span className="text-sm text-white font-semibold">{rpm.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-navy-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 relative"
              style={{ width: `${rpmPercentage}%` }}
            >
              {status === 'RUNNING' && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-navy-lighter/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Power</p>
            <p className="text-lg font-bold text-white">{power.toFixed(1)}W</p>
          </div>
          <div className="bg-navy-lighter/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Temp</p>
            <p className={`text-lg font-bold ${temperature > 80 ? 'text-red-500' : temperature > 60 ? 'text-yellow-500' : 'text-white'}`}>
              {temperature.toFixed(0)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Activity Indicator */}
      {status === 'RUNNING' && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Motor Active</span>
        </div>
      )}
    </div>
  );
}

