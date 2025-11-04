import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo_transparent.svg'

const Navbar = () => {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="WasteShark Logo" className="h-10" />
              <span className="text-xl font-bold">WasteShark</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated() ? (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-royal transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-royal transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-royal transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-royal hover:bg-blue-600 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
