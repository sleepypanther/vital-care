export type UserRole = 'patient' | 'doctor' | 'caregiver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  patient_id?: string;
  doctor_id?: string;
  caregiver_id?: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  blood_group: string;
  allergies: string;
  existing_conditions: string;
  previous_surgeries: string;
  family_history: string;
  dietary_preferences: string;
  doctor_id: string;
  doctor_name?: string;
  emergencyContacts?: EmergencyContact[];
  doctorRestrictions?: DoctorRestriction;
  conditions?: MedicalCondition[];
}

export interface DoctorRestriction {
  id: string;
  patient_id: string;
  doctor_id: string;
  diet_restrictions: string;
  exercise_restrictions: string;
  max_exercise_hr: number;
  bp_systolic_threshold: number;
  bp_diastolic_threshold: number;
  max_daily_fluid_l: number;
  sodium_limit_mg: number;
  updated_at?: string;
}

export interface MedicalCondition {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date: string;
  status: string;
  notes?: string;
}

export interface MedicalHistoryEvent {
  id: string;
  patient_id: string;
  event_year: number;
  event_title: string;
  category: 'Condition' | 'Medication' | 'Report' | 'Assessment';
  details: string;
  date_recorded: string;
}

export interface ReportValue {
  id: string;
  report_id: string;
  test_name: string;
  value: string;
  unit: string;
  ref_range: string;
  status_indicator: 'Normal' | 'Attention' | 'High' | 'Low';
}

export interface MedicalReport {
  id: string;
  patient_id: string;
  report_name: string;
  file_type: string;
  file_path: string;
  upload_date: string;
  status: string;
  values?: ReportValue[];
}

export interface Medication {
  id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  timing_instructions: string;
  prescribed_by: string;
  status?: 'taken' | 'missed' | 'pending';
  taken_at?: string;
  scheduled_time?: string;
}

export interface VitalRecord {
  id: string;
  patient_id: string;
  heart_rate: number;
  resting_hr?: number | null;
  spo2?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  glucose?: number | null;
  weight?: number | null;
  source?: 'bluetooth' | 'camera' | 'healthkit' | 'demo' | 'manual';
  timestamp: string;
  is_demo?: number;
}

export interface WearableData {
  id: string;
  patient_id: string;
  device_name: string;
  steps?: number | null;
  calories?: number | null;
  sleep_seconds?: number | null;
  hrv?: number | null;
  resp_rate?: number | null;
  timestamp: string;
}

export interface NutritionPlan {
  id: string;
  patient_id: string;
  date: string;
  breakfast_item: string;
  breakfast_portion: string;
  breakfast_calories: number;
  lunch_item: string;
  lunch_portion: string;
  lunch_calories: number;
  snack_item: string;
  snack_portion: string;
  snack_calories: number;
  dinner_item: string;
  dinner_portion: string;
  dinner_calories: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_fiber: number;
  target_water_l: number;
}

export interface ExercisePlan {
  id: string;
  patient_id: string;
  date: string;
  activity_name: string;
  duration_mins: number;
  intensity: string;
  warm_up_mins: number;
  cool_down_mins: number;
  rest_mins: number;
}

export interface DailyPlanResponse {
  date: string;
  wellnessScore: number;
  scoreDisclaimer: string;
  sleepWindow: string;
  nutritionPlan: NutritionPlan;
  exercisePlan: ExercisePlan;
  medications: Medication[];
  water: {
    current: number;
    target: number;
    isFluidRestricted: boolean;
  };
  restrictions?: DoctorRestriction;
}

export interface ScannedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  category: string;
  fitsPlan: boolean;
  recommendation: string;
  restrictionWarning?: string | null;
  disclaimer: string;
}

export interface HealthAlert {
  id: string;
  patient_id: string;
  severity: 'info' | 'attention' | 'urgent';
  title: string;
  message: string;
  is_read: number;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  patient_id: string;
  contact_name: string;
  relationship: string;
  phone: string;
  is_primary: number;
}

export interface CaregiverConsent {
  id: string;
  patient_id: string;
  caregiver_id: string;
  allow_medication: number;
  allow_activity: number;
  allow_vitals: number;
  allow_alerts: number;
  allow_full_history: number;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_patient_id: string;
  old_val?: string;
  new_val?: string;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp?: string;
  disclaimer?: string;
}
