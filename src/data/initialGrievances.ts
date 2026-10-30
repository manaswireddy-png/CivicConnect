import { Grievance, StatusHistory } from '../types';

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'grievance-001',
    referenceId: 'GRA-2026-00001',
    userId: 'demo-citizen-1',
    userName: 'K. Venkatesh',
    userEmail: 'venkatesh.k@example.com',
    subject: 'Main drinking water line leakage causing low pressure in Road No 12',
    description: 'Major underground pipeline fracture causing potable water to gush onto the main road near Apollo Pharmacy on Road No 12, Banjara Hills. Entire colony has received no tap water for 3 consecutive days.',
    category: 'Water Supply',
    department: 'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',
    location: 'Road No 12, Banjara Hills, Hyderabad',
    landmark: 'Opposite Apollo Pharmacy, Ward 93',
    pincode: '500034',
    priority: 'High',
    status: 'In Progress',
    attachmentUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156f?auto=format&fit=crop&w=600&q=80',
    resolutionNotes: 'HMWSSB Section Manager inspected site on Oct 29. Emergency excavation team dispatched to repair fractured 300mm DI line. Estimated restoration by Oct 31, 6:00 PM.',
    createdAt: '2026-10-28T09:30:00Z',
    updatedAt: '2026-10-29T14:15:00Z'
  },
  {
    id: 'grievance-002',
    referenceId: 'GRA-2026-00002',
    userId: 'demo-citizen-2',
    userName: 'P. Sunitha',
    userEmail: 'sunitha.p@example.com',
    subject: 'Dangerous pothole and cave-in near Metro Pillar C812',
    description: 'A 2-foot deep crater has formed right under the Metro station pillar following recent rains. Two two-wheeler skids occurred yesterday evening during rush hour. Immediate cold-mix filling needed.',
    category: 'Roads & Infrastructure',
    department: 'Greater Hyderabad Municipal Corporation (GHMC)',
    location: 'Kukatpally Main Road, Near Metro Pillar C812',
    landmark: 'Near KPHB Phase 1 Metro station',
    pincode: '500072',
    priority: 'Urgent',
    status: 'Acknowledged',
    attachmentUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    resolutionNotes: 'Complaint received and marked urgent. GHMC Assistant Executive Engineer (AEE) Division 24 notified. Pothole squad scheduled for night shift asphalt patching.',
    createdAt: '2026-10-29T11:00:00Z',
    updatedAt: '2026-10-29T16:45:00Z'
  },
  {
    id: 'grievance-003',
    referenceId: 'GRA-2026-00003',
    userId: 'demo-citizen-1',
    userName: 'K. Venkatesh',
    userEmail: 'venkatesh.k@example.com',
    subject: 'Continuous sparking and frequent tripping in 11KV distribution transformer',
    description: 'Transformer unit located next to community park has been making loud buzzing noises with visible sparking at night. Frequent phase drop causing voltage fluctuations in 40+ houses.',
    category: 'Electricity',
    department: 'Southern Power Distribution Company of Telangana Limited (TSSPDCL)',
    location: 'Street No 4, Ayyappa Society, Madhapur',
    landmark: 'Near Silicon Valley High School',
    pincode: '500081',
    priority: 'High',
    status: 'Resolved',
    attachmentUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    resolutionNotes: 'TSSPDCL Line Inspector and Breakdown Van attended site. Replaced damaged HT bushing and upgraded earthing electrode. Voltage stabilized at 235V. Closed after citizen verification.',
    createdAt: '2026-10-25T15:20:00Z',
    updatedAt: '2026-10-27T10:10:00Z'
  },
  {
    id: 'grievance-004',
    referenceId: 'GRA-2026-00004',
    userId: 'demo-citizen-3',
    userName: 'Mohammed Arshad',
    userEmail: 'arshad.m@example.com',
    subject: 'Overflowing open garbage bin and missed door-to-door collection',
    description: 'The community garbage vat has not been emptied for 4 days. Stray cattle and dogs are scattering decomposing food waste across the residential lane. Severe foul odor and hygiene hazard.',
    category: 'Sanitation',
    department: 'Greater Hyderabad Municipal Corporation (GHMC)',
    location: 'Patel Nagar, Near Clock Tower, Secunderabad',
    landmark: 'Behind St. Marys School',
    pincode: '500003',
    priority: 'Medium',
    status: 'Submitted',
    attachmentUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-30T06:15:00Z',
    updatedAt: '2026-10-30T06:15:00Z'
  },
  {
    id: 'grievance-005',
    referenceId: 'GRA-2026-00005',
    userId: 'demo-citizen-4',
    userName: 'Lakshmi Narayana',
    userEmail: 'lakshmi.n@example.com',
    subject: 'Row of 8 LED street lights non-functional creating dark stretch',
    description: 'Entire 400-meter lane from Dilsukhnagar Bus Depot to Shiva Temple is pitch dark after 6:30 PM. Women commuters feel unsafe walking from metro station.',
    category: 'Street Lights & Infrastructure',
    department: 'Greater Hyderabad Municipal Corporation (GHMC) / Electrical Wing',
    location: 'Kamala Nagar Main Road, Dilsukhnagar',
    landmark: 'Lane beside Dilsukhnagar RTC Depot',
    pincode: '500060',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-10-27T18:40:00Z',
    updatedAt: '2026-10-28T11:20:00Z'
  },
  {
    id: 'grievance-006',
    referenceId: 'GRA-2026-00006',
    userId: 'demo-citizen-2',
    userName: 'P. Sunitha',
    userEmail: 'sunitha.p@example.com',
    subject: 'Sewage overflowing onto pedestrian walkway near Charminar monument',
    description: 'Underground manhole overflowing with black domestic sewage onto pedestrian corridor. Tourists and local shops severely impacted by stench and contaminated puddle.',
    category: 'Water Supply & Drainage',
    department: 'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',
    location: 'Pathergatti Road, Near Charminar South Gate',
    landmark: 'Near Madina Circle, Old City',
    pincode: '500002',
    priority: 'High',
    status: 'Resolved',
    resolutionNotes: 'HMWSSB Super Sucker and Airtech jetting machine deployed. Heavy silt and plastic obstruction removed from main sewer line. Bleaching powder sanitized surrounding pavement.',
    createdAt: '2026-10-24T08:00:00Z',
    updatedAt: '2026-10-25T17:30:00Z'
  }
];

