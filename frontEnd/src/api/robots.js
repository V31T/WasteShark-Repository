/**
 * Robot Management API - Backend Integration Layer
 * 
 * INTEGRATION STATUS:
 * - Fetch Robots: ✅ Integrated with POST /api/robots/fetch
 * - Add Robot: ✅ Integrated with POST /api/robots/new
 * - Start Robot: ✅ Integrated with POST /api/robots/start
 * - Stop Robot: ✅ Integrated with POST /api/robots/stop
 * - Delete Robot: ✅ Integrated with POST /api/robots/delete
 * - Rename Robot: ✅ Integrated with POST /api/robots/rename
 * 
 * UML ANALYSIS:
 * This module implements the Repository pattern for robot data management.
 * Acts as a Facade for robot-related operations.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Repository Pattern: Centralized robot data access
 * 2. Facade Pattern: Simplifies robot operations
 * 3. CRUD Operations: Create, Read, Update, Delete
 * 
 * BACKEND ENDPOINTS:
 * - POST /api/robots/fetch - Get all robots owned by user (requires JWT)
 * - POST /api/robots/new - Assign existing robot to user (requires JWT)
 * - POST /api/robots/start - Start robot cleaning (requires JWT + ownership)
 * - POST /api/robots/stop - Stop robot cleaning (requires JWT + ownership)
 * - POST /api/robots/delete - Remove robot from user account (requires JWT + ownership)
 * - POST /api/robots/rename - Rename robot (requires JWT + ownership)
 * 
 * NOTE: All endpoints require JWT access token in Authorization header.
 * Robot ownership is verified by the backend middleware.
 * Backend uses status values: "roaming", "stopping", "off"
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Helper function to check and log token expiration errors
 * @param {Response} response - Fetch response object
 * @param {Object} errorData - Parsed error data from response
 * @param {string} apiName - Name of the API endpoint for logging
 */
function handleTokenExpiration(response, errorData, apiName) {
  if (response.status === 401) {
    const errorMessage = errorData.error || errorData.message || 'Unauthorized'
    
    if (errorMessage.includes('TokenExpired') || errorMessage.includes('expired')) {
      console.error(`[${apiName}] Access token expired:`, errorMessage)
      console.log(`[${apiName}] Access token has expired. Refresh token may be used to get a new token.`)
    } else if (errorMessage.includes('InvalidToken') || errorMessage.includes('Invalid')) {
      console.error(`[${apiName}] Invalid access token:`, errorMessage)
      console.log(`[${apiName}] Access token is invalid. User may need to log in again.`)
    } else if (errorMessage.includes('No token provided')) {
      console.error(`[${apiName}] No access token provided`)
      console.log(`[${apiName}] Missing authentication token.`)
    } else {
      console.error(`[${apiName}] Authentication failed (401):`, errorMessage)
    }
  }
}

/**
 * Get All Robots - POST /api/robots/fetch
 * Retrieves list of all robots owned by the authenticated user
 * 
 * Backend Request:
 * {
 *   "userId": "user-uuid-here"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true,
 *   "robots": [
 *     {
 *       "robot_id": "robot-uuid",
 *       "name": "WasteShark-001",
 *       "location": "Pool A"
 *     }
 *   ]
 * }
 * 
 * NOTE: Backend returns robot_id (not id) and does not include status/battery.
 * These are mapped/defaulted in the response transformation.
 * 
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<Array>} Array of robot objects with id, robot_id, name, location, status, battery
 */
export const getRobots = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ userId })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [getRobots]')
      throw new Error(errorData.error || errorData.message || 'Failed to fetch robots')
    }
    
    const data = await response.json()
    // Transform backend response to match frontend expectations
    // Map robot_id to id for consistency, add default status/battery
    return data.robots.map(robot => ({
      id: robot.robot_id,
      robot_id: robot.robot_id,
      name: robot.name,
      location: robot.location || 'Unknown',
      status: 'off', // Default status, will be updated via other means
      battery: 0 // Default battery, not provided by backend
    }))
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch robots')
  }
}

/**
 * Get Robot Status - GET /robots/:robotId/status
 * Retrieves current status of a specific robot
 */
