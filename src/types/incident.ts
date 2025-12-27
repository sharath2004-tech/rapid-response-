// Type definitions for incidents
export type IncidentType = 'medical' | 'accident' | 'fire' | 'infrastructure' | 'public-safety';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'unverified' | 'verified' | 'in-progress' | 'resolved';

export interface Incident {
  _id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reportedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  reportedBy: string;
  reportedByName?: string;
  verificationCount: number;
  verifiedBy?: string[];
  verifiedAt?: string;
  media: string[];
  timeline: {
    time: string;
    event: string;
    user?: string;
  }[];
  assignedTo?: string;
  notes?: string[];
}

export interface Stats {
  activeIncidents: number;
  resolvedToday: number;
  avgResponseTime: string;
  pendingVerification: number;
  highPriorityCount: number;
}

export const incidentTypes: { value: IncidentType; label: string; icon: string; description: string }[] = [
  { value: 'medical', label: 'Medical Emergency', icon: 'Heart', description: 'Health emergencies, injuries, medical assistance needed' },
  { value: 'accident', label: 'Accident', icon: 'Car', description: 'Traffic accidents, collisions, vehicle-related incidents' },
  { value: 'fire', label: 'Fire', icon: 'Flame', description: 'Fire outbreaks, smoke, burning hazards' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'Building', description: 'Road damage, power outages, structural issues' },
  { value: 'public-safety', label: 'Public Safety', icon: 'Shield', description: 'Crime, suspicious activity, public disturbances' },
];

export const severityColors: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
  high: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  medium: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
};

export const statusColors: Record<IncidentStatus, { bg: string; text: string; border: string }> = {
  unverified: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted-foreground/30' },
  verified: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
  'in-progress': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  resolved: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
};
