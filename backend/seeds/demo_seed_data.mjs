/**
 * ==============================================================================
 * FICTIONAL DEMO SEED DATA
 * DISCLAIMER: This data is strictly synthetic and provided solely for software
 * testing, evaluation, and grading. It does NOT represent real students, official
 * SRM University personnel, or emergency services dispatchers.
 * ==============================================================================
 */

export const FICTIONAL_DISCLAIMER =
  'NOTICE: This is synthetic demonstration data. Not verified institutional information.';

export const DEMO_STUDENT = {
  id: 'stu-demo-fictional-01',
  fullName: 'Demo Student (Sample Evaluation Account)',
  email: 'ananya.s@srmist.edu.in',
  contactNumber: '+91 99999 00001',
  course: 'B.Tech (Sample Course)',
  branch: 'Computer Science (Sample Branch)',
  passwordPlain: 'Student@123',
};

export const DEMO_SAFETY_CONTACTS = [
  {
    id: 'safe-demo-sec',
    label: '[DEMO ONLY] Campus Security 24/7 Desk',
    phone: '+91-11-2659-1000',
    instructions:
      'FICTIONAL DEMO CONTACT: Call for emergency mock evaluation. Campus Assist is not an emergency dispatch system.',
    source: 'Demo Fixture Generator (Vansh)',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 1,
  },
  {
    id: 'safe-demo-clinic',
    label: '[DEMO ONLY] Campus Medical First Aid Room',
    phone: '+91-11-2659-1111',
    instructions:
      'FICTIONAL DEMO CONTACT: Simulated health centre helpline for triage scenario demonstration.',
    source: 'Demo Fixture Generator (Vansh)',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 1,
  },
];

export const DEMO_SAFETY_LOCATIONS = [
  {
    id: 'loc-demo-01',
    name: '[DEMO ONLY] Gate 1 Security Checkpost',
    kind: 'SECURITY_POST',
    campusLocation: 'Sample Location: Gate No. 1, North Avenue',
    description:
      'FICTIONAL DEMO LOCATION: Sample emergency booth equipped with automated external defibrillator.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 1,
  },
  {
    id: 'loc-demo-02',
    name: '[DEMO ONLY] Central Quadrangle Assembly Ground',
    kind: 'ASSEMBLY_POINT',
    campusLocation: 'Sample Location: Between Academic Block B and Library',
    description:
      'FICTIONAL DEMO LOCATION: Primary evacuation safe zone away from overhead utilities.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 1,
  },
];

export const DEMO_TRANSIT_ROUTES = [
  {
    id: 'route-delhi-sonipat-demo',
    name: '[DEMO ONLY] Delhi NCR ⇄ Sonipat Campus Corridor',
    description:
      'FICTIONAL DEMO TIMETABLE: Scheduled shuttle service connecting Rohini, Burari, Manglapuri, Panipat, and Rohtak (Operating 7:30 AM – 7:00 PM IST).',
    operatingDays: 'Monday – Saturday',
    timezone: 'Asia/Kolkata',
    lastUpdated: '2026-10-07T00:00:00Z',
    isDemo: 1,
    scheduledDepartures: [
      '07:30 AM',
      '08:15 AM',
      '09:30 AM',
      '11:00 AM',
      '01:30 PM',
      '03:45 PM',
      '05:15 PM',
      '07:00 PM',
    ],
    stops: [
      { id: 'stop-01', name: 'Rohini Sector 18 Metro', sequence: 1, campusLocation: 'Delhi North Gate Stop' },
      { id: 'stop-02', name: 'Burari Crossing Point', sequence: 2, campusLocation: 'Outer Ring Road Terminal' },
      { id: 'stop-03', name: 'Manglapuri Transit Junction', sequence: 3, campusLocation: 'Bus Shelter Point' },
      { id: 'stop-04', name: 'Panipat GT Road Hub', sequence: 4, campusLocation: 'Highway Interchange Stop' },
      { id: 'stop-05', name: 'Rohtak Bypass Station', sequence: 5, campusLocation: 'West Corridor Depot' },
      { id: 'stop-06', name: 'Sonipat Main University Gate', sequence: 6, campusLocation: 'Campus Terminal A' },
    ],
  },
];

export const DEMO_REPORTS = [
  {
    id: 'rep-demo-001',
    referenceCode: 'CA-4912-K7',
    category: 'LIGHTING_ELECTRICAL',
    locationDescription: 'Sample Landmark: Pathway outside Library East Entrance',
    issueDescription: 'Overhead path luminaire lamp is flickering and dark after sunset.',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-06T08:30:00Z',
    updatedAt: '2026-10-06T10:15:00Z',
    auditTrail: [
      {
        id: 'aud-demo-01',
        previousStatus: 'RECEIVED',
        newStatus: 'IN_REVIEW',
        publicMessage: 'Report acknowledged by electrical maintenance dispatch.',
        internalNote: 'Assigned to work order #E-101 (Contractor: Verma Electricals).',
        actorId: 'staff_vansh',
        createdAt: '2026-10-06T09:00:00Z',
      },
      {
        id: 'aud-demo-02',
        previousStatus: 'IN_REVIEW',
        newStatus: 'IN_PROGRESS',
        publicMessage: 'Maintenance team on site with replacement LED bulb and driver.',
        internalNote: 'Bucket truck dispatched to site.',
        actorId: 'staff_vansh',
        createdAt: '2026-10-06T10:15:00Z',
      },
    ],
  },
  {
    id: 'rep-demo-002',
    referenceCode: 'CA-8821-X4',
    category: 'ACCESSIBILITY',
    locationDescription: 'Sample Landmark: Administration Building North Ramp',
    issueDescription: 'Handrail bolt loose near the bottom step of wheelchair access ramp.',
    status: 'RECEIVED',
    createdAt: '2026-10-07T07:10:00Z',
    updatedAt: '2026-10-07T07:10:00Z',
    auditTrail: [],
  },
];
