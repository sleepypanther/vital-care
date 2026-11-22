import { DataQuality, VitalSource } from '@healthcare/types';

export interface DeviceCapability {
  metric: string;
  supported: boolean;
  available: boolean;
}

export interface ConnectedDevice {
  id: string;
  patientId: string;
  source: VitalSource;
  deviceName: string;
  model?: string;
  connected: boolean;
  battery?: number;
  lastSync?: string;
  capabilities: DeviceCapability[];
}

export interface WearableReading {
  id: string;
  patientId: string;
  deviceId: string;
  sourcePlatform: VitalSource;
  metricType: string;
  value: number | string;
  unit: string;
  recordedAt: Date;
  receivedAt: Date;
  dataQuality: DataQuality;
  sensorMetadata?: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  measurementsImported: number;
  duplicatesSkipped: number;
  errors: string[];
  lastSync: Date;
}

export interface PermissionStatus {
  metric: string;
  granted: boolean;
  platform: VitalSource;
}

export const METRIC_TYPES = {
  HEART_RATE: 'heartRate',
  RESTING_HEART_RATE: 'restingHeartRate',
  HRV: 'hrv',
  SPO2: 'spo2',
  RESPIRATORY_RATE: 'respiratoryRate',
  BP_SYSTOLIC: 'bpSystolic',
  BP_DIASTOLIC: 'bpDiastolic',
  BODY_TEMP: 'bodyTemp',
  STEPS: 'steps',
  DISTANCE: 'distance',
  CALORIES_ACTIVE: 'caloriesActive',
  CALORIES_TOTAL: 'caloriesTotal',
  SLEEP_START: 'sleepStart',
  SLEEP_END: 'sleepEnd',
  SLEEP_DURATION: 'sleepDuration',
  SLEEP_DEEP: 'sleepDeep',
  SLEEP_LIGHT: 'sleepLight',
  SLEEP_REM: 'sleepRem',
  SLEEP_AWAKE: 'sleepAwake',
  WORKOUT: 'workout',
  ECG: 'ecg',
  GLUCOSE: 'glucose',
  WEIGHT: 'weight',
} as const;
