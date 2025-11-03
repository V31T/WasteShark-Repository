import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Carousel from "../components/Carousel"
import PageTransition from "../components/PageTransition"

const teamMembers = [
  { name: "Rishabh Jinesh", role: "Project Director, Backend Lead", team: "Backend" },
  { name: "Colin Lou", role: "Backend Team Member", team: "Backend" },
  { name: "Tavishi Bansal", role: "Backend Team Member", team: "Backend" },

  { name: "Henry Pham", role: "Frontend Lead", team: "Frontend" },
  { name: "Kardin Nguyen", role: "Frontend Team Member", team: "Frontend" },

  { name: "Tanuj Asthana", role: "Machine Learning Lead", team: "Machine Learning" },
  { name: "Aditya Lolla", role: "Machine Learning Team Member", team: "Machine Learning" },

  { name: "Kaden Kaufman", role: "Electrical Lead", team: "Electrical" },
  { name: "Alta Wan", role: "Electrical Team Member", team: "Electrical" },
  { name: "Ayana Ahuja", role: "Electrical Team Member", team: "Electrical" },
  { name: "Kiwook Kim", role: "Electrical Team Member", team: "Electrical" },

  { name: "Alondra Sanchez", role: "Mechanical Co-Lead", team: "Mechanical" },
  { name: "Dylan Lau", role: "Mechanical Co-Lead", team: "Mechanical" },
  { name: "Derek Trac", role: "Mechanical Team Member", team: "Mechanical" },
  { name: "Tarren Mai", role: "Mechanical Team Member", team: "Mechanical" },
]

const teamColors = {
  Backend: "from-emerald-400 via-teal-500 to-cyan-600",
  Frontend: "from-pink-400 via-rose-500 to-orange-500",
  "Machine Learning": "from-amber-400 via-lime-500 to-emerald-500",
  Electrical: "from-violet-400 via-fuchsia-500 to-red-500",
  Mechanical: "from-sky-400 via-indigo-500 to-blue-500",
}

const About = () => {
    return (
        <PageTransition>
            <div className="min-h-screen bg-navy relative overflow-hidden">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 overflow-visible">
                        {/* Text */}
                        <div className="text-center relative z-10">
                            <motion.h1
                                className="text-6xl md:text-7xl font-bold mb-6 leading-snug"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                About Us <br />
                            </motion.h1>
                            <motion.p
                                className="text-xl md:text-2xl max-w-3xl mx-auto"
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
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />

                            {/* Center Image (slightly forward) */}
                            <motion.img
                                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                                alt="WasteShark prototype"
                                className="w-72 sm:w-80 md:w-96 rounded-2xl shadow-2xl hover:scale-110 transition-transform duration-500 z-20"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            />

                            {/* Right Image */}
                            <motion.img
                                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                                alt="Ocean cleanup"
                                className="w-64 sm:w-72 md:w-80 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500"
                                initial={{ opacity: 0, y: 40, x: 40 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                            />
                            </div>

                            {/* Subtle floating animation effect */}
                            <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <motion.div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120%] h-[150%] bg-gradient-to-b from-transparent via-purple-900/10 to-navy"
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </section>

                {/* Image Carousel */}
                <section className="bg-navy py-24 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6">
                        <motion.h2
                            className="text-5xl md:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
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
                <section className="bg-navy py-16 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                        <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent text-center" style={{ lineHeight: 1.2 }}>
                            Meet the Team
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.name}
                                    className={`relative group glass-effect border-white/10 rounded-lg p-6 shadow-lg hover:bg-gradient-to-r ${teamColors[member.team]} hover:scale-105 transform transition-all duration-300 cursor-pointer`}
                                >

                                    {/* Content for each team member */}
                                    <div className="relative z-10 p-6 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 mb-4 rounded-full bg-gray-300 overflow-hidden shadow-md">
                                            {/* Placeholder for profile image */}
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                                                alt={member.name}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{member.name}</h3>
                                        <p className="text-sm text-gray-200">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Background Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 -left-20 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                    <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-blob animation-delay-6000"></div>
                    <div className="absolute bottom-10 left-10 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-blob animation-delay-8000"></div>
                    <div className="absolute top-20 right-1/3 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-10000"></div>
                </div>

                {/* Mission Statement */}
                <section className="bg-gradient-to-br from-navy via-purple-900/20 to-navy text-white py-24 relative z-10">
                    <div className="max-w-5xl mx-auto px-6 sm:px-6 text-center space-y-12">
                        {/* Title + Intro */}
                        <div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                                Our Mission
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                                At WasteShark, our mission is to revolutionize waterway cleanup through innovative technology and dedicated teamwork. We strive to create a cleaner, healthier environment for future generations by tackling pollution head-on with our autonomous solutions.
                            </p>
                        </div>

                        {/* Core Values */}
                        <div className="grid md:grid-cols-3 gap-10 text-left md:text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                <h3 className="text-2xl font-semibold text-cyan-400">
                                    Innovation Through Collaboration
                                </h3>
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
                                <h3 className="text-2xl font-semibold text-blue-400">
                                    Sustainability First
                                </h3>
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
                                <h3 className="text-2xl font-semibold text-purple-400">
                                    Customer-Centric Design
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    We believe engineering should serve a mission. Every system we build is designed to solve real-world challenges, turning innovation into meaningful environmental change.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}

export default About