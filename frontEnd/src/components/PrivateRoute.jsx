/**
 * Private Route Component - Route Protection Pattern
 * 
 * UML ANALYSIS:
 * This component implements the Decorator pattern, wrapping protected routes
 * with authentication checks. It acts as a Guard to control access.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Decorator Pattern: Adds authentication logic to routes
 * 2. Guard Pattern: Protects routes from unauthorized access
 * 3. High-Order Component: Wraps child components with auth logic
 * 
 * FLOW:
 * User navigates -> Check authentication -> Allow/Rewrite based on auth state
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  // Loading State: Show spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal"></div>
      </div>
    )
  }

  /**
   * Authorization Check:
   * - If authenticated: Render protected content
   * - If not authenticated: Redirect to login page
   */
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
