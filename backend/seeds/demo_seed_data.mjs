/**
 * ==============================================================================
 * CAMPUS ASSIST INITIAL SEED DATA
 * SRM University Delhi-NCR (Sonipat) Campus
 * ==============================================================================
 */

export const DEMO_STUDENT = {
  id: 'stu-demo-fictional-01',
  fullName: 'Demo Student',
  registrationNumber: 'RA2411003010001',
  email: 'demo.student@srmuniversity.ac.in',
  contactNumber: '+91 98765 43210',
  phone: '+91 98765 43210',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  hostelType: 'Hostel',
  busRouteId: 'route-delhi-sonipat-demo',
  course: 'B.Tech Computer Science & Engineering',
  branch: 'AI & Data Science',
  role: 'student',
  passwordPlain: 'Student@123',
};

export const DEMO_ADMIN = {
  id: 'staff-demo-fictional-01',
  fullName: 'Demo Admin',
  employeeId: 'EMP-SRM-2026',
  office: 'Campus Operations',
  email: 'demo.admin@srmuniversity.ac.in',
  contactNumber: '+91 98765 43200',
  phone: '+91 98765 43200',
  department: 'Campus Administration & Operations',
  course: 'Operations & Facilities Directorate',
  branch: 'Admin Block Reviewer',
  role: 'admin',
  passwordPlain: 'Staff@Reviewer2026',
};

export const DEMO_SAFETY_CONTACTS = [
  {
    id: 'safe-demo-sec',
    label: 'Campus Security 24/7 Desk',
    phone: '+91-11-2659-1000',
    instructions: 'Campus security central control desk. Available 24/7 for urgent campus assistance.',
    source: 'SRM Campus Security Control',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 0,
  },
  {
    id: 'safe-demo-clinic',
    label: 'Campus Medical First Aid Room',
    phone: '+91-11-2659-1111',
    instructions: 'University health centre emergency helpline and first aid dispensary.',
    source: 'SRM Health Services',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 0,
  },
];

export const DEMO_SAFETY_LOCATIONS = [
  {
    id: 'loc-demo-01',
    name: 'Gate 1 Security Checkpost',
    kind: 'SECURITY_POST',
    campusLocation: 'Gate No. 1, North Avenue',
    description: 'Emergency response booth equipped with automated external defibrillator.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 0,
  },
  {
    id: 'loc-demo-02',
    name: 'Central Quadrangle Assembly Ground',
    kind: 'ASSEMBLY_POINT',
    campusLocation: 'Between Academic Block B and Library',
    description: 'Primary evacuation safe assembly zone away from overhead utilities.',
    verifiedAt: '2026-10-01T08:00:00Z',
    isDemo: 0,
  },
];

