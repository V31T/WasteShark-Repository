/**
 * About Page - Team Information and Mission Statement
 * 
 * OPTIMIZATION CHANGES (Latest Update):
 * 1. Enhanced animations with staggered delays for smoother visual flow
 * 2. Improved image hover effects with scale and shadow transitions
 * 3. Added scroll-triggered animations for team cards using whileInView
 * 4. Enhanced team member cards with better hover states and smooth transitions
 * 5. Improved spacing and visual hierarchy throughout sections
 * 6. Added motion animations to team section headers
 * 7. Enhanced mission statement cards with staggered animations
 * 8. Improved image loading with better aspect ratios and transitions
 * 9. Added smooth backdrop blur effects on hover
 * 10. Better visual polish with refined shadows and borders
 */

import { motion } from "framer-motion"
import { teamColors, teamMembers } from "../data/team"
import Carousel from "../components/Carousel"
import PageTransition from "../components/PageTransition"

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-navy">
        {/* Hero Section - Enhanced with smoother animations */}
        <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white min-h-screen flex items-center justify-center pt-8 md:pt-12 pb-16 md:pb-20 relative overflow-hidden">
          {/* Decorative glowing circles - Enhanced animation timing */}
          <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div 
                className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
              <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="text-center">
              <motion.h1
                className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                About Us
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-5xl mx-auto text-gray-200 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                At WasteShark, we're a team of 15 engineers dedicated to revolutionizing waterway cleanup through autonomous technology. By combining innovation, sustainability, and collaboration across software, electrical, and mechanical engineering, we design solutions that protect the environment while creating meaningful, lasting impact.
              </motion.p>
            </div>

            {/* Image Row - Enhanced with better hover effects and smoother animations */}
            <div className="relative mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 z-10 overflow-visible">
              {/* Left Image - Enhanced hover effect */}
              <motion.div
                initial={{ opacity: 0, y: 50, x: -50, rotate: -5 }}
                animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.05, y: -10, rotate: 2, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                  alt="Team working"
                  className="w-72 sm:w-80 md:w-96 lg:w-[28rem] rounded-xl shadow-2xl group-hover:shadow-cyan-500/30 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
              
              {/* Center Image - Enhanced with larger scale and prominence */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                whileHover={{ scale: 1.08, y: -15, transition: { duration: 0.3 } }}
                className="relative group z-20"
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                  alt="WasteShark prototype"
                  className="w-80 sm:w-96 md:w-[32rem] lg:w-[36rem] rounded-xl shadow-2xl group-hover:shadow-purple-500/40 transition-all duration-500 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
              
              {/* Right Image - Enhanced hover effect */}
              <motion.div
                initial={{ opacity: 0, y: 50, x: 50, rotate: 5 }}
                animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -10, rotate: -2, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                  alt="Ocean cleanup"
                  className="w-72 sm:w-80 md:w-96 lg:w-[28rem] rounded-xl shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Image Carousel - Enhanced with smoother animations */}
        <section className="bg-gradient-to-br from-navy via-blue-950/30 to-navy text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <motion.div 
              className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Project Gallery
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Carousel
                images={[
                  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1560258018-c7db7645254e?auto=format&fit=crop&w=1200&q=80",
                  "https://images.unsplash.com/photo-1544551763-8a2f91935c3a?auto=format&fit=crop&w=1200&q=80",
                ]}
              />
            </motion.div>
          </div>
        </section>

        {/* Team Grid - Enhanced with scroll-triggered animations and smoother hover effects */}
        <section className="bg-gradient-to-br from-navy via-green-900/20 to-navy text-white py-16 md:py-20 relative overflow-hidden">
          {/* Soft gradient background - Animated */}
          <div className="absolute inset-0 opacity-25">
            <motion.div 
              className="absolute -top-20 left-1/3 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.25, 0.35, 0.25]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-10 right-1/3 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.35, 0.25]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent text-center leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Meet the Team
            </motion.h2>

            {/* Group members by team - Enhanced with staggered animations */}
            {[...new Set(teamMembers.map((m) => m.team))].map((team, teamIndex) => (
              <motion.div 
                key={team} 
                className="mb-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: teamIndex * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Team Header - Enhanced with animation */}
                <motion.h3
                  className={`text-2xl md:text-3xl font-semibold mb-8 text-center bg-gradient-to-r ${teamColors[team]} bg-clip-text text-transparent`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  {team} Team
                </motion.h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {teamMembers
                    .filter((member) => member.team === team)
                    .map((member, index) => {
                      const isLead =
                        member.role.toLowerCase().includes("lead") ||
                        member.role.toLowerCase().includes("director")

                      return (
                        <motion.div
                          key={member.name}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                          viewport={{ once: true }}
                          whileHover={{ 
                            scale: 1.05, 
                            y: -8,
                            transition: { duration: 0.2 }
                          }}
                          className={`relative group glass-effect border-white/10 rounded-xl p-6 shadow-lg transform transition-all duration-300 cursor-pointer
                            ${
                              isLead
                                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-2 border-yellow-300 shadow-yellow-300/40"
                                : `hover:bg-gradient-to-r ${teamColors[team]} border-white/20 hover:border-white/40`
                            }`}
                        >
                          <div className="relative z-10 p-3 flex flex-col items-center text-center">
                            <div
                              className={`w-20 h-20 mb-3 rounded-full overflow-hidden shadow-lg transition-all duration-300 ${
                                isLead ? "ring-4 ring-yellow-300 group-hover:ring-yellow-400" : "bg-gray-300 group-hover:ring-2 group-hover:ring-white/30"
                              }`}
                            >
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                                alt={member.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 transition-all duration-300">
                              {member.name}
                            </h3>
                            <p
                              className={`text-xs transition-colors duration-300 ${
                                isLead ? "text-yellow-200 font-semibold" : "text-gray-200 group-hover:text-white"
                            }`}
                          >
                            {member.role}
                          </p>
                        </div>

                        {/* Enhanced glow for leads */}
                        {isLead && (
                          <motion.div 
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 opacity-20 blur-xl"
                            animate={{ 
                              opacity: [0.2, 0.3, 0.2]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission Statement - Enhanced with better card design and staggered animations */}
        <section className="bg-gradient-to-b from-navy-light to-navy text-white py-12 md:py-16 border-t border-white/10 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center leading-tight">
                Our Mission
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-10 text-center">
                At WasteShark, our mission is to revolutionize waterway cleanup through innovative technology and dedicated teamwork. We strive to create a cleaner, healthier environment for future generations by tackling pollution head-on with our autonomous solutions.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="glass-effect rounded-xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cyan-400">Innovation Through Collaboration</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Our diverse team of 15 engineers brings together expertise in software development, electrical engineering, and mechanical design. By blending creativity with technical precision, we push the limits of what's possible in autonomous water-cleaning technology.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="glass-effect rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-400">Sustainability First</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  Every aspect of our design process prioritizes environmental impact — from power efficiency to material selection. Our goal is to build technology that not only cleans the planet but also protects it.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="glass-effect rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-400">Customer-Centric Design</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  We believe engineering should serve a mission. Every system we build is designed to solve real-world challenges, turning innovation into meaningful environmental change.
                </p>
              </motion.div>
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
    </PageTransition>
  )
}

export default About
