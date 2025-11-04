/**
 * Authentication API - Backend Integration Layer
 * 
 * INTEGRATION STATUS:
 * - Login: ✅ Integrated with POST /api/users/login
 * - Signup: ✅ Integrated with POST /api/users/signup
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Facade Pattern: Simplifies authentication API calls
 * 2. Adapter Pattern: Transforms data between frontend and backend
 * 3. Repository Pattern: Centralized authentication data access
 * 
 * BACKEND ENDPOINTS USED:
 * - POST /api/users/login - User authentication
 * - POST /api/users/signup - User registration
 * 
 * NOTE: Backend uses HTTP-only cookies for refresh tokens, which are
 * automatically sent/received by the browser. Access tokens are returned
 * in the response body and must be stored in localStorage.
 */

/**
 * API Base URL Configuration
 * 
 * CORS REQUIREMENTS:
 * - Backend must allow requests from this origin
 * - Backend CORS origin is configured in server.js (default: http://localhost:5173)
 * - If frontend runs on different port, set FRONTEND_ORIGIN environment variable in backend
 * 
 * DEVELOPMENT:
 * - Frontend typically runs on http://localhost:5173 (Vite default)
 * - Backend runs on http://localhost:3000 (from HTTP_PORT env var)
 * 
 * PRODUCTION:
 * - Set VITE_API_BASE_URL environment variable to production backend URL
 * - Ensure backend FRONTEND_ORIGIN matches frontend domain
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
/**
 * User Login - POST /api/users/login
 * Implements authentication flow with JWT token generation
 * 
 * Backend Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true,
 *   "token": "JWT_ACCESS_TOKEN",
 *   "user_id": "uuid-here"
 * }
 * 
 * Backend also sets HTTP-only refresh token cookie (7 day expiry)
 * 
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, token: string, user_id: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: Include cookies for refresh token
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Login failed')
    }
    
    const data = await response.json()
    return {
      success: data.success,
      token: data.token,
      user_id: data.user_id,
      email: email // Include email for use in frontend
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

/**
 * Create User (Signup) - POST /api/users/signup
 * Implements user registration flow
 * 
 * Backend Request:
 * {
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Backend Response:
 * {
 *   "success": true,
 *   "token": "JWT_ACCESS_TOKEN"
 * }
 * 
 * NOTE: Backend signup endpoint does NOT return user_id in response.
 * You would need to decode the JWT token or modify backend to return it.
 * For now, we'll extract it from the token or handle it separately.
 * 
 * Backend also sets HTTP-only refresh token cookie (7 day expiry)
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User first name (will be converted to first_name)
 * @param {string} userData.lastName - User last name (will be converted to last_name)
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @returns {Promise<{success: boolean, token: string}>}
 */
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: Include cookies for refresh token
      body: JSON.stringify({
        first_name: userData.firstName, // Backend expects snake_case
        last_name: userData.lastName,   // Backend expects snake_case
        email: userData.email,
        password: userData.password
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create user')
    }
    
    const data = await response.json()
    return {
      success: data.success,
      token: data.token
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to create user')
  }
}

/**
 * User Logout - POST /api/users/logout
 * Implements logout flow with refresh token cookie clearing
 * 
 * NOTE: Logout endpoint exists but is not integrated here since the requirement
 * is only to integrate login and signup. Logout functionality remains in AuthContext
 * using localStorage clearing.
 * 
 * Backend endpoint: POST /api/users/logout (clears refresh token cookie)
 * No request body or headers required - uses cookie for authentication
 * 
 * Response: { "message": "Logged out successfully" } or 204 No Content
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
      method: 'POST',
      credentials: 'include', // Important: Include cookies to clear refresh token
      headers: { 'Content-Type': 'application/json' }
    })
    
    // 204 No Content is also a valid success response
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Logout failed')
    }
    
    return { success: true }
  } catch (error) {
    // Even if backend logout fails, we should clear local storage
    // This is handled in AuthContext
    throw new Error(error.message || 'Logout failed')
  }
}
