export type ReportStatus =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'DUPLICATE'
  | 'REJECTED';

export type ReportCategory =
  | 'STREET_LIGHT'
  | 'ELECTRICITY'
  | 'WATER'
  | 'CLEANLINESS'
  | 'FURNITURE'
  | 'OTHER'
  | 'LIGHTING_ELECTRICAL'
  | 'BUILDING_FACILITY'
  | 'ACCESSIBILITY'
  | 'TRANSPORT_STOP';

export interface PublicUpdateEntry {
  status: ReportStatus;
  message: string;
  timestamp: string;
}

export interface ReportAuditEntry {
  id: string;
  reportId: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  publicMessage?: string;
  internalNote?: string;
  actorId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  referenceCode: string;
  category: ReportCategory;
  locationDescription: string;
  issueDescription: string;
  status: ReportStatus;
  photoAvailable?: boolean;
  adminReply?: string;
  escalatedTo?: string;
  escalationNote?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: ReportAuditEntry[];
}

export interface PublicReportView {
  referenceCode: string;
  category: ReportCategory;
  locationDescription: string;
  status: ReportStatus;
  adminReply?: string;
  escalatedTo?: string;
  createdAt: string;
  updates: PublicUpdateEntry[];
}

export interface SafetyContact {
  id: string;
  label: string;
  phone: string;
  instructions: string;
  source: string;
  verifiedAt: string;
  isDemo: boolean;
}

export interface SafetyLocation {
  id: string;
  name: string;
  kind: 'SECURITY_POST' | 'HEALTH_CLINIC' | 'SAFE_HAVEN' | 'ASSEMBLY_POINT';
  campusLocation: string;
  description: string;
  verifiedAt: string;
  isDemo: boolean;
}

export interface SosAlert {
  id: string;
  userId?: string | null;
  lat: number;
  lng: number;
  accuracy?: number | null;
  message?: string | null;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface Stop {
  id: string;
  name: string;
  sequence: number;
  campusLocation: string;
  morningTime?: string;
  eveningTime?: string;
}

export interface RouteTimelineStop {
  stopName: string;
  time: string;
  location?: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  operatingDays: string;
  timezone: string;
  lastUpdated: string;
  isDemo: boolean;
  driverName?: string;
  driverPhone?: string;
  busNumber?: string;
  timings?: string;
  stops: Stop[];
  scheduledDepartures: string[];
  morningSchedule?: RouteTimelineStop[];
  eveningSchedule?: RouteTimelineStop[];
}

export interface ServiceNotice {
  id: string;
  title: string;
  body: string;
  startsAt: string;
  endsAt: string;
  routeIds: string[];
  isDemo: boolean;
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  STREET_LIGHT: 'Street Light',
  ELECTRICITY: 'Electricity',
  WATER: 'Water Supply & Plumbing',
  CLEANLINESS: 'Cleanliness & Sanitation',
  FURNITURE: 'Furniture & Desks',
  OTHER: 'Other Campus Fixture',
  LIGHTING_ELECTRICAL: 'Lighting & Electrical',
  BUILDING_FACILITY: 'Building & Plumbing',
  ACCESSIBILITY: 'Accessibility & Ramps',
  TRANSPORT_STOP: 'Transport Stop & Shelter',
};

export const STATUS_LABELS: Record<ReportStatus, { label: string; tone: 'received' | 'review' | 'progress' | 'resolved' | 'duplicate' | 'rejected' }> = {
  RECEIVED: { label: 'Received', tone: 'received' },
  IN_REVIEW: { label: 'In Review', tone: 'review' },
  IN_PROGRESS: { label: 'In Progress', tone: 'progress' },
  ESCALATED: { label: 'Escalated', tone: 'review' },
  RESOLVED: { label: 'Resolved', tone: 'resolved' },
  DUPLICATE: { label: 'Marked Duplicate', tone: 'duplicate' },
  REJECTED: { label: 'Unable to Action', tone: 'rejected' },
};

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  registrationNumber?: string;
  department?: string;
  year?: string;
  contactNumber?: string;
  phone?: string;
  course?: string;
  branch?: string;
  hostelType?: 'hostel' | 'dayscholar' | string;
  busRouteId?: string;
  employeeId?: string;
  office?: string;
  role?: 'student' | 'staff' | 'admin';
  updatedAt?: string;
}

export interface StudentSession {
  token: string;
  student: StudentProfile;
  expiresAt: string;
}
