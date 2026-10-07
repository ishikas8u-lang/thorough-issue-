export type ReportStatus =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DUPLICATE'
  | 'REJECTED';

export type ReportCategory =
  | 'LIGHTING_ELECTRICAL'
  | 'BUILDING_FACILITY'
  | 'CLEANLINESS'
  | 'ACCESSIBILITY'
  | 'TRANSPORT_STOP'
  | 'OTHER';

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
  createdAt: string;
  updatedAt: string;
  auditTrail: ReportAuditEntry[];
}

export interface PublicReportView {
  referenceCode: string;
  category: ReportCategory;
  locationDescription: string;
  status: ReportStatus;
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

export interface Stop {
  id: string;
  name: string;
  sequence: number;
  campusLocation: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  operatingDays: string;
  timezone: string;
  lastUpdated: string;
  isDemo: boolean;
  stops: Stop[];
  scheduledDepartures: string[];
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
  LIGHTING_ELECTRICAL: 'Lighting & Electrical',
  BUILDING_FACILITY: 'Building & Plumbing',
  CLEANLINESS: 'Cleanliness & Sanitation',
  ACCESSIBILITY: 'Accessibility & Ramps',
  TRANSPORT_STOP: 'Transport Stop & Shelter',
  OTHER: 'Other Campus Fixture',
};

export const STATUS_LABELS: Record<ReportStatus, { label: string; tone: 'received' | 'review' | 'progress' | 'resolved' | 'duplicate' | 'rejected' }> = {
  RECEIVED: { label: 'Received', tone: 'received' },
  IN_REVIEW: { label: 'In Review', tone: 'review' },
  IN_PROGRESS: { label: 'In Progress', tone: 'progress' },
  RESOLVED: { label: 'Resolved', tone: 'resolved' },
  DUPLICATE: { label: 'Marked Duplicate', tone: 'duplicate' },
  REJECTED: { label: 'Unable to Action', tone: 'rejected' },
};

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  course: string;
  branch: string;
  updatedAt: string;
}

export interface StudentSession {
  token: string;
  student: StudentProfile;
  expiresAt: string;
}

