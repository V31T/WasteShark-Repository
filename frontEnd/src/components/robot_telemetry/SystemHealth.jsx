/**
 * SystemHealth Component
 * 
 * Displays overall system health with status indicators
 * Shows CPU, memory, and disk usage with health status
 */

export default function SystemHealth({ 
  cpuUsage = 0,
  memoryUsage = 0,
  diskUsage = 0,
  status = "NORMAL",
  label = "System Health"
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'NORMAL':
        return 'text-green-500';
      case 'WARNING':
        return 'text-yellow-500';
      case 'CRITICAL':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-500/20';
      case 'WARNING':
        return 'bg-yellow-500/20';
      case 'CRITICAL':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const MetricBar = ({ label, value, color }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-navy-lighter rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-xl font-bold ${getStatusColor()}`}>{status}</p>
        </div>
        <div className={`p-3 rounded-lg ${getStatusBg()}`}>
          <svg className={`w-6 h-6 ${getStatusColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* System Metrics */}
      <div className="space-y-3">
        <MetricBar 
          label="CPU Usage" 
          value={cpuUsage} 
          color={cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}
        />
        <MetricBar 
          label="Memory Usage" 
          value={memoryUsage} 
          color={memoryUsage > 80 ? 'bg-red-500' : memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}
        />
        <MetricBar 
          label="Disk Usage" 
          value={diskUsage} 
          color={diskUsage > 80 ? 'bg-red-500' : diskUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'}
        />
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <div className={`w-2 h-2 rounded-full ${status === 'NORMAL' ? 'bg-green-500 animate-pulse' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-400">
          {status === 'NORMAL' ? 'All systems operational' : status === 'WARNING' ? 'Some warnings detected' : 'Critical issues detected'}
        </span>
      </div>
    </div>
  );
}

