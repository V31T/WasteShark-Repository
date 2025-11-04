/**
 * Home Page - Landing Page / Marketing Page
 * 
 * UML ANALYSIS:
 * This component implements the Landing Page pattern with a hero section.
 * Uses the Navigational Component pattern with call-to-action buttons.
 * 
 * ARCHITECTURAL PATTERNS:
 * 1. Landing Page: Marketing-focused homepage
 * 2. Navigation: Smooth scroll to sections
 * 3. Call-to-Action: Directs users to login
 * 4. Intersection Observer: Scroll animations for team cards
 */

import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import TeamCard from '../components/TeamCard'

const Home = () => {
  const teamCardsRef = useRef([])

  /**
   * Intersection Observer for scroll animations
   * Triggers fade-in-up animation when cards enter viewport
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            entry.target.style.opacity = '1'
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    teamCardsRef.current.forEach((card) => {
      if (card) {
        observer.observe(card)
      }
    })

    return () => {
      teamCardsRef.current.forEach((card) => {
        if (card) {
          observer.unobserve(card)
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-navy">
      {/* Hero Section: Main value proposition */}
      <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white py-24 relative overflow-hidden">
        {/* Background decorative elements - Multi-colored */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight animate-fade-in">
              Autonomous Pool Cleaning <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                for Debris Removal
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-200 leading-relaxed">
              WasteShark is an advanced autonomous pool cleaning robot that efficiently removes large debris with the simple press of a button. Experience hassle-free pool maintenance with our cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/login">
                <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-glow-lg transition-all transform hover:-translate-y-1 hover:scale-105 shadow-lg">
                  Get Started
                </button>
              </Link>
              <button className="px-12 py-4 glass-effect text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition-all transform hover:-translate-y-1 border-2 border-white/20 hover:border-cyan-400/50">
                Learn More
              </button>
            </div>

            {/* Feature Highlights - Colorful Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="glass-effect rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all transform hover:-translate-y-2 hover:shadow-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">Lightning Fast</h3>
                <p className="text-gray-300 text-sm">Cleans pools in record time with intelligent path planning</p>
              </div>

              <div className="glass-effect rounded-xl p-6 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-2 hover:shadow-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">AI-Powered</h3>
                <p className="text-gray-300 text-sm">Smart navigation adapts to any pool shape and size</p>
              </div>

              <div className="glass-effect rounded-xl p-6 border-2 border-green-500/30 hover:border-green-500/60 transition-all transform hover:-translate-y-2 hover:shadow-glow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Eco-Friendly</h3>
                <p className="text-gray-300 text-sm">Energy-efficient design with minimal environmental impact</p>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* About Our Team Section */}
     <section className="bg-gradient-to-b from-navy via-indigo-950/30 to-navy text-white py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              About Our Team
            </h2>
            <p className="text-xl max-w-4xl mx-auto text-gray-200 leading-relaxed">
              Meet the talented individuals behind WasteShark's innovative pool cleaning technology. Our diverse team of experts brings together cutting-edge engineering and design to create the most advanced autonomous pool cleaning robot on the market.
            </p>
          </div>

          {/* Team Cards with scroll animation */}
          <div className="flex flex-col gap-8">
            <div 
              ref={(el) => (teamCardsRef.current[0] = el)}
              className="opacity-0 transition-all duration-700"
              style={{ transitionDelay: '0ms' }}
            >
              <TeamCard
                color="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600"
                icon="⚡"
                teamName="Electrical Team"
                title="Electrical Engineering Team"
                description="Our electrical engineers design and develop the advanced control systems, sensors, and power management that make WasteShark's autonomous navigation possible. They ensure reliable operation and efficient power consumption."
                skills={[
                  'Autonomous Navigation Systems',
                  'Sensor Integration',
                  'Control Algorithms',
                  'Power Management'
                ]}
              />
            </div>

            <div 
              ref={(el) => (teamCardsRef.current[1] = el)}
              className="opacity-0 transition-all duration-700"
              style={{ transitionDelay: '100ms' }}
            >
              <TeamCard
                color="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
                icon="🔧"
                teamName="Mechanical Team"
                title="Mechanical Engineering Team"
                description="Our mechanical engineers create the robust, water-resistant chassis and propulsion systems that allow WasteShark to navigate and clean pools effectively. They focus on durability and performance in aquatic environments."
                skills={[
                  'Underwater Propulsion',
                  'Debris Collection Systems',
                  'Durable Materials',
                  'Waterproof Design'
                ]}
              />
            </div>

            <div 
              ref={(el) => (teamCardsRef.current[2] = el)}
              className="opacity-0 transition-all duration-700"
              style={{ transitionDelay: '200ms' }}
            >
              <TeamCard
                color="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600"
                icon="💻"
                teamName="Software Team"
                title="Software Development Team"
                description="Our software engineers develop the intelligent algorithms and user interface that make WasteShark easy to use. They create the one-button operation system and ensure seamless user experience."
                skills={[
                  'AI Navigation',
                  'User Interface Design',
                  'Machine Learning',
                  'Mobile App Development'
                ]}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Lower Content Section - Stats/Features */}
      <section className="bg-gradient-to-br from-navy via-blue-950/30 to-navy text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight" style={{ lineHeight: '1.15' }}>
              Revolutionary Pool Technology
            </h2>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto text-gray-200 leading-relaxed mb-12">
              Our autonomous robots combine cutting-edge AI with precision engineering to deliver the most advanced pool cleaning experience.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="glass-effect rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all transform hover:-translate-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-sm text-gray-300">Cleaning Efficiency</div>
            </div>
            <div className="glass-effect rounded-xl p-6 border-2 border-green-500/30 hover:border-green-500/60 transition-all transform hover:-translate-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-sm text-gray-300">Active Robots</div>
            </div>
            <div className="glass-effect rounded-xl p-6 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-sm text-gray-300">Monitoring</div>
            </div>
            <div className="glass-effect rounded-xl p-6 border-2 border-orange-500/30 hover:border-orange-500/60 transition-all transform hover:-translate-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">3hrs</div>
              <div className="text-sm text-gray-300">Battery Life</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-b from-navy-light to-navy text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} WasteShark. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
