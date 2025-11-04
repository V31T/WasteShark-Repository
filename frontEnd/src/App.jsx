/**
 * System Architecture Overview - WasteShark Frontend
 * 
 * This file implements the main application architecture following a component-based 
 * structure with separation of concerns:
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Context Provider Pattern - AuthProvider wraps app for global state
 * 2. Router Pattern - BrowserRouter manages navigation and route rendering
 * 3. Container/Presentation Pattern - Pages contain logic, components are reusable
 * 
 * UML COMPONENT IMPLEMENTATION:
 * - AuthContext: Implements authentication state management (Singleton pattern)
 * - PrivateRoute: Implements route protection (Decorator pattern)
 * - Pages: Implement presentation layer (Home, Login, Dashboard, Admin)
 * - Components: Reusable UI elements (Button, StatusCard, Navbar)
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

function App() {
  return (
    // Context Provider: Provides authentication state to entire application
    <AuthProvider>
      {/* Router: Manages URL-based navigation and route rendering */}
      <Router>
        <div className="min-h-screen">
          {/* Toast Notification System: Global notification component */}
          <Toaster position="top-right" />
          
          {/* Route Configuration: Defines application pages and access control */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/signup" element={<><Navbar /><Signup /></>} />
            
            {/* Protected Routes: Wrapped in PrivateRoute to enforce authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
