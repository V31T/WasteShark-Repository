/**
 * Home Page - WasteShark Landing Page
 * 
 * No Authentication or context dependencies.
 * No navbar, waiting for Kardin's code
 * 
 */

import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-navy text-white">
        {/* Hero Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Autonomous Pool Cleaning <br />
              <span className="text-royal">for Debris Removal</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
              WasteShark is an advanced autonomous pool cleaning robot that efficiently
              removes large debris with the simple press of a button. Experience hassle-free
              pool maintenance with our cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <button className="px-12 py-4 bg-royal text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all">
                  Get Started
                </button>
              </Link>
              <a href="#about">
                <button className="px-12 py-4 bg-transparent border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-navy transition-all">
                  Learn More
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Content Section */}
      <section className="bg-[#0a1a3a] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Revolutionary Pool Technology
            </h2>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto text-gray-300 leading-relaxed">
              Our autonomous robots combine cutting-edge AI with precision engineering to
              deliver the most advanced pool cleaning experience.
            </p>
          </div>
        </div>
      </section>
    </div>

    // include an About Section
</>
  )
}

export default Home
