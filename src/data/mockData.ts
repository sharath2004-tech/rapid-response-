import { Incident, IncidentType, SeverityLevel, Stats } from '@/types/incident';

// Mock data for development
export const mockStats: Stats = {
  activeIncidents: 12,
  resolvedToday: 8,
  avgResponseTime: '4.2 min',
  pendingVerification: 5,
  highPriorityCount: 3,
};

export const mockIncidents: Incident[] = [
  {
    _id: '1',
    title: 'Multi-vehicle Accident on Highway 101',
    description: 'Three cars involved in collision, blocking two lanes',
    type: 'accident',
    severity: 'critical',
    status: 'verified',
    location: {
      address: 'Highway 101, Exit 42B',
      lat: 37.7749,
      lng: -122.4194,
    },
    reportedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    reportedBy: 'user123',
    reportedByName: 'John Doe',
    verificationCount: 3,
    media: [],
    timeline: [
      { time: new Date().toISOString(), event: 'Incident reported', user: 'John Doe' },
    ],
  },
];

export const incidentTypes: { value: IncidentType; label: string; icon: string; description: string }[] = [
  { value: 'medical', label: 'Medical Emergency', icon: 'Heart', description: 'Health emergencies, injuries, medical assistance needed' },
  { value: 'accident', label: 'Accident', icon: 'Car', description: 'Traffic accidents, collisions, vehicle-related incidents' },
  { value: 'fire', label: 'Fire', icon: 'Flame', description: 'Fire outbreaks, smoke, burning hazards' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'Building', description: 'Building collapses, structural damage, utility failures' },
  { value: 'public-safety', label: 'Public Safety', icon: 'Shield', description: 'Security threats, suspicious activities, public disturbances' },
];

export const severityColors: Record<SeverityLevel, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
};

export const statusColors: Record<string, string> = {
  unverified: 'bg-gray-500 text-white',
  verified: 'bg-blue-500 text-white',
  'in-progress': 'bg-orange-500 text-white',
  resolved: 'bg-green-500 text-white',
};