export const INITIAL_STATUS_HISTORY: StatusHistory[] = [
  // For GRA-2026-00001
  {
    id: 'hist-101',
    grievanceId: 'GRA-2026-00001',
    referenceId: 'GRA-2026-00001',
    status: 'Submitted',
    note: 'Grievance lodged by citizen via CivicConnect AI portal. Automatic department routing completed.',
    updatedBy: 'System / Automated Routing',
    timestamp: '2026-10-28T09:30:00Z'
  },
  {
    id: 'hist-102',
    grievanceId: 'GRA-2026-00001',
    referenceId: 'GRA-2026-00001',
    status: 'Acknowledged',
    note: 'Acknowledged by HMWSSB Sub-Division VI Control Officer. Field investigation order issued to Assistant Engineer.',
    updatedBy: 'Officer R. Satyanarayana (HMWSSB)',
    timestamp: '2026-10-28T14:10:00Z'
  },
  {
    id: 'hist-103',
    grievanceId: 'GRA-2026-00001',
    referenceId: 'GRA-2026-00001',
    status: 'In Progress',
    note: 'Excavation team positioned at site. Damaged 300mm pipe segment identified. Replacement pipe jointing underway.',
    updatedBy: 'AE K. Ramesh Babu (HMWSSB Div VI)',
    timestamp: '2026-10-29T14:15:00Z'
  },

  // For GRA-2026-00002
  {
    id: 'hist-201',
    grievanceId: 'GRA-2026-00002',
    referenceId: 'GRA-2026-00002',
    status: 'Submitted',
    note: 'Grievance submitted by citizen with geo-tagged photographic evidence.',
    updatedBy: 'System / Citizen Portal',
    timestamp: '2026-10-29T11:00:00Z'
  },
  {
    id: 'hist-202',
    grievanceId: 'GRA-2026-00002',
    referenceId: 'GRA-2026-00002',
    status: 'Acknowledged',
    note: 'Triaged as High Priority road hazard due to metro traffic corridor. Assigned to GHMC Central Zone Pothole Squad.',
    updatedBy: 'EE V. Chandrasekhar (GHMC Engineering)',
    timestamp: '2026-10-29T16:45:00Z'
  },

  // For GRA-2026-00003
  {
    id: 'hist-301',
    grievanceId: 'GRA-2026-00003',
    referenceId: 'GRA-2026-00003',
    status: 'Submitted',
    note: 'Reported as electrical transformer sparking hazard.',
    updatedBy: 'System / Citizen Portal',
    timestamp: '2026-10-25T15:20:00Z'
  },
  {
    id: 'hist-302',
    grievanceId: 'GRA-2026-00003',
    referenceId: 'GRA-2026-00003',
    status: 'Acknowledged',
    note: 'Assigned to Madhapur 33/11KV Substation Emergency Line Team.',
    updatedBy: 'ADE TSSPDCL Cybercity',
    timestamp: '2026-10-25T16:00:00Z'
  },
  {
    id: 'hist-303',
    grievanceId: 'GRA-2026-00003',
    referenceId: 'GRA-2026-00003',
    status: 'In Progress',
    note: 'Emergency power shutdown scheduled for 45 minutes to execute bushing repair safely.',
    updatedBy: 'Lineman T. Srinivas',
    timestamp: '2026-10-26T09:30:00Z'
  },
  {
    id: 'hist-304',
    grievanceId: 'GRA-2026-00003',
    referenceId: 'GRA-2026-00003',
    status: 'Resolved',
    note: 'Damaged bushing replaced. Earth resistance test passed. Normal supply restored and verified with local residents.',
    updatedBy: 'DE (Operations) TSSPDCL Gachibowli',
    timestamp: '2026-10-27T10:10:00Z'
  },

  // For GRA-2026-00004
  {
    id: 'hist-401',
    grievanceId: 'GRA-2026-00004',
    referenceId: 'GRA-2026-00004',
    status: 'Submitted',
    note: 'Complaint registered for missed sanitation collection. Ticket routed to GHMC Secunderabad Zone Health Wing.',
    updatedBy: 'System / Automated Routing',
    timestamp: '2026-10-30T06:15:00Z'
  }
];
