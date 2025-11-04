/**
 * NetworkStatus Component
 * 
 * Displays network connectivity status
 * Shows signal strength, connection type, and latency
 */

export default function NetworkStatus({ 
  signalStrength = 0,
  connectionType = "WiFi",
  latency = 0,
  status = "CONNECTED",
  label = "Network Status"
}) {
  const getSignalColor = () => {
    if (signalStrength > 80) return 'text-green-500';
    if (signalStrength > 50) return 'text-yellow-500';
    if (signalStrength > 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSignalBg = () => {
    if (signalStrength > 80) return 'bg-green-500/20';
    if (signalStrength > 50) return 'bg-yellow-500/20';
    if (signalStrength > 20) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const SignalBar = ({ active }) => (
    <div className={`w-1.5 rounded-full transition-all duration-300 ${active ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-navy-lighter'}`}></div>
  );

  const bars = Math.ceil((signalStrength / 100) * 5);

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-xl font-bold text-white mb-3">{connectionType}</p>
          
          {/* Signal Strength Bars */}
          <div className="flex items-end gap-1 mb-3 h-8">
            <SignalBar active={bars >= 1} style={{ height: '20%' }} />
            <SignalBar active={bars >= 2} style={{ height: '40%' }} />
            <SignalBar active={bars >= 3} style={{ height: '60%' }} />
            <SignalBar active={bars >= 4} style={{ height: '80%' }} />
            <SignalBar active={bars >= 5} style={{ height: '100%' }} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Signal:</span>
              <span className={`font-semibold ${getSignalColor()}`}>{signalStrength}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Latency:</span>
              <span className="text-white">{latency}ms</span>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${getSignalBg()}`}>
          <svg className={`w-6 h-6 ${getSignalColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-400">{status}</span>
      </div>
    </div>
  );
}

