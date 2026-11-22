import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../vitalcare.db');
const db = new Database(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      bmi REAL NOT NULL,
      blood_group TEXT NOT NULL,
      allergies TEXT,
      existing_conditions TEXT,
      previous_surgeries TEXT,
      family_history TEXT,
      dietary_preferences TEXT,
      doctor_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      specialization TEXT NOT NULL,
      hospital TEXT NOT NULL,
      license_no TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS caregivers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      relationship TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medical_conditions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      condition_name TEXT NOT NULL,
      diagnosed_date TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS medical_history (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      event_year INTEGER NOT NULL,
      event_title TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT NOT NULL,
      date_recorded TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medical_reports (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      report_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS report_values (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      test_name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT NOT NULL,
      ref_range TEXT NOT NULL,
      status_indicator TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      medicine_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      timing_instructions TEXT NOT NULL,
      prescribed_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      taken_at TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      heart_rate INTEGER NOT NULL,
      resting_hr INTEGER,
      spo2 INTEGER,
      bp_systolic INTEGER,
      bp_diastolic INTEGER,
      glucose INTEGER,
      weight REAL,
      source TEXT DEFAULT 'demo',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_demo INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS wearable_data (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      steps INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      sleep_seconds INTEGER NOT NULL,
      hrv INTEGER NOT NULL,
      resp_rate INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      breakfast_item TEXT NOT NULL,
      breakfast_portion TEXT NOT NULL,
      breakfast_calories INTEGER NOT NULL,
      lunch_item TEXT NOT NULL,
      lunch_portion TEXT NOT NULL,
      lunch_calories INTEGER NOT NULL,
      snack_item TEXT NOT NULL,
      snack_portion TEXT NOT NULL,
      snack_calories INTEGER NOT NULL,
      dinner_item TEXT NOT NULL,
      dinner_portion TEXT NOT NULL,
      dinner_calories INTEGER NOT NULL,
      target_calories INTEGER NOT NULL,
      target_protein INTEGER NOT NULL,
      target_carbs INTEGER NOT NULL,
      target_fat INTEGER NOT NULL,
      target_fiber INTEGER NOT NULL,
      target_water_l REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein INTEGER NOT NULL,
      carbs INTEGER NOT NULL,
      fat INTEGER NOT NULL,
      sodium INTEGER NOT NULL,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exercise_plans (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      activity_name TEXT NOT NULL,
      duration_mins INTEGER NOT NULL,
      intensity TEXT NOT NULL,
      warm_up_mins INTEGER NOT NULL,
      cool_down_mins INTEGER NOT NULL,
      rest_mins INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercise_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      activity_name TEXT NOT NULL,
      duration_mins INTEGER NOT NULL,
      calories_burned INTEGER NOT NULL,
      heart_rate_avg INTEGER NOT NULL,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sleep_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      deep_sleep_hours REAL NOT NULL,
      consistency_score INTEGER NOT NULL,
      interruptions INTEGER NOT NULL,
      recovery_score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount_liters REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctor_restrictions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL UNIQUE,
      doctor_id TEXT NOT NULL,
      diet_restrictions TEXT NOT NULL,
      exercise_restrictions TEXT NOT NULL,
      max_exercise_hr INTEGER NOT NULL,
      bp_systolic_threshold INTEGER NOT NULL,
      bp_diastolic_threshold INTEGER NOT NULL,
      max_daily_fluid_l REAL NOT NULL,
      sodium_limit_mg INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS health_alerts (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_plans (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      wellness_score INTEGER NOT NULL,
      sleep_window TEXT NOT NULL,
      notes TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_primary INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      caregiver_id TEXT NOT NULL,
      allow_medication INTEGER DEFAULT 1,
      allow_activity INTEGER DEFAULT 1,
      allow_vitals INTEGER DEFAULT 1,
      allow_alerts INTEGER DEFAULT 1,
      allow_full_history INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_patient_id TEXT NOT NULL,
      old_val TEXT,
      new_val TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck.count > 0) return;

  console.log('Seeding initial demo data for VitalCare...');

  // 1. Users
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, name) VALUES 
    ('usr-pat-1', 'rahul.sharma@vitalcare.demo', '$2a$10$xyz123hash', 'patient', 'Rahul Sharma'),
    ('usr-doc-1', 'dr.ananya@vitalcare.demo', '$2a$10$xyz123hash', 'doctor', 'Dr. Ananya Rao'),
    ('usr-cg-1', 'priya.sharma@vitalcare.demo', '$2a$10$xyz123hash', 'caregiver', 'Priya Sharma')
  `).run();

  // 2. Doctor & Patient Profile
  db.prepare(`
    INSERT INTO doctors (id, user_id, specialization, hospital, license_no) VALUES 
    ('doc-1', 'usr-doc-1', 'Cardiology & Internal Medicine', 'City Health Institute', 'MED-CAR-88219')
  `).run();

  db.prepare(`
    INSERT INTO patients (id, user_id, age, gender, height, weight, bmi, blood_group, allergies, existing_conditions, previous_surgeries, family_history, dietary_preferences, doctor_id) VALUES 
    ('pat-1', 'usr-pat-1', 52, 'Male', 175.0, 78.5, 25.6, 'B+', 'Penicillin, Shellfish', 'Hypertension, Mild Hyperlipidemia', 'Appendectomy (2018)', 'Father: Coronary Artery Disease, Mother: Type 2 Diabetes', 'Low Sodium, High Fiber, Mediterranean', 'doc-1')
  `).run();

  // 3. Caregiver
  db.prepare(`
    INSERT INTO caregivers (id, user_id, patient_id, relationship) VALUES 
    ('cg-1', 'usr-cg-1', 'pat-1', 'Daughter')
  `).run();

  // 4. Doctor Restrictions & Controls
  db.prepare(`
    INSERT INTO doctor_restrictions (id, patient_id, doctor_id, diet_restrictions, exercise_restrictions, max_exercise_hr, bp_systolic_threshold, bp_diastolic_threshold, max_daily_fluid_l, sodium_limit_mg) VALUES 
    ('dr-1', 'pat-1', 'doc-1', 'Strict sodium limit under 2000mg/day. Avoid heavy fried foods. High potassium veggies recommended.', 'No heavy weightlifting or high-impact sprinting. Moderate aerobic walking or light cycling only.', 130, 140, 90, 2.2, 2000)
  `).run();

  // 5. Medical Conditions
  db.prepare(`
    INSERT INTO medical_conditions (id, patient_id, condition_name, diagnosed_date, status, notes) VALUES
    ('mc-1', 'pat-1', 'Essential Hypertension', '2024-03-15', 'Active - Monitored', 'Controlled with Lisinopril 10mg daily and dietary sodium limit'),
    ('mc-2', 'pat-1', 'Mild Hyperlipidemia', '2024-11-02', 'Active - Managed', 'Statins initiated, lifestyle and dietary lipid management'),
    ('mc-3', 'pat-1', 'Clinician Cardiac Monitoring', '2025-01-10', 'Active', 'Post-effort heart rate tracking and resting baseline monitoring')
  `).run();

  // 6. Medical History Timeline
  db.prepare(`
    INSERT INTO medical_history (id, patient_id, event_year, event_title, category, details, date_recorded) VALUES
    ('mh-1', 'pat-1', 2024, 'Hypertension Diagnosed', 'Condition', 'Elevated BP recorded during annual checkup (144/92 mmHg).', '2024-03-15'),
    ('mh-2', 'pat-1', 2024, 'Lisinopril 10mg Initiated', 'Medication', 'Daily morning antihypertensive therapy prescribed by Dr. Ananya.', '2024-03-20'),
    ('mh-3', 'pat-1', 2025, 'Comprehensive Blood Panel Uploaded', 'Report', 'Lipid panel showed total cholesterol 210 mg/dL, LDL 132 mg/dL.', '2025-01-12'),
    ('mh-4', 'pat-1', 2025, 'Atorvastatin 10mg Prescribed', 'Medication', 'Evening statin regimen added for lipid control.', '2025-01-15'),
    ('mh-5', 'pat-1', 2026, 'Q1 Clinical Assessment', 'Assessment', 'BP stable at 128/82 mmHg. Resting heart rate average 74 BPM.', '2026-02-01')
  `).run();

  // 7. Medical Reports & Extracted Values
  db.prepare(`
    INSERT INTO medical_reports (id, patient_id, report_name, file_type, file_path, upload_date, status) VALUES
    ('mr-1', 'pat-1', 'Comprehensive_Lab_Panel_Jan2026.pdf', 'PDF', '/uploads/reports/lab_jan2026.pdf', '2026-01-15', 'Processed'),
    ('mr-2', 'pat-1', 'ECG_Resting_Assessment_Feb2026.png', 'PNG', '/uploads/reports/ecg_feb2026.png', '2026-02-01', 'Processed')
  `).run();

  db.prepare(`
    INSERT INTO report_values (id, report_id, test_name, value, unit, ref_range, status_indicator) VALUES
    ('rv-1', 'mr-1', 'Hemoglobin', '14.8', 'g/dL', '13.5 - 17.5', 'Normal'),
    ('rv-2', 'mr-1', 'Fasting Blood Glucose', '96', 'mg/dL', '70 - 99', 'Normal'),
    ('rv-3', 'mr-1', 'HbA1c', '5.5', '%', '4.0 - 5.6', 'Normal'),
    ('rv-4', 'mr-1', 'Total Cholesterol', '192', 'mg/dL', '< 200', 'Normal'),
    ('rv-5', 'mr-1', 'LDL Cholesterol', '118', 'mg/dL', '< 100', 'Attention'),
    ('rv-6', 'mr-1', 'HDL Cholesterol', '48', 'mg/dL', '> 40', 'Normal'),
    ('rv-7', 'mr-1', 'Triglycerides', '135', 'mg/dL', '< 150', 'Normal'),
    ('rv-8', 'mr-1', 'Serum Creatinine', '0.9', 'mg/dL', '0.7 - 1.3', 'Normal'),
    ('rv-9', 'mr-2', 'Resting Heart Rate', '72', 'BPM', '60 - 100', 'Normal'),
    ('rv-10', 'mr-2', 'QTc Interval', '412', 'ms', '390 - 450', 'Normal')
  `).run();

  // 8. Medications & Today's Logs
  db.prepare(`
    INSERT INTO medications (id, patient_id, medicine_name, dosage, frequency, timing_instructions, prescribed_by) VALUES
    ('med-1', 'pat-1', 'Lisinopril', '10 mg', 'Once daily', 'Take at 08:00 AM after breakfast with water', 'Dr. Ananya Rao'),
    ('med-2', 'pat-1', 'Atorvastatin', '10 mg', 'Once daily', 'Take at 09:00 PM before bedtime', 'Dr. Ananya Rao'),
    ('med-3', 'pat-1', 'Omega-3 Fish Oil', '1000 mg', 'Once daily', 'Take at 02:00 PM with lunch', 'Dr. Ananya Rao')
  `).run();

  const todayStr = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO medication_logs (id, medication_id, patient_id, scheduled_time, taken_at, status) VALUES
    ('ml-1', 'med-1', 'pat-1', '08:00 AM', '${todayStr} 08:05:00', 'taken'),
    ('ml-2', 'med-3', 'pat-1', '02:00 PM', '${todayStr} 02:10:00', 'taken'),
    ('ml-3', 'med-2', 'pat-1', '09:00 PM', NULL, 'pending')
  `).run();

  // 9. Historical Vitals (Simulating 30 days of data + Current)
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 19);
    const hr = 74 + Math.floor(Math.sin(i) * 4);
    const rhr = 68 + Math.floor(Math.cos(i) * 3);
    const spo2 = 98 - (i % 2);
    const bpSys = 126 + Math.floor(Math.sin(i * 0.5) * 5);
    const bpDia = 82 + Math.floor(Math.cos(i * 0.5) * 4);
    const glu = 94 + (i % 5);
    const w = 78.5 - (i * 0.05);

    db.prepare(`
      INSERT INTO vitals (id, patient_id, heart_rate, resting_hr, spo2, bp_systolic, bp_diastolic, glucose, weight, timestamp, is_demo)
      VALUES (?, 'pat-1', ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(`vit-hist-${i}`, hr, rhr, spo2, bpSys, bpDia, glu, Number(w.toFixed(1)), dateStr);
  }

  // 10. Wearable Data & Sleep
  db.prepare(`
    INSERT INTO wearable_data (id, patient_id, device_name, steps, calories, sleep_seconds, hrv, resp_rate, timestamp) VALUES
    ('wear-1', 'pat-1', 'Apple Watch Series 9', 4230, 480, 25920, 42, 14, CURRENT_TIMESTAMP)
  `).run();

  db.prepare(`
    INSERT INTO sleep_records (id, patient_id, date, duration_hours, deep_sleep_hours, consistency_score, interruptions, recovery_score) VALUES
    ('slp-1', 'pat-1', '${todayStr}', 7.2, 1.8, 88, 1, 85)
  `).run();

  // 11. Water Log
  db.prepare(`
    INSERT INTO water_logs (id, patient_id, date, amount_liters) VALUES
    ('wtr-1', 'pat-1', '${todayStr}', 1.6)
  `).run();

  // 12. Nutrition Plan & Exercise Plan for Today
  db.prepare(`
    INSERT INTO nutrition_plans (id, patient_id, date, breakfast_item, breakfast_portion, breakfast_calories, lunch_item, lunch_portion, lunch_calories, snack_item, snack_portion, snack_calories, dinner_item, dinner_portion, dinner_calories, target_calories, target_protein, target_carbs, target_fat, target_fiber, target_water_l) VALUES
    ('np-1', 'pat-1', '${todayStr}', 
     'Oatmeal with Almonds, Chia Seeds & Sliced Banana', '1 Bowl (350g)', 380,
     'Grilled Mediterranean Chicken Breast with Quinoa & Steamed Broccoli', '1 Plate (450g)', 520,
     'Roasted Unsalted Pumpkin Seeds & Green Apple', '1 Handful (120g)', 180,
     'Baked Wild Salmon Filet with Roasted Asparagus & Sweet Potato Mash', '1 Serving (400g)', 490,
     1900, 115, 210, 55, 32, 2.2)
  `).run();

  db.prepare(`
    INSERT INTO exercise_plans (id, patient_id, date, activity_name, duration_mins, intensity, warm_up_mins, cool_down_mins, rest_mins) VALUES
    ('ep-1', 'pat-1', '${todayStr}', 'Brisk Aerobic Walking & Light Stretching', 25, 'Low-Moderate (Keep HR < 125 BPM)', 5, 5, 10)
  `).run();

  // 13. Daily Plan Record
  db.prepare(`
    INSERT INTO daily_plans (id, patient_id, date, wellness_score, sleep_window, notes) VALUES
    ('dp-1', 'pat-1', '${todayStr}', 82, '10:30 PM — 06:15 AM', 'Optimal recovery score. Stay hydrated and follow daily 2.0L sodium-conscious meal plan.')
  `).run();

  // 14. Emergency Contacts
  db.prepare(`
    INSERT INTO emergency_contacts (id, patient_id, contact_name, relationship, phone, is_primary) VALUES
    ('ec-1', 'pat-1', 'Priya Sharma', 'Daughter', '+1 (555) 382-9102', 1),
    ('ec-2', 'pat-1', 'Dr. Ananya Rao', 'Primary Physician', '+1 (555) 901-4433', 0)
  `).run();

  // 15. Caregiver Consents
  db.prepare(`
    INSERT INTO consents (id, patient_id, caregiver_id, allow_medication, allow_activity, allow_vitals, allow_alerts, allow_full_history) VALUES
    ('cs-1', 'pat-1', 'cg-1', 1, 1, 1, 1, 0)
  `).run();

  // 16. Health Alerts
  db.prepare(`
    INSERT INTO health_alerts (id, patient_id, severity, title, message, is_read) VALUES
    ('alt-1', 'pat-1', 'info', 'Medication Schedule Sync', 'Your 08:00 AM Lisinopril dose was logged on time.', 1),
    ('alt-2', 'pat-1', 'attention', 'Hydration Target Reminder', 'You have consumed 1.6L of water out of your 2.2L daily limit.', 0)
  `).run();

  // 17. AI Assistant Baseline Conversation
  db.prepare(`
    INSERT INTO ai_conversations (id, patient_id, sender, message) VALUES
    ('aic-1', 'pat-1', 'assistant', 'Hello Rahul! I am your VitalCare AI assistant. How can I help you with your health plan, nutrition, or vitals today?')
  `).run();

  console.log('Demo data seeded successfully!');
}

export default db;