export const DEMO_TRANSIT_ROUTES = [
  {
    id: 'route-delhi-sonipat-demo',
    name: 'Delhi NCR ⇄ Sonipat Campus Corridor',
    description: 'Scheduled shuttle service connecting Rohini, Burari, Alipur, and Kundli with Sonipat Campus (Twice Daily: Morning arrival by 9:00 AM, Evening departure at 4:30 PM IST).',
    operatingDays: 'Monday – Saturday',
    timezone: 'IST',
    lastUpdated: '2026-10-09T00:00:00Z',
    isDemo: 0,
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    busNumber: 'DL 1P B-4029',
    scheduledDepartures: [
      '07:30 AM',
      '04:30 PM',
    ],
    stops: [
      { id: 'stop-01', name: 'Rohini Sector 18 Metro', sequence: 1, campusLocation: 'Delhi North Gate Stop' },
      { id: 'stop-02', name: 'Burari Crossing Point', sequence: 2, campusLocation: 'Outer Ring Road Terminal' },
      { id: 'stop-03', name: 'Mukarba Chowk Interchange', sequence: 3, campusLocation: 'GT Karnal Road Junction' },
      { id: 'stop-04', name: 'Alipur Highway Shelter', sequence: 4, campusLocation: 'NH-44 Corridor Bus Bay' },
      { id: 'stop-05', name: 'Kundli Border Crossing', sequence: 5, campusLocation: 'Haryana Border Depot' },
      { id: 'stop-06', name: 'Sonipat Main University Gate', sequence: 6, campusLocation: 'Campus Terminal A' },
    ],
  },
  {
    id: 'route-rohini-burari-sonipat',
    name: 'Route 1: Rohini & Burari ⇄ Sonipat Campus',
    description: 'Direct North Delhi corridor connecting Rohini Metro Sector 18, Burari Crossing, Mukarba Chowk, and Alipur with Sonipat Campus.',
    operatingDays: 'Monday – Saturday',
    timezone: 'IST',
    lastUpdated: '2026-10-09T00:00:00Z',
    isDemo: 0,
    driverName: 'Rajender Kumar',
    driverPhone: '+91 98112 04812',
    busNumber: 'HR 10 SRM 4091',
    scheduledDepartures: [
      '07:30 AM',
      '04:30 PM',
    ],
    stops: [
      { id: 'rb-s1', name: 'Rohini Sector 18 Metro (East Gate)', sequence: 1, campusLocation: 'Metro Pillar #24 Bay' },
      { id: 'rb-s2', name: 'Burari Crossing Bus Stand', sequence: 2, campusLocation: 'Outer Ring Road Highway Shelter' },
      { id: 'rb-s3', name: 'Mukarba Chowk Transport Interchange', sequence: 3, campusLocation: 'GT Karnal Flyover Bay' },
      { id: 'rb-s4', name: 'Alipur Main Highway Shelter', sequence: 4, campusLocation: 'NH-44 Pedestrian Overbridge' },
      { id: 'rb-s5', name: 'Kundli Border / KMP Junction', sequence: 5, campusLocation: 'Haryana Border Transit Bay' },
      { id: 'rb-s6', name: 'Sonipat Campus Main Terminal', sequence: 6, campusLocation: 'Academic Quadrangle Bus Bay' },
    ],
  },
  {
    id: 'route-manglapuri-sonipat',
    name: 'Route 2: Manglapuri & West Delhi ⇄ Sonipat Campus',
    description: 'Western Delhi line starting at Manglapuri Terminal, traversing Janakpuri, Punjabi Bagh Club Road, and Azadpur Metro to Sonipat Campus.',
    operatingDays: 'Monday – Saturday',
    timezone: 'IST',
    lastUpdated: '2026-10-09T00:00:00Z',
    isDemo: 0,
    driverName: 'Surender Singh',
    driverPhone: '+91 98112 04815',
    busNumber: 'HR 10 SRM 1022',
    scheduledDepartures: [
      '07:15 AM',
      '04:30 PM',
    ],
    stops: [
      { id: 'mp-s1', name: 'Manglapuri Bus Terminal', sequence: 1, campusLocation: 'Terminal Bay 3' },
      { id: 'mp-s2', name: 'Janakpuri District Centre Crossing', sequence: 2, campusLocation: 'Near Metro Gate 2' },
      { id: 'mp-s3', name: 'Punjabi Bagh Club Road Junction', sequence: 3, campusLocation: 'Rohtak Road Underpass Bay' },
      { id: 'mp-s4', name: 'Azadpur Metro Interchange', sequence: 4, campusLocation: 'Ring Road Bus Stand' },
      { id: 'mp-s5', name: 'Sonipat Campus Main Terminal', sequence: 5, campusLocation: 'Academic Quadrangle Bus Bay' },
    ],
  },
  {
    id: 'route-panipat-sonipat',
    name: 'GT Road North: Panipat ⇄ Sonipat Campus',
    description: 'Intercity corridor connecting Panipat city, Samalkha, and Ganaur with Sonipat Campus along Grand Trunk Road (NH-44).',
    operatingDays: 'Daily (Morning & Evening Services)',
    timezone: 'IST',
    lastUpdated: '2026-10-09T00:00:00Z',
    isDemo: 0,
    driverName: 'Vikram Sharma',
    driverPhone: '+91 98112 04820',
    busNumber: 'HR 10 SRM 7734',
    scheduledDepartures: [
      '07:00 AM',
      '04:30 PM',
    ],
    stops: [
      { id: 'pp-s1', name: 'Panipat Toll Plaza / Skylark Hub', sequence: 1, campusLocation: 'Main Highway Porch' },
      { id: 'pp-s2', name: 'Samalkha Highway Bus Shelter', sequence: 2, campusLocation: 'Railway Crossing Junction' },
      { id: 'pp-s3', name: 'Ganaur Bus Stand Stoppage', sequence: 3, campusLocation: 'GT Road Service Lane' },
      { id: 'pp-s4', name: 'Murthal University Chowk', sequence: 4, campusLocation: 'Opposite Highway Dhaba Hub' },
      { id: 'pp-s5', name: 'Sonipat Campus North Gate', sequence: 5, campusLocation: 'Gate 2 Transit Pavilion' },
    ],
  },
  {
    id: 'route-rohtak-sonipat',
    name: 'Haryana West: Rohtak ⇄ Sonipat Campus',
    description: 'Western corridor connecting Rohtak New Bus Stand, PGIMS Medical Hub, and Kharkhoda Bypass with Sonipat Campus.',
    operatingDays: 'Monday – Saturday',
    timezone: 'IST',
    lastUpdated: '2026-10-09T00:00:00Z',
    isDemo: 0,
    driverName: 'Dharamvir Malik',
    driverPhone: '+91 98112 04828',
    busNumber: 'HR 10 SRM 5521',
    scheduledDepartures: [
      '07:00 AM',
      '04:30 PM',
    ],
    stops: [
      { id: 'rt-s1', name: 'Rohtak New Bus Stand (Rautak Terminal)', sequence: 1, campusLocation: 'Intercity Platform #6' },
      { id: 'rt-s2', name: 'Rohtak PGIMS Medical Chowk', sequence: 2, campusLocation: 'Hospital Main Gate Porch' },
      { id: 'rt-s3', name: 'Kharkhoda Bypass Stoppage', sequence: 3, campusLocation: 'State Highway 18 Crossing' },
      { id: 'rt-s4', name: 'Sonipat Subhash Chowk', sequence: 4, campusLocation: 'Old DC Office Circle' },
      { id: 'rt-s5', name: 'Sonipat Campus Main Gate', sequence: 5, campusLocation: 'Gate 1 Reception Bay' },
    ],
  },
];

export const DEMO_REPORTS = [
  {
    id: 'rep-demo-001',
    referenceCode: 'CA-4912-K7',
    category: 'LIGHTING_ELECTRICAL',
    locationDescription: 'Pathway outside Library East Entrance',
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
    locationDescription: 'Administration Building North Ramp',
    issueDescription: 'Handrail bolt loose near the bottom step of wheelchair access ramp.',
    status: 'RECEIVED',
    createdAt: '2026-10-07T07:10:00Z',
    updatedAt: '2026-10-07T07:10:00Z',
    auditTrail: [],
  },
];
