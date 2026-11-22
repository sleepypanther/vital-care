import { PermissionFlag } from '@healthcare/types';

export const DEFAULT_PATIENT_PERMISSIONS: PermissionFlag[] = [
  'vitals',
  'healthTrends',
  'labReports',
  'medicalRecords',
  'medicines',
  'medicationSchedule',
  'dailySchedule',
  'diet',
  'exercise',
  'sleep',
  'appointments',
  'emergencyAlerts',
  'healthReports',
  'uploadedDocuments',
];

export function hasPermission(flags: PermissionFlag[] | undefined, flag: PermissionFlag): boolean {
  if (!flags) return false;
  return flags.includes(flag);
}

export function requirePermission(flags: PermissionFlag[] | undefined, flag: PermissionFlag): void {
  if (!hasPermission(flags, flag)) {
    throw new Error(`Missing permission: ${flag}`);
  }
}

export const ALL_FLAGS: PermissionFlag[] = [
  'vitals',
  'healthTrends',
  'labReports',
  'medicalRecords',
  'medicines',
  'medicationSchedule',
  'dailySchedule',
  'diet',
  'exercise',
  'sleep',
  'appointments',
  'emergencyAlerts',
  'healthReports',
  'uploadedDocuments',
];
