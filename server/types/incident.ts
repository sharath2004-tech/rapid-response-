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
  reportedAt: string;
  updatedAt: string;
  reportedBy: string;
  reportedByName: string;
  verificationCount: number;
  media: string[];
  timeline: {
    time: string;
    event: string;
    user?: string;
  }[];
  assignedTo?: string;
  notes?: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
