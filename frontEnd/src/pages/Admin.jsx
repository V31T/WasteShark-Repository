/**
 * Admin Page - Robot Management Interface
 * 
 * UML ANALYSIS:
 * This component implements CRUD (Create, Read, Update, Delete) operations.
 * Uses the Repository pattern for data management.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Repository Pattern: Centralized data access
 * 2. CRUD Pattern: Create, Read, Update, Delete operations
 * 3. Form Handler: Manages robot creation
 * 
 * FEATURES:
 * - Add new robots (POST /robots)
 * - Delete robots (DELETE /robots/:id)
 * - Display robot list (GET /robots)
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRobots, createRobot, deleteRobot } from '../api/robots'
import { mockRobots } from '../api/mocks'
import Button from '../components/Button'
import toast from 'react-hot-toast'

const Admin = () => {
  const { token } = useAuth()
  
  // State Management
  const [robots, setRobots] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRobot, setNewRobot] = useState({
    name: '',
    location: ''
  })

  /**
   * Initialize: Fetch robots on component mount
   * Implements Repository pattern for data access
   */
  useEffect(() => {
    const fetchRobots = async () => {
      setLoading(true)
      try {
        // TODO: Integrate with GET /robots endpoint
        const data = await getRobots()
        setRobots(data)
      } catch (error) {
        toast.error('Failed to fetch robots')
        setRobots(mockRobots) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }
    fetchRobots()
  }, [])

  /**
   * Create Robot Handler
   * Implements POST operation from CRUD
   */
  const handleAddRobot = async (e) => {
    e.preventDefault()
    // TODO: Integrate with POST /robots - JWT validation required
    setLoading(true)
    try {
      const data = await createRobot(newRobot, token)
      setRobots([...robots, data])
      toast.success('Robot added successfully!')
      setNewRobot({ name: '', location: '' })
      setShowAddForm(false)
    } catch (error) {
      toast.error('Failed to add robot')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete Robot Handler
   * Implements DELETE operation from CRUD
   */
  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm('Are you sure you want to delete this robot?')) {
      return
    }

    // TODO: Integrate with DELETE /robots/:robotId - JWT validation required
    setLoading(true)
    try {
      await deleteRobot(robotId, token)
      setRobots(robots.filter(r => r.id !== robotId))
      toast.success('Robot deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete robot')
    } finally {
      setLoading(false)
    }
  }

  // Helper Function: Status badge styling
  const getStatusBadge = (status) => {
    const colors = {
      Idle: 'bg-yellow-100 text-yellow-800',
      Cleaning: 'bg-green-100 text-green-800',
      Offline: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (loading && robots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Robot Management</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Robot'}
          </Button>
        </div>

        {/* Add Robot Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Robot</h2>
            <form onSubmit={handleAddRobot} className="space-y-4">
              <div>
                <label htmlFor="robotName" className="block text-sm font-medium text-gray-700 mb-2">
                  Robot Name
                </label>
                <input
                  id="robotName"
                  type="text"
                  value={newRobot.name}
                  onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal focus:border-transparent"
                  placeholder="e.g., WasteShark-003"
                />
              </div>
              <div>
                <label htmlFor="robotLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  id="robotLocation"
                  type="text"
                  value={newRobot.location}
                  onChange={(e) => setNewRobot({ ...newRobot, location: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-royal focus:border-transparent"
                  placeholder="e.g., Pool D"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Robot'}
              </Button>
            </form>
          </div>
        )}

        {/* Robots List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <div key={robot.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{robot.name}</h3>
                  <p className="text-gray-600">{robot.location}</p>
                </div>
                {getStatusBadge(robot.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Battery:</span>
                  <span className="font-semibold">{robot.battery}%</span>
                </div>
                {robot.status === 'Cleaning' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold">{robot.progress}%</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      robot.battery > 50 ? 'bg-green-500' : 
                      robot.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${robot.battery}%` }}
                  ></div>
                </div>
              </div>

              <Button
                variant="danger"
                onClick={() => handleDeleteRobot(robot.id)}
                disabled={loading}
                className="w-full"
              >
                Delete Robot
              </Button>
            </div>
          ))}
        </div>

        {robots.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 text-lg">No robots found. Add your first robot to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
