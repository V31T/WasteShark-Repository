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
 * - teamMembers: Array of { name: string, role: string, team: string }
 * - teamColors: Object mapping team names to Tailwind gradient classes
 */

export const teamMembers = [
  // Frontend Team
  { name: "Henry Pham", role: "Frontend Lead", team: "Frontend" },
  { name: "Kardin Nguyen", role: "Frontend Team Member", team: "Frontend" },

  // Backend Team
  { name: "Rishabh Jinesh", role: "Project Director, Backend Lead", team: "Backend" },
  { name: "Colin Lou", role: "Backend Team Member", team: "Backend" },
  { name: "Tavishi Bansal", role: "Backend Team Member", team: "Backend" },

  // Machine Learning Team
  { name: "Tanuj Asthana", role: "Machine Learning Lead", team: "Machine Learning" },
  { name: "Aditya Lolla", role: "Machine Learning Team Member", team: "Machine Learning" },

  // Electrical Team
  { name: "Kaden Kaufman", role: "Electrical Lead", team: "Electrical" },
  { name: "Alta Wan", role: "Electrical Team Member", team: "Electrical" },
  { name: "Ayana Ahuja", role: "Electrical Team Member", team: "Electrical" },
  { name: "Kiwook Kim", role: "Electrical Team Member", team: "Electrical" },

  // Mechanical Team
  { name: "Dylan Lau", role: "Mechanical Lead", team: "Mechanical" },
  { name: "Alondra Sanchez", role: "Mechanical Team Member", team: "Mechanical" },
  { name: "Derek Trac", role: "Mechanical Team Member", team: "Mechanical" },
  { name: "Tarren Mai", role: "Mechanical Team Member", team: "Mechanical" },
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
