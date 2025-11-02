import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const teamMembers = [
  { name: 'Rishabh Jinesh', role: 'Project Director, Backend Lead', team: 'Backend' },
  { name: 'Colin Lou', role: 'Backend Team Member', team: 'Backend' },
  { name: 'Tavishi Bansal', role: 'Backend Team Member', team: 'Backend' },

  { name: 'Henry Pham', role: 'Frontend Lead', team: 'Frontend' },
  { name: 'Kardin Nguyen', role: 'Frontend Team Member', team: 'Frontend' },

  { name: 'Tanuj Asthana', role: 'Machine Learning Lead', team: 'Machine Learning' },
  { name: 'Aditya Lolla', role: 'Machine Learning Team Member', team: 'Machine Learning' },

  { name: 'Kaden Kaufman', role: 'Electrical Lead', team: 'Electrical' },
  { name: 'Alta Wan', role: 'Electrical Team Member', team: 'Electrical' },
  { name: 'Ayana Ahuja', role: 'Electrical Team Member', team: 'Electrical' },
  { name: 'Kiwook Kim', role: 'Electrical Team Member', team: 'Electrical' },

  { name: 'Alondra Sanchez', role: 'Mechanical Co-Lead', team: 'Mechanical' },
  { name: 'Dylan Lau', role: 'Mechanical Co-Lead', team: 'Mechanical' },
  { name: 'Derek Trac', role: 'Mechanical Team Member', team: 'Mechanical' },
  { name: 'Tarren Mai', role: 'Mechanical Team Member', team: 'Mechanical' },
]

const teamColors = {
  Backend: 'from-green-400 via-blue-500 to-purple-600',
  Frontend: 'from-pink-400 via-red-500 to-yellow-500',
  "Machine Learning": 'from-yellow-400 via-green-500 to-blue-500',
  Electrical: 'from-purple-400 via-pink-500 to-red-500',
  Mechanical: 'from-blue-400 via-cyan-500 to-green-500',
}

const About = () => {
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
      </section>

      {/* Team Section: Display team members */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">MEET THE TEAM</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className={`bg-white/10 hover:bg-gradient-to-r ${teamColors[member.team]} text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300`}
              >
                <h2 className="text-2xl font-semibold mb-2">{member.name}</h2>
                <p className="text-gray-300">{member.role}</p>
                <p className="mt-2 italic text-sm text-gray-400">{member.team} Team</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section: Information about WasteShark */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">OUR MISSION</h1>
          <p className="text-lg text-gray-300">
            At WasteShark, our mission is to revolutionize waste management through innovative technology and sustainable practices. We aim to create a cleaner, greener future for our planet by providing efficient waste collection and recycling solutions.
          </p>

          <div className="space-y-6 mt-8">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Innovation Through Collaboration</h2>
              <p className="text-gray-300">
                Our diverse team of 15 dedicated engineers brings together expertise from various fields, including software development, electrical engineering, and mechanical design, to develop cutting-edge solutions that address the challenges of waste management. By combining our skills and knowledge, we foster a culture of innovation that drives us to create impactful technologies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Sustainability at Our Core</h2>
              <p className="text-gray-300">
                Sustainability is at the heart of everything we do. We are committed to reducing environmental impact through our products and operations. Our WasteShark robots are designed to efficiently collect and process waste, minimizing pollution and promoting recycling efforts in communities worldwide.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Customer-Centric Approach</h2>
              <p className="text-gray-300">
                At WasteShark, we prioritize our customers' needs and work closely with them to develop tailored solutions that meet their specific requirements. Our commitment to customer satisfaction drives us to continuously improve our products and services, ensuring that we deliver the best possible outcomes for our clients.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About