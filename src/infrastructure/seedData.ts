import type { SafetyContact, SafetyLocation, Route, ServiceNotice, Report } from '../types';

export const PRIMARY_EMERGENCY: SafetyContact = {
  id: 'emergency-primary',
  label: 'Campus Security 24/7 Control Room',
  phone: '+91-11-2659-1000',
  instructions: 'Official university emergency helpline. For immediate danger, medical trauma, violence, or active fire. Never use web forms for emergencies.',
  source: 'Office of Campus Safety & Security',
  verifiedAt: '2026-10-01T08:00:00Z',
  isDemo: true,
};

export const SEED_CONTACTS: SafetyContact[] = [
  PRIMARY_EMERGENCY,
  {
    id: 'health-centre',
    label: 'Campus Health Centre & Ambulance',
    phone: '+91-11-2659-1111',
    instructions: 'On-campus primary healthcare, urgent first-aid clinic, and dedicated ambulance service.',
    source: 'Chief Medical Officer',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
  {
    id: 'counseling-support',
    label: 'Student Wellness & Counseling Desk',
    phone: '+91-11-2659-1222',
    instructions: 'Confidential psychological support, crisis counseling, and student well-being assistance.',
    source: 'Dean of Student Affairs',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
  {
    id: 'women-safety',
    label: 'Internal Committee (IC) & Women Safety Helpline',
    phone: '+91-11-2659-1333',
    instructions: 'Confidential reporting and immediate safety escort assistance for female students and staff.',
    source: 'University Gender Advisory Cell',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
];

export const SEED_LOCATIONS: SafetyLocation[] = [
  {
    id: 'loc-gate1',
    name: 'Main Gate 24/7 Security Booth',
    kind: 'SECURITY_POST',
    campusLocation: 'Gate 1, North Avenue (Opposite Administration Building)',
    description: 'Staffed around the clock by uniformed security personnel. Equipped with automated defibrillator (AED) and direct hotline to local emergency services.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
  {
    id: 'loc-health',
    name: 'Central Health Centre & First Aid Clinic',
    kind: 'HEALTH_CLINIC',
    campusLocation: 'Medical Enclave, East Campus (Behind Faculty Housing)',
    description: 'Open 24 hours for emergency triage and trauma stabilization. Two campus ambulances stationed permanently at the ambulance bay.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
  {
    id: 'loc-library',
    name: 'Central Library Night Safe Haven',
    kind: 'SAFE_HAVEN',
    campusLocation: 'Central Library Foyer, Ground Floor',
    description: 'Well-lit monitored perimeter with security personnel on duty until 06:00 AM. Equipped with emergency help point intercom.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
  {
    id: 'loc-sports',
    name: 'Sports Complex Primary Assembly Point',
    kind: 'ASSEMBLY_POINT',
    campusLocation: 'Main Athletic Grounds, North Perimeter',
    description: 'Designated outdoor evacuation assembly zone for earthquake or structural emergencies affecting Academic Blocks 1-4.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: true,
  },
];

export const SEED_ROUTES: Route[] = [
  {
    id: 'route-north-loop',
    name: 'North Campus Loop Shuttle',
    description: 'Connects main hostel residential blocks with the core academic complex and central library.',
    operatingDays: 'Monday to Saturday (Term Time)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-01',
    isDemo: true,
    stops: [
      { id: 'nl-s1', name: 'Main Academic Complex Gate', sequence: 1, campusLocation: 'Front Porch, Senate Building' },
      { id: 'nl-s2', name: 'Science & Engineering Library', sequence: 2, campusLocation: 'Library North Foyer' },
      { id: 'nl-s3', name: 'Sports Pavilion & Gymnasium', sequence: 3, campusLocation: 'Opposite Indoor Badminton Arena' },
      { id: 'nl-s4', name: 'Hostel Quadrangle (Hostels 1-5)', sequence: 4, campusLocation: 'Hostel Common Dining Facility' },
      { id: 'nl-s5', name: 'Dining Hall & Student Activity Centre', sequence: 5, campusLocation: 'SAC Roundabout' },
    ],
    scheduledDepartures: [
      '07:45 AM', '08:15 AM', '08:45 AM', '09:15 AM', '09:45 AM',
      '10:30 AM', '11:15 AM', '12:00 PM', '12:45 PM', '01:30 PM',
      '02:15 PM', '03:00 PM', '03:45 PM', '04:30 PM', '05:15 PM',
      '06:00 PM', '06:45 PM', '07:30 PM', '08:15 PM', '09:00 PM'
    ],
  },
  {
    id: 'route-metro-express',
    name: 'Metro Station Direct Express',
    description: 'Direct shuttle connecting Campus Main Gate with the City Metro Interchange Station.',
    operatingDays: 'All 7 Days (Including Holidays)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-01',
    isDemo: true,
    stops: [
      { id: 'me-s1', name: 'Main Campus Gate 1 Bus Bay', sequence: 1, campusLocation: 'Near Security Checkpost 1' },
      { id: 'me-s2', name: 'South Campus Residential Colony', sequence: 2, campusLocation: 'Gate 4 Junction' },
      { id: 'me-s3', name: 'City Metro Station (Gate 2 Dropoff)', sequence: 3, campusLocation: 'Civil Lines Metro Underpass' },
    ],
    scheduledDepartures: [
      '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM',
      '09:30 AM', '10:00 AM', '01:00 PM', '04:30 PM', '05:00 PM',
      '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
      '08:00 PM', '08:30 PM', '09:30 PM', '10:15 PM'
    ],
  },
  {
    id: 'route-night-transit',
    name: 'Late-Night Campus Perimeter Escort Shuttle',
    description: 'Safe late-night perimeter loop shuttle providing dedicated escorted transit for students studying late.',
    operatingDays: 'Daily (21:30 to 02:00)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-01',
    isDemo: true,
    stops: [
      { id: 'nt-s1', name: 'Central Library Foyer (Night Stand)', sequence: 1, campusLocation: 'Library Main Porch' },
      { id: 'nt-s2', name: 'Computer Centre 24-hr Lab', sequence: 2, campusLocation: 'Building C Entry' },
      { id: 'nt-s3', name: 'Girls Hostels Complex (Hostels 7-9)', sequence: 3, campusLocation: 'Security Gate A' },
      { id: 'nt-s4', name: 'Boys Hostels Complex (Hostels 2-4)', sequence: 4, campusLocation: 'Main Chowk' },
    ],
    scheduledDepartures: [
      '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
      '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM'
    ],
  },
];

export const SEED_NOTICES: ServiceNotice[] = [
  {
    id: 'notice-resurfacing',
    title: 'Temporary Stop Relocation: North Loop Shuttle',
    body: 'Due to road resurfacing near the Sports Pavilion, Stop #3 is temporarily relocated 150m west to the Tennis Courts gate until Friday evening.',
    startsAt: '2026-10-05T00:00:00Z',
    endsAt: '2026-10-12T23:59:59Z',
    routeIds: ['route-north-loop'],
    isDemo: true,
  },
  {
    id: 'notice-exam-transit',
    title: 'Mid-Semester Exam Additional Departures',
    body: 'Additional shuttle departures have been scheduled during the 08:30-09:30 AM and 01:00-02:00 PM exam rush windows.',
    startsAt: '2026-10-06T00:00:00Z',
    endsAt: '2026-10-15T23:59:59Z',
    routeIds: ['route-north-loop', 'route-metro-express'],
    isDemo: true,
  },
];

export const SEED_REPORTS: Report[] = [
  {
    id: 'rep-001',
    referenceCode: 'CA-4912-K7',
    category: 'LIGHTING_ELECTRICAL',
    locationDescription: 'Corridor between Academic Block 2 and Central Library, near Stairwell B',
    issueDescription: 'Two overhead fluorescent fixtures are completely dark at night, leaving a 20-meter stretch of the pedestrian pathway without adequate illumination.',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-07T08:15:00Z',
    updatedAt: '2026-10-07T09:45:00Z',
    auditTrail: [
      {
        id: 'aud-001-1',
        reportId: 'rep-001',
        previousStatus: 'RECEIVED',
        newStatus: 'IN_REVIEW',
        publicMessage: 'Report assigned to Estate Facilities Electrical Department for priority inspection.',
        internalNote: 'Electrical work order #E-841 assigned to technician Rajesh.',
        actorId: 'staff_vansh',
        createdAt: '2026-10-07T08:45:00Z',
      },
      {
        id: 'aud-001-2',
        reportId: 'rep-001',
        previousStatus: 'IN_REVIEW',
        newStatus: 'IN_PROGRESS',
        publicMessage: 'Electrician dispatched with replacement LED ballast and fixtures. Installation underway.',
        internalNote: 'Parts checked out from inventory; expected completion by 02:00 PM.',
        actorId: 'staff_vansh',
        createdAt: '2026-10-07T09:45:00Z',
      },
    ],
  },
  {
    id: 'rep-002',
    referenceCode: 'CA-8193-M2',
    category: 'BUILDING_FACILITY',
    locationDescription: 'Science Block 1, Ground Floor Male Restroom near Lecture Hall 101',
    issueDescription: 'Continuous water leakage from the primary sink supply line valve causing pooling water on the tiles and slip risk.',
    status: 'RECEIVED',
    createdAt: '2026-10-07T11:20:00Z',
    updatedAt: '2026-10-07T11:20:00Z',
    auditTrail: [
      {
        id: 'aud-002-1',
        reportId: 'rep-002',
        previousStatus: 'RECEIVED',
        newStatus: 'RECEIVED',
        publicMessage: 'Ticket registered in campus facilities queue.',
        internalNote: 'New automated ticket ingestion.',
        actorId: 'system',
        createdAt: '2026-10-07T11:20:00Z',
      },
    ],
  },
  {
    id: 'rep-003',
    referenceCode: 'CA-3012-P9',
    category: 'ACCESSIBILITY',
    locationDescription: 'Main Administration Building, North Entry Access Ramp',
    issueDescription: 'Handrail bolt has loosened and the anti-slip tactile strip at the base of the ramp is peeling, presenting an obstacle for wheelchair users.',
    status: 'RESOLVED',
    createdAt: '2026-10-06T14:10:00Z',
    updatedAt: '2026-10-07T07:30:00Z',
    auditTrail: [
      {
        id: 'aud-003-1',
        reportId: 'rep-003',
        previousStatus: 'RECEIVED',
        newStatus: 'IN_PROGRESS',
        publicMessage: 'Maintenance team dispatched to refit handrail anchors and replace adhesive tactile strips.',
        internalNote: 'Carpentry and safety work order #A-102.',
        actorId: 'staff_krisha',
        createdAt: '2026-10-06T15:30:00Z',
      },
      {
        id: 'aud-003-2',
        reportId: 'rep-003',
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        publicMessage: 'Ramp handrail re-anchored securely with industrial hardware and new rubber tactile surface installed. Inspected and verified safe.',
        internalNote: 'Work inspected by Campus Accessibility Officer.',
        actorId: 'staff_krisha',
        createdAt: '2026-10-07T07:30:00Z',
      },
    ],
  },
];
