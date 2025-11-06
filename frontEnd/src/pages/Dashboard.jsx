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

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRobots, subscribeToRobotUpdates, subscribeToRobotTelemetry, startCleaning, stopCleaning, newRobot, deleteRobot, emergencyStopAll } from '../api/robots'
import { mockRobots } from '../api/mocks'
import RobotListSidebar from '../components/RobotListSidebar'
import toast from 'react-hot-toast'
import {
  BatteryStatus,
  AttitudeDisplay,
  SpeedAltitudeDisplay
} from '../components/robot_telemetry'

const Dashboard = () => {
  const { token, userId } = useAuth()
  
  // State Management: Robot data and status
  const [robots, setRobots] = useState([])
  const [selectedRobotId, setSelectedRobotId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [systemNormal, setSystemNormal] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Telemetry state - stores real-time telemetry data for selected robot
  // Initialize with mock data for display
  const [telemetry, setTelemetry] = useState({
    // Attitude - idle robot in water (nearly level, slight natural variations)
    roll: 0.3,
    pitch: -0.2,
    yaw: 0.0,
    // Speed & Altitude
    airspeed: 0,
    groundspeed: 0.0,
    altitude: 0,
    // Battery
    voltage: 12.6,
    current: 2.5,
    battery: 95
  })
  
  // Ref to store telemetry subscription for cleanup
  const telemetrySubscriptionRef = useRef(null)

  const selectedRobot = robots.find(r => r.id === selectedRobotId) || robots[0]

  /**
   * Status Mapping Helper
   * Maps backend status values to frontend display values
   * Backend: "roaming", "stopping", "off"
   * Frontend: "CLEANING", "IDLE", "OFF"
   */
  const mapStatus = (backendStatus) => {
    const statusMap = {
      'roaming': 'CLEANING',
      'stopping': 'IDLE',
      'off': 'OFF',
      'offline': 'OFFLINE'
    }
    return statusMap[backendStatus?.toLowerCase()] || 'IDLE'
  }

  /**
   * Fetch Robots on Mount
   * Loads robots from backend when component mounts or when auth changes
   * Falls back to mock robots if user has no robots (for testing purposes)
   */
  useEffect(() => {
    const fetchRobots = async () => {
      if (!token || !userId) {
        setRobots([])
        setInitialLoad(false)
        return
      }

      try {
        setLoading(true)
        const fetchedRobots = await getRobots(userId, token)
        
        // If user has no robots, use mock robots for testing
        if (fetchedRobots.length === 0) {
          setRobots(mockRobots)
          if (mockRobots.length > 0) {
            setSelectedRobotId(mockRobots[0].id)
          }
        } else {
          setRobots(fetchedRobots)
          if (fetchedRobots.length > 0 && !selectedRobotId) {
            setSelectedRobotId(fetchedRobots[0].id)
          }
        }
      } catch (error) {
        // On error, use mock robots for testing
        if (import.meta.env.DEV) {
          console.error('Error fetching robots:', error)
          console.log('Using mock robots for testing')
        }
        setRobots(mockRobots)
        if (mockRobots.length > 0) {
          setSelectedRobotId(mockRobots[0].id)
        }
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    fetchRobots()
  }, [token, userId])

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
        if (import.meta.env.DEV) {
          console.error('EventSource error:', error)
        }
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
   * Telemetry Subscription: Real-time telemetry data from selected robot
   * Subscribes to SSE stream for live telemetry updates
   */
  useEffect(() => {
    // Clean up previous subscription
    if (telemetrySubscriptionRef.current) {
      telemetrySubscriptionRef.current.close()
      telemetrySubscriptionRef.current = null
    }

    // Only subscribe if we have a selected robot and token
    if (!selectedRobotId || !token) {
      return
    }

    // Subscribe to telemetry stream
    const subscription = subscribeToRobotTelemetry(
      selectedRobotId,
      token,
      (telemetryData) => {
        // Update telemetry state with received data
        // Map backend telemetry fields to frontend state
        setTelemetry(prev => ({
          ...prev,
          // Attitude
          roll: telemetryData.roll ?? prev.roll,
          pitch: telemetryData.pitch ?? prev.pitch,
          yaw: telemetryData.yaw ?? prev.yaw,
          // Speed & Altitude
          airspeed: telemetryData.airspeed ?? telemetryData.airSpeed ?? prev.airspeed,
          groundspeed: telemetryData.groundspeed ?? telemetryData.groundSpeed ?? telemetryData.ground_speed ?? prev.groundspeed,
          altitude: telemetryData.altitude ?? telemetryData.alt ?? prev.altitude,
          // Battery
          voltage: telemetryData.voltage ?? telemetryData.batteryVoltage ?? prev.voltage,
          current: telemetryData.current ?? telemetryData.batteryCurrent ?? telemetryData.amps ?? prev.current,
          battery: telemetryData.battery ?? telemetryData.batteryPercent ?? telemetryData.batteryPercentage ?? prev.battery
        }))

        // Also update robot battery if provided
        if (telemetryData.battery !== undefined) {
          setRobots(prevRobots => 
            prevRobots.map(robot => 
              robot.id === selectedRobotId 
                ? { ...robot, battery: telemetryData.battery }
                : robot
            )
          )
        }
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[Telemetry] Connection error:', error)
        }
        // Don't show toast for every error to avoid spam
        // Connection will auto-reconnect
      }
    )

    telemetrySubscriptionRef.current = subscription

    // Cleanup on unmount or when robot changes
    return () => {
      if (subscription && subscription.close) {
        subscription.close()
      }
    }
  }, [selectedRobotId, token])

  /**
   * Start Cleaning Handler
   * Implements Command pattern - encapsulates cleaning action
   */
  const handleStartCleaning = async () => {
    if (!selectedRobot || !userId) return
    setLoading(true)
    try {
      await startCleaning(selectedRobot.id, userId, token)
      toast.success(`${selectedRobot.name} cleaning started!`)
      // Update local state optimistically (backend sets status to "roaming")
      setRobots(robots.map(r => 
        r.id === selectedRobot.id ? { ...r, status: 'CLEANING' } : r
      ))
    } catch (error) {
      toast.error(error.message || 'Failed to start cleaning')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Stop Cleaning Handler
   * Implements Command pattern - encapsulates stop action
   */
  const handleStopCleaning = async () => {
    if (!selectedRobot || !userId) return
    setLoading(true)
    try {
      await stopCleaning(selectedRobot.id, userId, token)
      toast.success(`${selectedRobot.name} cleaning stopped!`)
      // Update local state optimistically (backend sets status to "stopping")
      setRobots(robots.map(r => 
        r.id === selectedRobot.id ? { ...r, status: 'IDLE' } : r
      ))
    } catch (error) {
      toast.error(error.message || 'Failed to stop cleaning')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add Robot Handler
   * Adds an existing robot to the user's account by UUID
   * Uses the newRobot function which calls POST /api/robots/new
   */
  const handleAddRobot = async (robotId) => {
    if (!userId) return
    setLoading(true)
    try {
      await newRobot(robotId, userId, token)
      // Refresh robots list after adding
      const fetchedRobots = await getRobots(userId, token)
      setRobots(fetchedRobots)
      toast.success('Robot added successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to add robot')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete Robot Handler
   */
  const handleDeleteRobot = async (robotId) => {
    if (!userId) return
    if (!window.confirm('Are you sure you want to remove this robot from your account?')) {
      return
    }
    setLoading(true)
    try {
      await deleteRobot(robotId, userId, token)
      setRobots(robots.filter(r => r.id !== robotId))
      if (selectedRobotId === robotId) {
        const remainingRobots = robots.filter(r => r.id !== robotId)
        setSelectedRobotId(remainingRobots.length > 0 ? remainingRobots[0].id : null)
      }
      toast.success('Robot removed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to remove robot')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Emergency Stop Handler
   */
  const handleEmergencyStop = async () => {
    if (!userId || robots.length === 0) return
    if (!window.confirm('Are you sure you want to execute EMERGENCY STOP on all robots?')) {
      return
    }
    setLoading(true)
    try {
      const robotIds = robots.map(r => r.id)
      await emergencyStopAll(robotIds, userId, token)
      toast.success('Emergency stop executed - All robots stopped!')
      // Update all robots to IDLE
      setRobots(robots.map(r => ({ ...r, status: 'IDLE' })))
    } catch (error) {
      toast.error(error.message || 'Failed to execute emergency stop')
    } finally {
      setLoading(false)
    }
  }

  // Helper Function: Determines status color coding
  const getStatusColor = (status) => {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : 'IDLE'
    switch (normalizedStatus) {
      case 'CLEANING':
      case 'ROAMING':
        return 'bg-green-500'
      case 'IDLE':
      case 'STOPPING':
        return 'bg-gray-500'
      case 'OFF':
        return 'bg-gray-700' // Darker gray to distinguish from idle
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
          {initialLoad ? (
            <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading robots...</p>
            </div>
          ) : robots.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 text-center border border-white/10">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">No robots found</p>
              <p className="text-gray-500 text-sm">Add a robot using the sidebar to get started</p>
            </div>
          ) : selectedRobot ? (
            <>
              {/* Robot Info Card */}
              <div className="glass-effect rounded-xl p-8 mb-6 border border-white/10 hover:border-royal/30 transition-all">
                <h2 className="text-3xl font-bold text-gradient mb-6">{selectedRobot.name}</h2>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">STATUS:</p>
                    <div className={`inline-block px-4 py-2 rounded-lg text-white font-semibold uppercase shadow-lg ${getStatusColor(selectedRobot.status)}`}>
                      {mapStatus(selectedRobot.status)}
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
                    disabled={loading || mapStatus(selectedRobot.status) === 'CLEANING' || mapStatus(selectedRobot.status) === 'OFFLINE' || mapStatus(selectedRobot.status) === 'OFF'}
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
                    disabled={loading || mapStatus(selectedRobot.status) !== 'CLEANING'}
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
                
                <div className="bg-navy-lighter/50 rounded-lg p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">Battery:</p>
                    <p className="text-white font-bold text-xl">{telemetry.battery || selectedRobot.battery || 0}%</p>
                  </div>
                  <div className="w-full bg-navy-lighter rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (telemetry.battery || selectedRobot.battery || 0) > 50 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        (telemetry.battery || selectedRobot.battery || 0) > 20 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${telemetry.battery || selectedRobot.battery || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-500">{telemetry.voltage.toFixed(1)}V</span>
                    <span className="text-gray-500">{telemetry.current.toFixed(1)}A</span>
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
                  {/* Attitude Display */}
                  <AttitudeDisplay 
                    roll={telemetry.roll}
                    pitch={telemetry.pitch}
                    yaw={telemetry.yaw}
                    label="Attitude"
                  />

                  {/* Groundspeed Display */}
                  <SpeedAltitudeDisplay 
                    groundspeed={telemetry.groundspeed}
                    label="Groundspeed"
                  />

                  {/* Battery Status */}
                  <BatteryStatus 
                    voltage={telemetry.voltage}
                    current={telemetry.current}
                    battery={telemetry.battery || selectedRobot.battery || 0}
                    label="Battery"
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
