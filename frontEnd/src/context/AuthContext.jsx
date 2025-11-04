/**
 * Authentication Context - Implements JWT-based Authentication Pattern
 * 
 * INTEGRATION STATUS:
 * - Login: ✅ Integrated with backend POST /api/users/login
 * - Signup: ✅ Integrated with backend POST /api/users/signup
 * 
 * UML ANALYSIS:
 * This component implements a Singleton pattern for global authentication state.
 * It acts as a Facade, providing a simple interface to complex authentication logic.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Context Pattern: Provides global authentication state
 * 2. Facade Pattern: Simplifies authentication operations
 * 3. Observer Pattern: Components re-render when auth state changes
 * 
 * JWT FLOW:
 * 1. Login -> Backend returns access token + sets refresh token cookie
 * 2. Store access token and user_id in localStorage
 * 3. Logout -> Clear token from localStorage
 * 
 * NOTE: Backend uses HTTP-only cookies for refresh tokens (7 day expiry).
 * Access tokens are stored in localStorage (15 minute expiry).
 * 
 * NOTE: Users can add robots to their account using the robot UUID in the Dashboard.
 * See the newRobot function in robots.js for details.
 */

import { createContext, useState, useEffect, useContext } from 'react'
import toast from 'react-hot-toast'
import { loginUser, createUser as signupUser } from '../api/auth'

// Context creation: Singleton pattern for global auth state
const AuthContext = createContext(null)

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// AuthProvider Component: Manages authentication state for entire app
export const AuthProvider = ({ children }) => {
  // State Management: User data and authentication token
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null)
  const [loading, setLoading] = useState(true)

  // Initialize: Check for existing session on mount
  useEffect(() => {
    // Load stored credentials from localStorage
    const storedToken = localStorage.getItem('token')
    const storedUserId = localStorage.getItem('userId')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUserId) {
      setToken(storedToken)
      setUserId(storedUserId)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setLoading(false)
  }, [])

  // Login Handler: Implements JWT authentication flow
  const login = async (email, password) => {
    try {
      // Call backend login endpoint
      const result = await loginUser(email, password)
      
      if (result.success && result.token && result.user_id) {
        // Store credentials: Persist to localStorage for session management
        const userData = {
          email: email,
          id: result.user_id,
          user_id: result.user_id
        }
        
        setToken(result.token)
        setUserId(result.user_id)
        setUser(userData)
        localStorage.setItem('token', result.token)
        localStorage.setItem('userId', result.user_id)
        localStorage.setItem('user', JSON.stringify(userData))
        
        toast.success('Login successful!')
        return { success: true, user_id: result.user_id }
      } else {
        throw new Error('Invalid login response')
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.')
      return { success: false, error: error.message }
    }
  }

  // Signup Handler: Implements user registration flow
  // Note: Backend signup doesn't return user_id, so we'll decode from token if needed
  const signup = async (userData) => {
    try {
      // Call backend signup endpoint
      const result = await signupUser(userData)
      
      if (result.success && result.token) {
        // Backend signup doesn't return user_id in response
        // We could decode the JWT token to get it, but for now we'll handle it after login
        // The user will need to log in after signup to get full user data
        
        toast.success('Account created successfully! Please log in.')
        return { success: true, token: result.token }
      } else {
        throw new Error('Invalid signup response')
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed. Please try again.')
      return { success: false, error: error.message }
    }
  }

  // Logout Handler: Clears authentication state
  const logout = () => {
    setToken(null)
    setUser(null)
    setUserId(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }

  // Authorization Check: Determines if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!userId
  }

  // Context Value: Exposed API for child components
  const value = {
    user,
    userId, // Expose userId for components that need it
    token,
    login,
    signup, // Expose signup function
    logout,
    isAuthenticated,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
