/**
 * Just some basic routing with react-router-dom
 * 
 * Will implement authentication and protected routes later over the weekend
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  return (
    // Router: Manages URL-based navigation and page rendering
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Toast Notification System (Optional) */}
        <Toaster position="top-right" />

        {/*Only Home and Login */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
