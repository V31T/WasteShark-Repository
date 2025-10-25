/**
 * Login Page - Static No Authentication
 *  
 * Two column layout, form on left, info on right. 
 * 
 * No Navbar, need from Kardin
 * No Auth, will be implemented over the weekend
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/logo_transparent.svg'
import Button from '../components/Button'
import Navbar from '../components/Navbar'

const Login = () => {
  const navigate = useNavigate()

  // Local form states (purely visual)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Simplified submission handler — just simulates a login
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Login successful!')
      navigate('/') // Redirect to Home after fake login
      setLoading(false)
    }, 1200)
  }

  return (
  <>
    <div className="min-h-screen bg-navy p-8 overflow-hidden">
      {/* Two-Column Layout */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 h-full">

        {/* Left Column - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-[#1a1f3a] rounded-2xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <img src={logo} alt="WasteShark Logo" className="h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your email" />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-royal focus:border-royal transition-all"
                  placeholder="Enter your password" />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-royal text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don’t have an account?{' '}
              <a href="#" className="text-royal font-semibold hover:underline">
                Sign up here
              </a>
            </p>
          </div>
        </div>

        {/* Right Column - Marketing Info */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-royal rounded-2xl p-12 text-white shadow-2xl">
            <h3 className="text-4xl font-bold mb-6">
              Experience the Future of Autonomous Cleaning
            </h3>
            <p className="text-lg text-gray-100 mb-8">
              Access comprehensive robot tools to optimize your operations and
              make a positive environmental impact.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Admin Dashboard */}
              <div className="bg-white rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-navy mb-1">Admin Dashboard</h4>
                <p className="text-sm text-gray-600">Monitor and control your robots</p>
              </div>

              {/* Secure & Private */}
              <div className="bg-white rounded-xl p-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
</>
  )
}

export default Login
