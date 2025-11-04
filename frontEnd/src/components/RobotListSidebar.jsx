/**
 * Robot List Sidebar Component
 * 
 * Displays a list of all robots in a sidebar with management controls
 * and emergency stop functionality
 */

import { useState, useRef, useEffect } from 'react'

const RobotListSidebar = ({ robots, selectedRobotId, onSelectRobot, onAddRobot, onDeleteRobot, onEmergencyStop }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRobot, setNewRobot] = useState({ name: '', location: '' })
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, robotId: null })
  const contextMenuRef = useRef(null)

  // Helper Function: Status badge styling
  const getStatusBadge = (status) => {
    const colors = {
      IDLE: 'bg-gray-500',
      CLEANING: 'bg-green-500',
      MAINTENANCE: 'bg-orange-500',
      OFFLINE: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    onAddRobot(newRobot)
    setNewRobot({ name: '', location: '' })
    setShowAddForm(false)
  }

  // Context menu handlers
  const handleContextMenu = (e, robotId) => {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, robotId })
  }

  const handleDeleteFromMenu = (robotId) => {
    onDeleteRobot(robotId)
    setContextMenu({ visible: false, x: 0, y: 0, robotId: null })
  }

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, robotId: null })
      }
    }

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.visible])

  return (
    <div className="w-64 bg-navy-light min-h-screen flex flex-col border-r border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-royal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <div>
            <h1 className="text-lg font-bold text-gradient">WasteShark</h1>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Robot Management Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Robot Management
          </h2>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-glow mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Robot
          </button>

          {/* Add Robot Form */}
          {showAddForm && (
            <div className="glass-effect rounded-lg p-3 mb-4 border border-white/10">
              <form onSubmit={handleSubmitAdd} className="space-y-2">
                <input
                  type="text"
                  value={newRobot.name}
                  onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                  placeholder="Robot Name"
                  required
                  className="w-full px-3 py-2 bg-navy text-white text-sm rounded-lg border border-white/10 focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal transition-all"
                />
                <input
                  type="text"
                  value={newRobot.location}
                  onChange={(e) => setNewRobot({ ...newRobot, location: e.target.value })}
                  placeholder="Location"
                  required
                  className="w-full px-3 py-2 bg-navy text-white text-sm rounded-lg border border-white/10 focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-royal to-royal-dark hover:from-royal-dark hover:to-royal text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 glass-effect text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Robot List */}
          <div className="space-y-2">
            {robots.map((robot) => (
              <div
                key={robot.id}
                onClick={() => onSelectRobot(robot.id)}
                onContextMenu={(e) => handleContextMenu(e, robot.id)}
                className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedRobotId === robot.id
                    ? 'bg-royal/20 border-royal shadow-glow'
                    : 'glass-effect border-white/10 hover:border-royal/30 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-white">{robot.name}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-2">{robot.location}</p>
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold text-white uppercase shadow-md ${getStatusBadge(robot.status)}`}>
                  {robot.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Controls Section */}
      <div className="p-4 border-t border-white/10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Emergency Controls
        </h2>
        <button
          onClick={onEmergencyStop}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-glow transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Emergency Kill Switch
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-navy-light border border-white/20 rounded-lg shadow-xl z-50 min-w-[150px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={() => handleDeleteFromMenu(contextMenu.robotId)}
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-red-500/20 hover:text-red-500 transition-colors rounded-t-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Robot
          </button>
        </div>
      )}
    </div>
  )
}

export default RobotListSidebar

