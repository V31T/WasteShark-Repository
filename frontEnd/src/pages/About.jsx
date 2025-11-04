import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { teamColors, teamMembers } from "../data/team"
import Carousel from "../components/Carousel"
import PageTransition from "../components/PageTransition"

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-navy">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white py-24 relative overflow-hidden">
          {/* Decorative glowing circles same as Home */}
          <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h1
                className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                About Us <br />
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-grey-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Learn more about the team behind WasteShark and our mission to clean the waters.
              </motion.p>
            </div>

            {/* Image Row */}
            <div className="relative mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 z-10 overflow-visible">
              {/* Left Image */}
              <motion.img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                alt="Team working"
                className="w-64 sm:w-72 md:w-80 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500"
                initial={{ opacity: 0, y: 40, x: -40 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Center Image */}
              <motion.img
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                alt="WasteShark prototype"
                className="w-72 sm:w-80 md:w-96 rounded-2xl shadow-2xl hover:scale-110 transition-transform duration-500 z-20"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
              {/* Right Image */}
              <motion.img
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                alt="Ocean cleanup"
                className="w-64 sm:w-72 md:w-80 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500"
                initial={{ opacity: 0, y: 40, x: 40 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              />
            </div>
          </div>
        </section>

        {/* Image Carousel */}
        <section className="bg-gradient-to-br from-navy via-blue-950/30 to-navy text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Project Gallery
            </motion.h2>
            <Carousel
              images={[
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=60",
                "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=60",
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=60",
              ]}
            />
          </div>
        </section>

        {/* Team Grid */}
        <section className="bg-gradient-to-br from-navy via-green-900/20 to-navy text-white py-24 relative overflow-hidden">
          {/* Soft gradient background */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute -top-20 left-1/3 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <h2
              className="text-5xl md:text-6xl font-bold mb-16 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent text-center"
              style={{ lineHeight: 1.2 }}
            >
              Meet the Team
            </h2>

            {/* Group members by team */}
            {[...new Set(teamMembers.map((m) => m.team))].map((team) => (
              <div key={team} className="mb-20">
                {/* Team Header */}
                <h3
                  className={`text-3xl font-semibold mb-10 text-center bg-gradient-to-r ${teamColors[team]} bg-clip-text text-transparent`}
                >
                  {team} Team
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {teamMembers
                    .filter((member) => member.team === team)
                    .map((member) => {
                      const isLead =
                        member.role.toLowerCase().includes("lead") ||
                        member.role.toLowerCase().includes("director")

                      return (
                        <div
                          key={member.name}
                          className={`relative group glass-effect border-white/10 rounded-lg p-6 shadow-lg transform transition-all duration-300 cursor-pointer hover:scale-105 
                            ${
                              isLead
                                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-2 border-yellow-300 shadow-yellow-300/40"
                                : `hover:bg-gradient-to-r ${teamColors[team]}`
                            }`}
                        >
                          <div className="relative z-10 p-6 flex flex-col items-center text-center">
                            <div
                              className={`w-24 h-24 mb-4 rounded-full overflow-hidden shadow-md ${
                                isLead ? "ring-4 ring-yellow-300" : "bg-gray-300"
                              }`}
                            >
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                                alt={member.name}
                              />
                            </div>

                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p
                              className={`text-sm ${
                                isLead ? "text-yellow-200 font-semibold" : "text-gray-200"
                            }`}
                          >
                            {member.role}
                          </p>
                        </div>

                        {/* Subtle glow for leads */}
                        {isLead && (
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 opacity-20 blur-xl"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Statement */}
        <section className="bg-gradient-to-b from-navy-light to-navy text-white py-12 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 sm:px-6 text-center space-y-12">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Our Mission
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                At WasteShark, our mission is to revolutionize waterway cleanup through innovative technology and dedicated teamwork. We strive to create a cleaner, healthier environment for future generations by tackling pollution head-on with our autonomous solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 text-left md:text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-semibold text-cyan-400">Innovation Through Collaboration</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our diverse team of 15 engineers brings together expertise in software development, electrical engineering, and mechanical design. By blending creativity with technical precision, we push the limits of what’s possible in autonomous water-cleaning technology.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-semibold text-blue-400">Sustainability First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Every aspect of our design process prioritizes environmental impact — from power efficiency to material selection. Our goal is to build technology that not only cleans the planet but also protects it.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-semibold text-purple-400">Customer-Centric Design</h3>
                <p className="text-gray-300 leading-relaxed">
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
