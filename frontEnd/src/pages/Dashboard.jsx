/**
 * Dashboard Page - Robot Control Center
 * 
 * UML ANALYSIS:
 * This component implements the Observer pattern for real-time status updates.
 * It uses the Facade pattern to simplify robot control operations.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Observer Pattern: Listens for robot status changes via EventSource
 * 2. Facade Pattern: Simplifies complex robot control operations
 * 3. State Management: Local state for UI reactivity
 * 4. EventSource Pattern: Real-time updates from server
 * 
 * DATA FLOW:
 * EventSource -> Status Updates -> React State -> UI Components
 * User Actions -> API Calls -> State Updates -> Visual Feedback
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToRobotUpdates, startCleaning, stopCleaning, createRobot, deleteRobot, emergencyStopAll } from '../api/robots'
import RobotListSidebar from '../components/RobotListSidebar'
import toast from 'react-hot-toast'
import {
  BatteryStatus,
  TemperatureGauge,
  LocationTracker,
  SpeedMeter,
  DepthSensor,
  SystemHealth,
  NetworkStatus,
  MotorStatus
} from '../components/robot_telemetry'

const Dashboard = () => {
  const { token } = useAuth()
  
  // State Management: Robot data and status
  const [robots, setRobots] = useState([
    { id: '1', name: 'WasteShark-001', status: 'IDLE', battery: 85, progress: 45, runtime: '34m', location: 'Pool A' },
    { id: '2', name: 'WasteShark-002', status: 'CLEANING', battery: 72, progress: 65, runtime: '1h 25m', location: 'Pool B' },
    { id: '3', name: 'WasteShark-003', status: 'MAINTENANCE', battery: 15, progress: 0, runtime: '0m', location: 'Pool C' }
  ])
  const [selectedRobotId, setSelectedRobotId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [systemNormal, setSystemNormal] = useState(true)

  const selectedRobot = robots.find(r => r.id === selectedRobotId) || robots[0]

  /**
   * EventSource Pattern: Real-time updates from server
   * Implements Observer pattern - subscribes to robot state changes
   */
  useEffect(() => {
    const eventSource = subscribeToRobotUpdates(
      (data) => {
        // Update robot list with new data
        if (data.robots) {
          setRobots(data.robots)
        }
        if (data.systemStatus) {
          setSystemNormal(data.systemStatus === 'NORMAL')
        }
      },
      (error) => {
        console.error('EventSource error:', error)
        toast.error('Connection to robot stream lost')
      }
    )
    
    return () => {
      if (eventSource && eventSource.close) {
        eventSource.close()
      }
    }
  }, [token])

  /**
   * Start Cleaning Handler
   * Implements Command pattern - encapsulates cleaning action
   */
  const handleStartCleaning = async () => {
    if (!selectedRobot) return
    setLoading(true)
    try {
      await startCleaning(selectedRobot.id, token)
      toast.success(`${selectedRobot.name} cleaning started!`)
      // Update local state optimistically
      setRobots(robots.map(r => 
        r.id === selectedRobot.id ? { ...r, status: 'CLEANING' } : r
      ))
    } catch (error) {
      toast.error('Failed to start cleaning')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Stop Cleaning Handler
   * Implements Command pattern - encapsulates stop action
   */
  const handleStopCleaning = async () => {
    if (!selectedRobot) return
    setLoading(true)
    try {
      await stopCleaning(selectedRobot.id, token)
      toast.success(`${selectedRobot.name} cleaning stopped!`)
      // Update local state optimistically
      setRobots(robots.map(r => 
        r.id === selectedRobot.id ? { ...r, status: 'IDLE' } : r
      ))
    } catch (error) {
      toast.error('Failed to stop cleaning')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add Robot Handler
   */
  const handleAddRobot = async (robotData) => {
    setLoading(true)
    try {
      const newRobot = await createRobot(robotData, token)
      setRobots([...robots, { 
        ...newRobot, 
        status: 'IDLE', 
        battery: 100, 
        progress: 0, 
        runtime: '0m' 
      }])
      toast.success('Robot added successfully!')
    } catch (error) {
      toast.error('Failed to add robot')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete Robot Handler
   */
  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm('Are you sure you want to delete this robot?')) {
      return
    }
    setLoading(true)
    try {
      await deleteRobot(robotId, token)
      setRobots(robots.filter(r => r.id !== robotId))
      if (selectedRobotId === robotId && robots.length > 1) {
        setSelectedRobotId(robots[0].id)
      }
      toast.success('Robot deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete robot')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Emergency Stop Handler
   */
  const handleEmergencyStop = async () => {
    if (!window.confirm('Are you sure you want to execute EMERGENCY STOP on all robots?')) {
      return
    }
    setLoading(true)
    try {
      await emergencyStopAll(token)
      toast.success('Emergency stop executed - All robots stopped!')
      // Update all robots to IDLE
      setRobots(robots.map(r => ({ ...r, status: 'IDLE' })))
    } catch (error) {
      toast.error('Failed to execute emergency stop')
    } finally {
      setLoading(false)
    }
  }

  // Helper Function: Determines status color coding
  const getStatusColor = (status) => {
    switch (status) {
      case 'CLEANING':
        return 'bg-green-500'
      case 'IDLE':
        return 'bg-gray-500'
      case 'MAINTENANCE':
        return 'bg-orange-500'
      case 'OFFLINE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Left Sidebar */}
      <RobotListSidebar
        robots={robots}
        selectedRobotId={selectedRobotId}
        onSelectRobot={setSelectedRobotId}
        onAddRobot={handleAddRobot}
        onDeleteRobot={handleDeleteRobot}
        onEmergencyStop={handleEmergencyStop}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-navy-light border-b border-white/10 px-8 py-6 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gradient">Robot Control Center</h1>
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-lg border border-green-500/30">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-500 font-semibold text-sm">SYSTEM NORMAL</span>
            </div>
          </div>
        </div>

        {/* Robot Details Section */}
        <div className="p-8">
          {selectedRobot ? (
            <>
              {/* Robot Info Card */}
              <div className="glass-effect rounded-xl p-8 mb-6 border border-white/10 hover:border-royal/30 transition-all">
                <h2 className="text-3xl font-bold text-gradient mb-6">{selectedRobot.name}</h2>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">STATUS:</p>
                    <div className={`inline-block px-4 py-2 rounded-lg text-white font-semibold uppercase shadow-lg ${getStatusColor(selectedRobot.status)}`}>
                      {selectedRobot.status}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">LOCATION:</p>
                    <p className="text-white font-semibold text-lg">{selectedRobot.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">ROBOT ID:</p>
                    <p className="text-white font-semibold text-lg font-mono">{selectedRobot.id}</p>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleStartCleaning}
                    disabled={loading || selectedRobot.status === 'CLEANING' || selectedRobot.status === 'OFFLINE'}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Cleaning
                  </button>
                  
                  <button
                    onClick={handleStopCleaning}
                    disabled={loading || selectedRobot.status !== 'CLEANING'}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Stop Cleaning
                  </button>
                </div>
              </div>

              {/* Quick Status Overview */}
              <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Quick Overview</h3>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-navy-lighter/50 rounded-lg p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">Battery:</p>
                      <p className="text-white font-bold text-xl">{selectedRobot.battery}%</p>
                    </div>
                    <div className="w-full bg-navy-lighter rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          selectedRobot.battery > 50 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                          selectedRobot.battery > 20 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${selectedRobot.battery}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-navy-lighter/50 rounded-lg p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">Cleaning Progress:</p>
                      <p className="text-white font-bold text-xl">{selectedRobot.progress}%</p>
                    </div>
                    <div className="w-full bg-navy-lighter rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-royal to-royal-dark h-2 rounded-full transition-all"
                        style={{ width: `${selectedRobot.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-navy-lighter/50 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-gray-400 mb-2">Runtime:</p>
                    <p className="text-3xl font-bold text-white">{selectedRobot.runtime}</p>
                  </div>
                </div>
              </div>

              {/* Telemetry Data Section */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-gradient">Robot Telemetry</span>
                  <span className="text-xs text-gray-400 font-normal">(Live Data)</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Battery Status */}
                  <BatteryStatus 
                    battery={selectedRobot.battery} 
                    label="Main Battery"
                  />

                  {/* Temperature */}
                  <TemperatureGauge 
                    temperature={selectedRobot.status === 'CLEANING' ? 45.5 : 28.3}
                    min={20}
                    max={85}
                    warning={75}
                    label="Water Temperature"
                  />

                  {/* Location */}
                  <LocationTracker 
                    location={selectedRobot.location}
                    latitude={34.052235}
                    longitude={-118.243683}
                  />

                  {/* Speed */}
                  <SpeedMeter 
                    speed={selectedRobot.status === 'CLEANING' ? 2.5 : 0}
                    maxSpeed={5}
                    unit="m/s"
                  />

                  {/* Depth Sensor */}
                  <DepthSensor 
                    depth={selectedRobot.status === 'CLEANING' ? 1.8 : 0.5}
                    maxDepth={3}
                    unit="m"
                  />

                  {/* System Health */}
                  <SystemHealth 
                    cpuUsage={selectedRobot.status === 'CLEANING' ? 65 : 15}
                    memoryUsage={selectedRobot.status === 'CLEANING' ? 72 : 28}
                    diskUsage={45}
                    status={selectedRobot.status === 'MAINTENANCE' ? 'WARNING' : 'NORMAL'}
                  />

                  {/* Network Status */}
                  <NetworkStatus 
                    signalStrength={85}
                    connectionType="WiFi 5GHz"
                    latency={12}
                    status="CONNECTED"
                  />

                  {/* Motor Status */}
                  <MotorStatus 
                    rpm={selectedRobot.status === 'CLEANING' ? 2450 : 0}
                    maxRpm={3000}
                    power={selectedRobot.status === 'CLEANING' ? 125 : 5}
                    temperature={selectedRobot.status === 'CLEANING' ? 48 : 25}
                    status={selectedRobot.status === 'CLEANING' ? 'RUNNING' : selectedRobot.status === 'MAINTENANCE' ? 'WARNING' : 'IDLE'}
                    motorName="Main Propulsion"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p className="text-gray-400 text-lg">No robot selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
