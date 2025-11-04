/**
 * Signup Page - User Registration
 * 
 * UML ANALYSIS:
 * This component implements the Form Handler pattern for user registration.
 * Uses the Mediator pattern to coordinate between form inputs and authentication service.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Form Handler: Manages signup form state and submission
 * 2. Mediator Pattern: Coordinates between UI and AuthContext
 * 3. Presentation Pattern: Two-column layout with form and marketing info
 * 
 * REGISTRATION FLOW:
 * User Input -> Form Validation -> createUser() -> Success -> Navigate to Login
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo_transparent.svg'

const Signup = () => {
  // Form State Management
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

  /**
   * Form Submission Handler
   * Implements user registration flow
   * Uses AuthContext.signup which calls the backend API
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create user account through AuthContext
      const result = await signup({ firstName, lastName, email, password })
      if (result.success) {
        // Navigate to login page after successful signup
        navigate('/login')
      }
    } catch (error) {
      // Error handling is done in AuthContext, but catch here for safety
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy p-8 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-royal/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-40 w-80 h-80 bg-royal/10 rounded-full blur-3xl"></div>
      </div>

      {/* Two-Column Layout: Form (left) and Marketing Info (right) */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-4rem)] relative z-10">
        {/* Left Column - Signup Form in Dark Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md glass-effect rounded-2xl p-10 shadow-2xl border border-white/10 hover:border-royal/30 transition-all">
            <div className="text-center mb-8">
              <img src={logo} alt="WasteShark Logo" className="h-12 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gradient mb-2">Create Account</h2>
              <p className="text-gray-300">Join the WasteShark community</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-lighter border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-lighter border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your last name"
                />
              </div>
              
              {/* Email */}
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
              
              {/* Password */}
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
                  placeholder="Create a password"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-royal to-royal-dark hover:from-royal-dark hover:to-royal text-white py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
            
            {/* Link to Login */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-royal-light font-semibold hover:text-royal transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Marketing Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-royal to-royal-dark rounded-2xl p-12 text-white shadow-2xl border border-royal-light/20">
            <h3 className="text-4xl font-bold mb-6">
              Start Your Journey Today
            </h3>
            <p className="text-lg text-gray-100 mb-8 leading-relaxed">
              Join thousands of pool owners who trust WasteShark for automated pool cleaning. Get started in minutes and experience the future of pool maintenance.
            </p>
            
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Easy Setup Card */}
              <div className="bg-white rounded-xl p-4 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-navy mb-1">Easy Setup</h4>
                <p className="text-sm text-gray-600">Get started in minutes</p>
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

export default Signup

