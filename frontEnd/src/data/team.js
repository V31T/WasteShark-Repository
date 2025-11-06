/**
 * Team Data - WasteShark Team Members and Team Colors
 * 
 * This file contains:
 * - teamMembers: Array of team member objects with name, role, and team
 * - teamColors: Gradient color mappings for each team
 * 
 * USAGE:
 * - Used in About.jsx to display team members organized by team
 * - Team colors are used for gradient backgrounds and hover effects
 * 
 * DATA STRUCTURE:
 * - teamMembers: Array of { name: string, role: string, team: string, photo: string }
 * - teamColors: Object mapping team names to Tailwind gradient classes
 */

// Import headshot images
import rishabhImg from '../assets/rishabh.jpg'
import colinImg from '../assets/colin.jpg'
import tavishiImg from '../assets/tavishi.jpg'
import henryImg from '../assets/henry.jpg'
import kardinImg from '../assets/kardin.jpg'
import tanujImg from '../assets/tanuj.jpg'
import adityaImg from '../assets/aditya.jpg'
import kadenImg from '../assets/kaden.jpg'
import altaImg from '../assets/alta.jpg'
import ayanaImg from '../assets/ayana.jpg'
import kiwookImg from '../assets/kiwook.jpg'
import alondraImg from '../assets/alondra.jpg'
import dylanImg from '../assets/dylan.jpg'
import derekImg from '../assets/derek.jpg'
import tarrenImg from '../assets/tarren.jpg'

export const teamMembers = [
  // Backend Team
  { name: "Rishabh Jinesh", role: "Project Director, Backend Lead", team: "Backend", photo: rishabhImg },
  { name: "Colin Lou", role: "Backend Team Member", team: "Backend", photo: colinImg },
  { name: "Tavishi Bansal", role: "Backend Team Member", team: "Backend", photo: tavishiImg },

  // Frontend Team
  { name: "Henry Pham", role: "Frontend Lead", team: "Frontend", photo: henryImg },
  { name: "Kardin Nguyen", role: "Frontend Team Member", team: "Frontend", photo: kardinImg },

  // Machine Learning Team
  { name: "Tanuj Asthana", role: "Machine Learning Lead", team: "Machine Learning", photo: tanujImg },
  { name: "Aditya Lolla", role: "Machine Learning Team Member", team: "Machine Learning", photo: adityaImg },

  // Electrical Team
  { name: "Kaden Kaufman", role: "Electrical Lead", team: "Electrical", photo: kadenImg },
  { name: "Alta Wan", role: "Electrical Team Member", team: "Electrical", photo: altaImg },
  { name: "Ayana Ahuja", role: "Electrical Team Member", team: "Electrical", photo: ayanaImg },
  { name: "Kiwook Kim", role: "Electrical Team Member", team: "Electrical", photo: kiwookImg },

  // Mechanical Team
  { name: "Dylan Lau", role: "Mechanical Lead", team: "Mechanical", photo: dylanImg },
  { name: "Alondra Sanchez", role: "Mechanical Team Member", team: "Mechanical", photo: alondraImg },
  { name: "Derek Trac", role: "Mechanical Team Member", team: "Mechanical", photo: derekImg },
  { name: "Tarren Mai", role: "Mechanical Team Member", team: "Mechanical", photo: tarrenImg },
]

/**
 * Team Colors - Gradient color mappings for each team
 * Used for team headers, hover effects, and visual identification
 * Format: Tailwind CSS gradient classes (from-{color} via-{color} to-{color})
 */
export const teamColors = {
  Backend: "from-emerald-400 via-teal-500 to-cyan-600",
  Frontend: "from-pink-400 via-rose-500 to-orange-500",
  "Machine Learning": "from-amber-400 via-lime-500 to-emerald-500",
  Electrical: "from-violet-400 via-fuchsia-500 to-red-500",
  Mechanical: "from-sky-400 via-indigo-500 to-blue-500",
}
