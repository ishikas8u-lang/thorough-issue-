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
    id: 'route-rohini-burari-sonipat',
    name: 'Delhi North: Rohini & Burari ⇄ Sonipat Campus',
    description: 'Key North Delhi commuter route connecting Rohini, Burari, and Mukarba Chowk with Sonipat Campus along the Outer Ring Road and NH-44.',
    operatingDays: 'Monday to Saturday (7:30 AM – 7:00 PM)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-07',
    isDemo: true,
    stops: [
      { id: 'rb-s1', name: 'Rohini Sector 18 Metro Station (East Gate)', sequence: 1, campusLocation: 'Near Metro Pillar #142' },
      { id: 'rb-s2', name: 'Burari Crossing Bus Stand', sequence: 2, campusLocation: 'Outer Ring Road Flyover Bay' },
      { id: 'rb-s3', name: 'Mukarba Chowk Transport Interchange', sequence: 3, campusLocation: 'GT Karnal Road Stoppage' },
      { id: 'rb-s4', name: 'Alipur Main Highway Shelter', sequence: 4, campusLocation: 'Opposite Alipur Police Post' },
      { id: 'rb-s5', name: 'Kundli Border / KMP Expressway Junction', sequence: 5, campusLocation: 'Toll Plaza Commuter Point' },
      { id: 'rb-s6', name: 'Sonipat Campus Main Terminal', sequence: 6, campusLocation: 'Academic Quadrangle Bus Bay' },
    ],
    scheduledDepartures: [
      '07:30 AM', '08:15 AM', '09:00 AM', '10:30 AM', '12:00 PM',
      '01:30 PM', '03:00 PM', '04:30 PM', '05:45 PM', '07:00 PM'
    ],
  },
  {
    id: 'route-manglapuri-sonipat',
    name: 'Delhi West: Manglapuri ⇄ Sonipat Campus',
    description: 'Serves South-West and West Delhi commuters traveling between Manglapuri, Janakpuri, Punjabi Bagh, and Sonipat Campus.',
    operatingDays: 'Monday to Saturday (7:30 AM – 7:00 PM)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-07',
    isDemo: true,
    stops: [
      { id: 'mp-s1', name: 'Manglapuri Bus Terminal (Dwarka Mor / Janakpuri)', sequence: 1, campusLocation: 'Terminal Bay 3' },
      { id: 'mp-s2', name: 'Janakpuri District Centre Crossing', sequence: 2, campusLocation: 'Near Metro Gate 2' },
      { id: 'mp-s3', name: 'Punjabi Bagh Club Road Junction', sequence: 3, campusLocation: 'Rohtak Road Underpass Bay' },
      { id: 'mp-s4', name: 'Azadpur Metro Interchange', sequence: 4, campusLocation: 'Ring Road Bus Stand' },
      { id: 'mp-s5', name: 'Sonipat Campus Main Terminal', sequence: 5, campusLocation: 'Academic Quadrangle Bus Bay' },
    ],
    scheduledDepartures: [
      '07:30 AM', '08:30 AM', '09:45 AM', '11:15 AM', '01:00 PM',
      '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'
    ],
  },
  {
    id: 'route-panipat-sonipat',
    name: 'GT Road North: Panipat ⇄ Sonipat Campus',
    description: 'Intercity corridor route connecting Panipat city, Samalkha, and Ganaur with Sonipat Campus along Grand Trunk Road (NH-44).',
    operatingDays: 'Daily (7:30 AM – 7:00 PM)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-07',
    isDemo: true,
    stops: [
      { id: 'pp-s1', name: 'Panipat Toll Plaza / Skylark Hub', sequence: 1, campusLocation: 'Main Highway Porch' },
      { id: 'pp-s2', name: 'Samalkha Highway Bus Shelter', sequence: 2, campusLocation: 'Railway Crossing Junction' },
      { id: 'pp-s3', name: 'Ganaur Bus Stand Stoppage', sequence: 3, campusLocation: 'GT Road Service Lane' },
      { id: 'pp-s4', name: 'Murthal University Chowk', sequence: 4, campusLocation: 'Opposite Highway Dhaba Hub' },
      { id: 'pp-s5', name: 'Sonipat Campus North Gate', sequence: 5, campusLocation: 'Gate 2 Transit Pavilion' },
    ],
    scheduledDepartures: [
      '07:30 AM', '08:45 AM', '10:00 AM', '11:30 AM', '01:15 PM',
      '03:15 PM', '05:00 PM', '06:15 PM', '07:00 PM'
    ],
  },
  {
    id: 'route-rohtak-sonipat',
    name: 'Haryana West: Rohtak (Rautak) ⇄ Sonipat Campus',
    description: 'Western corridor connecting Rohtak New Bus Stand, PGIMS Medical Hub, and Kharkhoda Bypass with Sonipat Campus.',
    operatingDays: 'Monday to Saturday (7:30 AM – 7:00 PM)',
    timezone: 'Asia/Kolkata (IST)',
    lastUpdated: '2026-10-07',
    isDemo: true,
    stops: [
      { id: 'rt-s1', name: 'Rohtak New Bus Stand (Rautak Terminal)', sequence: 1, campusLocation: 'Intercity Platform #6' },
      { id: 'rt-s2', name: 'Rohtak PGIMS Medical Chowk', sequence: 2, campusLocation: 'Hospital Main Gate Porch' },
      { id: 'rt-s3', name: 'Kharkhoda Bypass Stoppage', sequence: 3, campusLocation: 'State Highway 18 Crossing' },
      { id: 'rt-s4', name: 'Sonipat Subhash Chowk', sequence: 4, campusLocation: 'Old DC Office Circle' },
      { id: 'rt-s5', name: 'Sonipat Campus Main Gate', sequence: 5, campusLocation: 'Gate 1 Reception Bay' },
    ],
    scheduledDepartures: [
      '07:30 AM', '08:30 AM', '10:15 AM', '12:00 PM', '01:45 PM',
      '03:30 PM', '05:15 PM', '07:00 PM'
    ],
  },
];

export const SEED_NOTICES: ServiceNotice[] = [
  {
    id: 'notice-rohini-burari',
    title: 'Rohini & Burari Route: NH-44 Peak Stoppage Notice',
    body: 'Morning 07:30 AM and 08:15 AM buses from Rohini and Burari follow the elevated expressway bypass to minimize Kundli toll congestion.',
    startsAt: '2026-10-05T00:00:00Z',
    endsAt: '2026-10-15T23:59:59Z',
    routeIds: ['route-rohini-burari-sonipat'],
    isDemo: true,
  },
  {
    id: 'notice-panipat-rohtak',
    title: 'Panipat & Rohtak Corridor: Scheduled Timetable Active',
    body: 'Daily scheduled departures run from 07:30 AM until 07:00 PM. Please be present at designated highway shelters 5 minutes prior to scheduled departure.',
    startsAt: '2026-10-06T00:00:00Z',
    endsAt: '2026-10-20T23:59:59Z',
    routeIds: ['route-panipat-sonipat', 'route-rohtak-sonipat'],
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
