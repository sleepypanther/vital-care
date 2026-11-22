export type UserRole = 'patient' | 'caregiver';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyConfig?: EmergencyConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverRelationship {
  id: string;
  patientId: string;
  caregiverId: string;
  role: 'primary' | 'secondary';
  status: 'pending' | 'active' | 'revoked';
  invitedAt: string;
  acceptedAt?: string;
  revokedAt?: string;
}

export type PermissionFlag =
  | 'vitals'
  | 'healthTrends'
  | 'labReports'
  | 'medicalRecords'
  | 'medicines'
  | 'medicationSchedule'
  | 'dailySchedule'
  | 'diet'
  | 'exercise'
  | 'sleep'
  | 'appointments'
  | 'emergencyAlerts'
  | 'healthReports'
  | 'uploadedDocuments';

export interface Permission {
  id: string;
  relationshipId: string;
  flags: PermissionFlag[];
  updatedAt: string;
}

export type VitalSource = 'healthkit' | 'healthconnect' | 'wearos' | 'garmin' | 'fitbit' | 'oura' | 'mock' | 'manual';
export type DataQuality = 'normal' | 'stale' | 'missing' | 'poor' | 'disconnected' | 'notWorn' | 'lowBattery';

export interface VitalReading {
  id: string;
  patientId: string;
  deviceId?: string;
  source: VitalSource;
  metric: 'heartRate' | 'restingHeartRate' | 'hrv' | 'spo2' | 'respiratoryRate' | 'bpSystolic' | 'bpDiastolic' | 'bodyTemp' | 'weight';
  value: number;
  unit: string;
  timestamp: string;
  quality: DataQuality;
  accuracy?: number;
  signalQuality?: number;
  metadata?: Record<string, unknown>;
}

export interface WearableDevice {
  id: string;
  patientId: string;
  source: VitalSource;
  deviceName: string;
  model?: string;
  connected: boolean;
  battery?: number;
  lastSync?: string;
  metadata?: Record<string, unknown>;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  beforeAfterFood?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicationLogStatus = 'taken' | 'missed' | 'skipped' | 'pending';

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  patientId: string;
  time: string;
  daysOfWeek?: number[];
  active: boolean;
}

export interface MedicationLog {
  id: string;
  scheduleId: string;
  medicationId: string;
  patientId: string;
  scheduledAt: string;
  takenAt?: string;
  status: MedicationLogStatus;
}

export interface ScheduleItem {
  id: string;
  patientId: string;
  category: 'wake' | 'medication' | 'meal' | 'hydration' | 'exercise' | 'physiotherapy' | 'rest' | 'sleep' | 'appointment' | 'test' | 'custom';
  title: string;
  time: string;
  date?: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  name: string;
  category: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  labName?: string;
  reportDate?: string;
  ocrProcessed: boolean;
}

export interface LabResult {
  id: string;
  labReportId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'low' | 'normal' | 'high' | 'unknown';
}

export interface EmergencyConfig {
  primaryCaregiverId?: string;
  secondaryCaregiverId?: string;
  escalationDelaySeconds: number;
  enableLocation: boolean;
  emergencyMessage?: string;
}

export type EmergencyEventType = 'sos' | 'fall' | 'no_response' | 'no_movement' | 'manual';
export type EmergencyEventStatus = 'active' | 'acknowledged' | 'resolved' | 'cancelled';

export interface EmergencyEvent {
  id: string;
  patientId: string;
  type: EmergencyEventType;
  status: EmergencyEventStatus;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  cancelledAt?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  userId: string;
  patientId?: string;
  priority: NotificationPriority;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetPatientId?: string;
  resourceType?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface HealthReport {
  id: string;
  patientId: string;
  generatedBy: string;
  rangeStart: string;
  rangeEnd: string;
  fileKey: string;
  fileName: string;
  shareToken?: string;
  shareExpiresAt?: string;
  createdAt: string;
}