export const getRobotStatus = async (robotId, token) => {
  try {
    // TODO: integrate with GET /robots/:robotId/status
    // const response = await fetch(`${API_BASE_URL}/robots/${robotId}/status`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // if (!response.ok) throw new Error('Failed to fetch robot status')
    // return await response.json()
    
    // Mock implementation
    return { 
      status: 'Idle', 
      battery: 85, 
      progress: 45,
      runtime: '02:15:30'
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch robot status')
  }
}

/**
 * Subscribe to Real-Time Robot Telemetry - SSE Stream
 * Establishes SSE connection for live robot telemetry data
 * 
 * Backend Endpoint: GET /api/robots/streamtelemetry?robotId={robotId}
 * 
 * Backend sends telemetry data via SSE in format:
 * data: {"robotId": "...", "battery": 85, "temperature": 25.5, "speed": 2.5, ...}
 * 
 * NOTE: Uses fetch with streaming instead of EventSource to support Authorization header
 * 
 * @param {string} robotId - Robot UUID to subscribe to
 * @param {string} token - JWT access token
 * @param {Function} onUpdate - Callback function called with telemetry data
 * @param {Function} onError - Optional callback for errors
 * @returns {Object} Object with close() method to disconnect
 */
export const subscribeToRobotTelemetry = (robotId, token, onUpdate, onError) => {
  if (!robotId || !token) {
    console.error('[Telemetry] Robot ID and token are required')
    if (onError) onError(new Error('Robot ID and token are required'))
    return { close: () => {} }
  }

  let isClosed = false
  let reader = null
  let controller = null

  const connect = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/robots/streamtelemetry?robotId=${encodeURIComponent(robotId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        handleTokenExpiration(response, errorData, 'Telemetry SSE [subscribeToRobotTelemetry]')
        throw new Error(errorData.error || errorData.message || `Failed to connect: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is not available')
      }

      reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const readStream = async () => {
        try {
          while (!isClosed) {
            const { done, value } = await reader.read()

            if (done) {
              if (!isClosed) {
                console.log('[Telemetry] Stream ended, attempting to reconnect...')
                // Stream ended, try to reconnect after a delay
                setTimeout(() => {
                  if (!isClosed) {
                    connect()
                  }
                }, 3000)
              }
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)) // Remove 'data: ' prefix
                  onUpdate(data)
                } catch (parseError) {
                  console.error('[Telemetry] Failed to parse SSE data:', parseError, line)
                }
              }
            }
          }
        } catch (streamError) {
          if (!isClosed) {
            console.error('[Telemetry] Stream read error:', streamError)
            if (onError) onError(streamError)
            // Try to reconnect after error
            setTimeout(() => {
              if (!isClosed) {
                connect()
              }
            }, 3000)
          }
        }
      }

      readStream()
    } catch (error) {
      console.error('[Telemetry] Connection error:', error)
      if (onError) onError(error)
      // Try to reconnect after error
      if (!isClosed) {
        setTimeout(() => {
          if (!isClosed) {
            connect()
          }
        }, 3000)
      }
    }
  }

  connect()

  return {
    close: () => {
      isClosed = true
      if (reader) {
        reader.cancel().catch(() => {})
      }
      if (controller) {
        controller.abort()
      }
    }
  }
}

/**
 * Subscribe to Real-Time Robot Updates - EventSource
 * Establishes SSE connection for live robot status updates
 */
export const subscribeToRobotUpdates = (onUpdate, onError) => {
  // TODO: integrate with GET /robots/stream
  // const eventSource = new EventSource(`${API_BASE_URL}/robots/stream`)
  
  // eventSource.onmessage = (event) => {
  //   try {
  //     const data = JSON.parse(event.data)
  //     onUpdate(data)
  //   } catch (error) {
  //     console.error('Failed to parse SSE data:', error)
  //   }
  // }
  
  // eventSource.onerror = (error) => {
  //   console.error('SSE connection error:', error)
  //   if (onError) onError(error)
  // }
  
  // return eventSource
  
  // Mock implementation - simulate real-time updates
  // NOTE: This is currently disabled to prevent overriding real robot data
  // The mock EventSource is returned but doesn't send updates
  // When real SSE is implemented, this will be replaced
  
  const mockEventSource = {
    close: () => {
      // No-op since we're not using intervals
    }
  }
  
  // Disabled: Mock updates were overriding real robot data
  // Uncomment when real SSE endpoint is available:
  /*
  const mockInterval = setInterval(() => {
    const mockData = {
      robots: [
        { id: '1', name: 'WasteShark-001', status: 'IDLE', battery: 85, progress: 45, runtime: '34m', location: 'Pool A' },
        { id: '2', name: 'WasteShark-002', status: 'CLEANING', battery: 72, progress: 65, runtime: '1h 25m', location: 'Pool B' },
        { id: '3', name: 'WasteShark-003', status: 'MAINTENANCE', battery: 15, progress: 0, runtime: '0m', location: 'Pool C' }
      ]
    }
    onUpdate(mockData)
  }, 3000) // Update every 3 seconds
  */
  
  return mockEventSource
}

/**
 * Start Cleaning - POST /api/robots/start
 * Command to start robot cleaning operation
 * 
 * Backend Request:
 * {
 *   "robotId": "robot-uuid",
 *   "userId": "user-uuid"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * Backend also:
 * - Updates robot status to "roaming" in database
 * - Publishes MQTT command: /robot/{robotId}/command with status: "roaming"
 * 
 * @param {string} robotId - Robot UUID
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const startCleaning = async (robotId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        robotId: robotId,
        userId: userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [startCleaning]')
      throw new Error(errorData.error || errorData.message || 'Failed to start cleaning')
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to start cleaning')
  }
}

/**
 * Stop Cleaning - POST /api/robots/stop
 * Command to stop robot cleaning operation
 * 
 * Backend Request:
 * {
 *   "robotId": "robot-uuid",
 *   "userId": "user-uuid"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * Backend also:
 * - Updates robot status to "stopping" in database
 * - Publishes MQTT command: /robot/{robotId}/command with status: "stopping"
 * 
 * @param {string} robotId - Robot UUID
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const stopCleaning = async (robotId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        robotId: robotId,
        userId: userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [stopCleaning]')
      throw new Error(errorData.error || errorData.message || 'Failed to stop cleaning')
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to stop cleaning')
  }
}

/**
 * Add Robot to User Account - POST /api/robots/new
 * Assigns an existing robot to the user account
 * 
 * Backend Request:
 * {
 *   "robotId": "existing-robot-id",
 *   "userId": "user-uuid"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * IMPORTANT: This endpoint does NOT create a new robot.
 * It assigns an existing robot (by robot_id) to the user.
 * The robot must already exist in the database.
 * 
 * @param {string} robotId - Existing robot_id from database
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const createRobot = async (robotId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        robotId: robotId,
        userId: userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [createRobot]')
      throw new Error(errorData.error || errorData.message || 'Failed to add robot')
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to add robot')
  }
}

/**
 * Remove Robot from User Account - POST /api/robots/delete
 * Removes the association between a robot and user account
 * 
 * Backend Request:
 * {
 *   "robotId": "robot-uuid",
 *   "userId": "user-uuid"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * NOTE: This does NOT delete the robot from the database, only removes
 * the ownership association. The robot can be assigned to another user later.
 * 
 * @param {string} robotId - Robot UUID
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const deleteRobot = async (robotId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        robotId: robotId,
        userId: userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [deleteRobot]')
      throw new Error(errorData.error || errorData.message || 'Failed to remove robot')
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to remove robot')
  }
}

/**
 * Rename Robot - POST /api/robots/rename
 * Updates robot name and optionally location
 * 
 * Backend Request:
 * {
 *   "robotId": "robot-uuid",
 *   "userId": "user-uuid",
 *   "name": "New Robot Name",
 *   "location": "New Location" (optional)
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * @param {string} robotId - Robot UUID
 * @param {string} userId - User UUID from JWT token
 * @param {string} name - New robot name (required)
 * @param {string} location - New location (optional)
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const renameRobot = async (robotId, userId, name, location, token) => {
  try {
    const body = {
      robotId: robotId,
      userId: userId,
      name: name
    }
    if (location) {
      body.location = location
    }
    
    const response = await fetch(`${API_BASE_URL}/api/robots/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      handleTokenExpiration(response, errorData, 'Robots API [renameRobot]')
      throw new Error(errorData.error || errorData.message || 'Failed to rename robot')
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to rename robot')
  }
}

/**
 * Emergency Kill Switch - Stops all robots immediately
 * 
 * NOTE: Backend does not have a dedicated emergency stop endpoint.
 * This function implements emergency stop by calling stopCleaning
 * for each robot individually.
 * 
 * @param {Array<string>} robotIds - Array of robot UUIDs
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const emergencyStopAll = async (robotIds, userId, token) => {
  try {
    // Stop each robot individually since backend doesn't have bulk stop endpoint
    const promises = robotIds.map(robotId => stopCleaning(robotId, userId, token))
    await Promise.all(promises)
    return { success: true, message: 'All robots stopped' }
  } catch (error) {
    throw new Error(error.message || 'Failed to execute emergency stop')
  }
}

/**
 * Add Robot to User Account - POST /api/robots/new
 * Assigns an existing robot (by UUID) to the authenticated user's account
 * 
 * Backend Request:
 * {
 *   "robotId": "existing-robot-uuid",
 *   "userId": "user-uuid"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true
 * }
 * 
 * Backend Behavior:
 * - Finds robot by robot_id (UUID)
 * - Returns 404 if robot not found
 * - Returns 403 if robot is already owned by another user
 * - Assigns robot to user if not owned
 * 
 * NOTE: This endpoint does NOT create new robots. It only assigns existing
 * robots that are not yet owned by any user. The robot must already exist
 * in the database with a valid robot_id (UUID).
 * 
 * @param {string} robotId - Existing robot UUID that user wants to add
 * @param {string} userId - User UUID from JWT token
 * @param {string} token - JWT access token
 * @returns {Promise<{success: boolean}>}
 */
export const newRobot = async (robotId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/robots/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        robotId: robotId,
        userId: userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check for token expiration first
      handleTokenExpiration(response, errorData, 'Robots API [newRobot]')
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error('Robot not found. Please check the UUID and try again.')
      } else if (response.status === 403) {
        throw new Error('Robot is already owned by another user.')
      } else {
        throw new Error(errorData.error || errorData.message || 'Failed to add robot to your account')
      }
    }
    
    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    throw new Error(error.message || 'Failed to add robot to your account')
  }
}