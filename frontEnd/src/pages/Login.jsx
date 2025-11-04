/**
 * Login Page - Authentication Entry Point
 * 
 * UML ANALYSIS:
 * This component implements the Form Handler pattern for user authentication.
 * Uses the Mediator pattern to coordinate between form inputs and authentication service.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Form Handler: Manages login form state and submission
 * 2. Mediator Pattern: Coordinates between UI and AuthContext
 * 3. Presentation Pattern: Two-column layout with form and marketing info
 * 
 * AUTHENTICATION FLOW:
 * User Input -> Form Validation -> AuthContext.login() -> JWT Token -> Navigate to Dashboard
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import toast from 'react-hot-toast'
import logo from '../assets/logo_transparent.svg'

const Login = () => {
  // Form State Management
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Form Submission Handler
   * Implements authentication flow with JWT token generation
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Authenticate user through AuthContext
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-navy p-8 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-royal/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-royal/10 rounded-full blur-3xl"></div>
      </div>

      {/* Two-Column Layout: Form (left) and Marketing Info (right) */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 h-full relative z-10">
        {/* Left Column - Login Form in Dark Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md glass-effect rounded-2xl p-10 shadow-2xl border border-white/10 hover:border-royal/30 transition-all">
            <div className="text-center mb-8">
              <img src={logo} alt="WasteShark Logo" className="h-12 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gradient mb-2">Welcome Back</h2>
              <p className="text-gray-300">Sign in to your account to continue</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-lighter border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-lighter border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-royal border-white/10 rounded focus:ring-royal bg-navy-lighter" />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <a href="#" className="text-sm text-royal-light hover:text-royal transition-colors">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-royal to-royal-dark hover:from-royal-dark hover:to-royal text-white py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            {/* <div className="mt-8">
              <p className="text-white font-semibold mb-2">Demo Credentials:</p>
              <p className="text-royal text-sm">Email: admin@wasteshark.com</p>
              <p className="text-royal text-sm">Password: demo123</p>
            </div> */}
            
            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-royal-light font-semibold hover:text-royal transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Marketing Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-royal to-royal-dark rounded-2xl p-12 text-white shadow-2xl border border-royal-light/20">
            <h3 className="text-4xl font-bold mb-6">
              Join the Pool Cleaning Revolution
            </h3>
            <p className="text-lg text-gray-100 mb-8 leading-relaxed">
              Access comprehensive robot tools to optimize your operations and make a positive environmental impact.
            </p>
            
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Admin Dashboard Card */}
              <div className="bg-white rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-navy mb-1">Admin Dashboard</h4>
                <p className="text-sm text-gray-600">Monitor and control your robots</p>
              </div>
              
              {/* Secure & Private Card */}
              <div className="bg-white rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold text-navy mb-1">Secure & Private</h4>
                <p className="text-sm text-gray-600">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
