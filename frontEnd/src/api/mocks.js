export const mockRobots = [
  {
    id: '1',
    name: 'WasteShark-001',
    status: 'Idle',
    battery: 85,
    progress: 0,
    runtime: '00:00:00',
    location: 'Pool A'
  },
  {
    id: '2',
    name: 'WasteShark-002',
    status: 'Cleaning',
    battery: 72,
    progress: 65,
    runtime: '01:25:15',
    location: 'Pool B'
  },
  {
    id: '3',
    name: 'WasteShark-003',
    status: 'Offline',
    battery: 0,
    progress: 0,
    runtime: '00:00:00',
    location: 'Pool C'
  }
]

export const mockSystemStatus = {
  activeRobots: 1,
  totalRobots: 3,
  totalCleaned: 245,
  efficiency: 92
}
