// MediCycle Centralized Application Constants

export const LIFECYCLE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  DISPENSED: 'DISPENSED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

export const MEDICINE_CATEGORIES = [
  'All',
  'Oncology',
  'Critical Care',
  'Cardiology',
  'Diabetes Care',
  'Antibiotics',
  'Chronic Care',
  'Pain Relief',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'General Health',
];

// Fictional Prototype Personas (Clearly labeled for hackathon integrity)
export const PROTOTYPE_PERSONAS = {
  PHARMACIST: {
    name: 'Dr. Anita Sharma',
    label: 'Prototype Pharmacist Persona',
    role: 'Licensed Clinical Pharmacist (Demo)',
    clinicHub: 'Indiranagar Community Health Centre',
    disclaimer: 'Prototype Pharmacist Persona — Demonstrates clinical safety verification workflow.',
  },
  DONOR: {
    name: 'Aarav Patel',
    label: 'Community Donor Persona',
    role: 'Verified Community Member',
    location: 'Indiranagar, Bengaluru',
  },
  RECIPIENT: {
    name: 'Priya Sharma',
    label: 'Community Recipient Persona',
    role: 'Verified Patient Recipient',
    location: 'Koramangala, Bengaluru',
  },
  ADMIN: {
    name: 'MediCycle Admin',
    label: 'Platform Overseer Persona',
    role: 'Platform Operations Administrator',
  },
};

// Verified Clinical Collection & Pickup Hubs (Google Maps integration points)
// Note: Private donor residential addresses are NEVER exposed. All redistribution occurs at clinical hubs.
export const VERIFIED_CLINICAL_HUBS = [
  {
    id: 'hub-indiranagar',
    name: 'Indiranagar Community Health Centre',
    type: 'Primary Inspection & Dispensing Hub',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    coordinates: { lat: 12.9719, lng: 77.6412 },
    pharmacistInCharge: 'Dr. Anita Sharma (Prototype Persona)',
    hours: 'Mon – Sat: 08:30 AM – 07:00 PM',
    phone: '+91 80 2521 4400',
    capabilities: ['Blister Strip Inspection', 'Cold-Chain Biologics (2-8°C)', 'Prescription Verification', 'Patient Counseling'],
    status: 'Active Hub',
    mapUrl: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
  },
  {
    id: 'hub-koramangala',
    name: 'Koramangala Red Cross Collection Booth',
    type: 'Drop-off & Cold-Chain Storage',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    pharmacistInCharge: 'Clinical Staff (Red Cross Partner)',
    hours: 'Mon – Sun: 09:00 AM – 06:00 PM',
    phone: '+91 80 2553 1122',
    capabilities: ['Secure Drop-off Lockers', 'Preliminary Foil Check', 'Temperature Monitored'],
    status: 'Active Hub',
    mapUrl: 'https://maps.google.com/?q=Koramangala+Bengaluru',
  },
  {
    id: 'hub-whitefield',
    name: 'Whitefield Primary Care Distribution Center',
    type: 'Subsidized Community Pharmacy',
    address: 'ITPL Main Rd, Whitefield, Bengaluru, Karnataka 560066',
    coordinates: { lat: 12.9698, lng: 77.7499 },
    pharmacistInCharge: 'Supervising Pharmacist',
    hours: 'Mon – Sat: 09:00 AM – 08:00 PM',
    phone: '+91 80 2845 8899',
    capabilities: ['Prescription Dispensing', 'Affordability Subsidy Program', 'Direct Patient Handover'],
    status: 'Active Hub',
    mapUrl: 'https://maps.google.com/?q=Whitefield+Bengaluru',
  },
  {
    id: 'hub-jayanagar',
    name: 'Jayanagar General Community Dispensary',
    type: 'Public Health Collection Depot',
    address: '9th Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011',
    coordinates: { lat: 12.9250, lng: 77.5938 },
    pharmacistInCharge: 'Registered Clinical Staff',
    hours: 'Mon – Fri: 08:00 AM – 05:00 PM',
    phone: '+91 80 2663 3311',
    capabilities: ['Chronic Care Supply', 'Batch Quarantine Depot', 'Disposal of Expired Medicines'],
    status: 'Active Hub',
    mapUrl: 'https://maps.google.com/?q=Jayanagar+Bengaluru',
  },
];
