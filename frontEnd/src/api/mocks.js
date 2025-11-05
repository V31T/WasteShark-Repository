/**
 * Mock Robots for Testing
 * Used when user has no robots associated with their account
 * These robots are displayed in the dashboard for testing purposes
 */
export const mockRobots = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    robot_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'WasteShark-Test-Alpha',
    status: 'roaming', // Cleaning
    battery: 85,
    progress: 65,
    runtime: '01:25:15',
    location: 'Pool A'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    robot_id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'WasteShark-Test-Beta',
    status: 'stopping', // Stopped
    battery: 72,
    progress: 45,
    runtime: '00:45:30',
    location: 'Pool B'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    robot_id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'WasteShark-Test-Gamma',
    status: 'off', // Off
    battery: 45,
    progress: 0,
    runtime: '00:00:00',
    location: 'Pool C'
  }
]

/**
 * Available Mock Robot UUIDs for Testing
 * These are robots that exist in the database but are not assigned to any user
 * Users can add these robots to their account using the Add Robot form
 */
export const availableMockRobotIds = [
  {
    robotId: '550e8400-e29b-41d4-a716-446655440004',
    name: 'WasteShark Delta',
    location: 'Pool D',
    status: 'Available'
  },
  {
    robotId: '550e8400-e29b-41d4-a716-446655440005',
    name: 'WasteShark Epsilon',
    location: 'Pool E',
    status: 'Available'
  },
  {
    robotId: '550e8400-e29b-41d4-a716-446655440006',
    name: 'WasteShark Zeta',
    location: 'Pool F',
    status: 'Available'
  },
  {
    robotId: '550e8400-e29b-41d4-a716-446655440007',
    name: 'WasteShark Eta',
    location: 'Pool G',
    status: 'Available'
  },
  {
    robotId: '550e8400-e29b-41d4-a716-446655440008',
    name: 'WasteShark Theta',
    location: 'Pool H',
    status: 'Available'
  }
]

export const mockSystemStatus = {
  activeRobots: 1,
  totalRobots: 3,
  totalCleaned: 245,
  efficiency: 92
}
