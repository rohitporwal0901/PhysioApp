import { Specialty } from '../services/specialization.service';

/**
 * Standard medical categories for HealthHub
 */
export const DEFAULT_SPECIALTIES: Partial<Specialty>[] = [
  { name: 'Physiotherapy', icon: 'activity' },
  { name: 'Cardiology', icon: 'heart' },
  { name: 'Orthopedics', icon: 'bone' },
  { name: 'Neurology', icon: 'brain' },
  { name: 'Pediatrics', icon: 'baby' },
  { name: 'Dermatology', icon: 'user' },
  { name: 'General Physician', icon: 'stethoscope' },
  { name: 'Dental', icon: 'smile' },
  { name: 'Ophthalmology', icon: 'eye' },
  { name: 'Psychiatry', icon: 'brain-circuit' }
];

/*
 * To seed these into Firestore, use the 'Bulk Seed' button added to the 
 * Admin Specialties management page in the dashboard.
 */
