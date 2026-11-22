import type {
  User, PatientProfile, VitalRecord, WearableData, DailyPlanResponse,
  Medication, MedicalReport, ScannedFood, HealthAlert, DoctorRestriction,
  AuditLog, CaregiverConsent, AIMessage
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'API Request Failed');
  }
  return data;
}

export const api = {
  // Auth & Roles
  getRoles: () => fetchJSON<{ users: User[] }>('/auth/roles'),
  getUser: (userId: string) => fetchJSON<{ user: User }>(`/auth/me/${userId}`),

  // Patient Profile & History
  getPatientProfile: (patientId: string) => fetchJSON<{ patient: PatientProfile }>(`/patient/${patientId}/profile`),
  getPatientHistory: (patientId: string) => fetchJSON<{ history: any[] }>(`/patient/${patientId}/history`),
  getEmergencyData: (patientId: string) => fetchJSON<{ contacts: any[]; latestVital: VitalRecord; profile: any }>(`/patient/${patientId}/emergency`),

  // Vitals & Monitoring
  getCurrentVitals: (patientId: string) => fetchJSON<{
    vital: VitalRecord;
    wearable: WearableData;
    restrictions: DoctorRestriction;
    warning?: { isWarning: boolean; warningMsg: string }
  }>(`/vitals/${patientId}/current`),

  getVitalTrends: (patientId: string, timeframe: string = '30D') =>
    fetchJSON<{ history: VitalRecord[]; anomalyNote?: string }>(`/vitals/${patientId}/trends?timeframe=${timeframe}`),

  // Alias used by monitoring views — returns reading history
  getVitals: (patientId: string, _limit?: number) =>
    fetchJSON<{ history: VitalRecord[]; anomalyNote?: string }>(`/vitals/${patientId}/trends?timeframe=30D`)
      .then(r => ({ vitals: r.history, anomalyNote: r.anomalyNote })),

  getWearableData: (patientId: string) =>
    fetchJSON<{ wearable: WearableData | null }>(`/vitals/${patientId}/wearable`),

  getSleepRecord: (patientId: string) =>
    fetchJSON<{ sleep: { duration_hours: number; deep_sleep_hours: number; consistency_score: number; recovery_score: number } | null }>(`/vitals/${patientId}/sleep`),

  // Demo/Simulator vitals update
  updateDemoVitals: (patientId: string, payload: any) =>
    fetchJSON<{ vitalId: string }>('/vitals/' + patientId + '/demo-update', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Real sensor data update (Bluetooth / Camera / HealthKit)
  // Only sends fields that were actually measured — no fake defaults
  sendRealVitals: (patientId: string, payload: {
    source: 'bluetooth' | 'camera' | 'healthkit' | 'manual';
    heartRate: number;
    restingHr?: number;
    spo2?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    glucose?: number;
    weight?: number;
    steps?: number;
    calories?: number;
    hrv?: number;
    respRate?: number;
    sleepHours?: number;
    deviceName?: string;
  }) =>
    fetchJSON<{ vitalId: string; savedFields: Record<string, boolean> }>('/vitals/' + patientId + '/real-update', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Daily Plan & Water
  getDailyPlan: (patientId: string) => fetchJSON<{ dailyPlan: DailyPlanResponse }>(`/daily-plan/${patientId}`),
  updateWaterLog: (patientId: string, amount: number) => fetchJSON<{ amount: number }>(`/daily-plan/${patientId}/water`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),
  logMeal: (patientId: string, meal: { mealType?: string; foodName: string; calories?: number; protein?: number; carbs?: number; fat?: number; sodium?: number }) =>
    fetchJSON<{ mealId: string }>(`/daily-plan/${patientId}/log-meal`, {
      method: 'POST',
      body: JSON.stringify(meal)
    }),

  // Medications
  getMedications: (patientId: string) =>
    fetchJSON<{ medications: Medication[]; logs: any[]; adherencePercent: number }>(`/medications/${patientId}`),
  toggleMedicationLog: (patientId: string, medicationId: string, status: 'taken' | 'missed' | 'pending') =>
    fetchJSON<{ status: string }>(`/medications/${patientId}/toggle-log`, {
      method: 'POST',
      body: JSON.stringify({ medicationId, status })
    }),

  // Medical Reports & OCR
  getMedicalReports: (patientId: string) => fetchJSON<{ reports: MedicalReport[] }>(`/reports/${patientId}`),
  uploadMedicalReport: (patientId: string, reportName: string, fileType: string) =>
    fetchJSON<{ reportId: string; extractedValues: any[] }>(`/reports/${patientId}/upload`, {
      method: 'POST',
      body: JSON.stringify({ reportName, fileType })
    }),

  // Food Scanner
  scanFood: (patientId: string, foodKey: string) => fetchJSON<{ scannedFood: ScannedFood }>(`/food-scanner/${patientId}/scan`, {
    method: 'POST',
    body: JSON.stringify({ foodKey })
  }),

  // Doctor Controls
  getDoctorPatients: () => fetchJSON<{ stats: any; patients: any[] }>('/doctor/patients'),
  getDoctorPatientDetail: (patientId: string) => fetchJSON<any>(`/doctor/patient/${patientId}`),
  updateDoctorRestrictions: (patientId: string, restrictions: Partial<DoctorRestriction>) =>
    fetchJSON<{ auditId: string }>(`/doctor/restrictions/${patientId}`, {
      method: 'POST',
      body: JSON.stringify(restrictions)
    }),
  getAuditLogs: () => fetchJSON<{ logs: AuditLog[] }>('/doctor/audit-logs'),

  // Caregiver Permissions
  getCaregiverView: (patientId: string) => fetchJSON<{ caregiverView: any }>(`/caregiver/${patientId}/view`),
  updateCaregiverConsent: (patientId: string, consents: Partial<CaregiverConsent>) =>
    fetchJSON<{ message: string }>(`/caregiver/${patientId}/consent`, {
      method: 'POST',
      body: JSON.stringify(consents)
    }),

  // AI Assistant
  getAIHistory: (patientId: string) => fetchJSON<{ messages: AIMessage[] }>(`/ai/${patientId}/history`),
  sendAIMessage: (patientId: string, message: string) => fetchJSON<{ reply: AIMessage }>(`/ai/${patientId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  // Alerts
  getAlerts: (patientId: string) => fetchJSON<{ alerts: HealthAlert[] }>(`/alerts/${patientId}`),
  markAlertRead: (alertId: string) => fetchJSON<{ message: string }>(`/alerts/${alertId}/read`, {
    method: 'POST'
  }),
  sendSOS: (patientId: string) => fetchJSON<{ alertId: string }>(`/alerts/${patientId}/sos`, {
    method: 'POST'
  })
};
