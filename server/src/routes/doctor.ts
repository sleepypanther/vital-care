import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/doctor/patients
router.get('/patients', (req: Request, res: Response) => {
  try {
    const patients = db.prepare(`
      SELECT p.*, u.name, u.email,
             (SELECT heart_rate FROM vitals WHERE patient_id = p.id ORDER BY timestamp DESC LIMIT 1) as latest_hr,
             (SELECT bp_systolic FROM vitals WHERE patient_id = p.id ORDER BY timestamp DESC LIMIT 1) as latest_bp_sys,
             (SELECT bp_diastolic FROM vitals WHERE patient_id = p.id ORDER BY timestamp DESC LIMIT 1) as latest_bp_dia,
             (SELECT spo2 FROM vitals WHERE patient_id = p.id ORDER BY timestamp DESC LIMIT 1) as latest_spo2,
             (SELECT severity FROM health_alerts WHERE patient_id = p.id AND is_read = 0 ORDER BY timestamp DESC LIMIT 1) as alert_status
      FROM patients p
      JOIN users u ON p.user_id = u.id
    `).all() as any[];

    const enrichedPatients = patients.map(pat => {
      const logs = db.prepare('SELECT status FROM medication_logs WHERE patient_id = ?').all(pat.id) as any[];
      const total = logs.length || 1;
      const taken = logs.filter(l => l.status === 'taken').length;
      const adherence = Math.round((taken / total) * 100);

      return {
        ...pat,
        adherence,
        latestVitals: {
          hr: pat.latest_hr || 74,
          bp: pat.latest_bp_sys ? `${pat.latest_bp_sys}/${pat.latest_bp_dia}` : '126/82',
          spo2: pat.latest_spo2 || 98
        },
        alertStatus: pat.alert_status || 'normal'
      };
    });

    res.json({
      success: true,
      stats: {
        totalPatients: enrichedPatients.length,
        requiringReview: enrichedPatients.filter(p => p.alertStatus === 'urgent' || p.alertStatus === 'attention').length,
        recentAlerts: db.prepare('SELECT COUNT(*) as c FROM health_alerts WHERE is_read = 0').get() as any,
        avgAdherence: Math.round(enrichedPatients.reduce((a, b) => a + b.adherence, 0) / (enrichedPatients.length || 1))
      },
      patients: enrichedPatients
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctor/patient/:id
router.get('/patient/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = db.prepare(`
      SELECT p.*, u.name, u.email 
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(id);
    const conditions = db.prepare('SELECT * FROM medical_conditions WHERE patient_id = ?').all(id);
    const history = db.prepare('SELECT * FROM medical_history WHERE patient_id = ? ORDER BY event_year DESC').all(id);
    const reports = db.prepare('SELECT * FROM medical_reports WHERE patient_id = ?').all(id);
    const medications = db.prepare('SELECT * FROM medications WHERE patient_id = ?').all(id);
    const recentVitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 30').all(id);
    const auditLogs = db.prepare('SELECT * FROM audit_logs WHERE target_patient_id = ? ORDER BY timestamp DESC').all(id);

    res.json({
      success: true,
      patient,
      restrictions,
      conditions,
      history,
      reports,
      medications,
      recentVitals,
      auditLogs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doctor/restrictions/:patientId (Configuring Restrictions with Audit Trail)
router.post('/restrictions/:patientId', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.body.doctorId || req.body.doctor_id || 'doc-1';
    const dietRestrictions = req.body.dietRestrictions ?? req.body.diet_restrictions ?? '';
    const exerciseRestrictions = req.body.exerciseRestrictions ?? req.body.exercise_restrictions ?? '';
    const maxExerciseHr = req.body.maxExerciseHr ?? req.body.max_exercise_hr ?? 130;
    const bpSystolicThreshold = req.body.bpSystolicThreshold ?? req.body.bp_systolic_threshold ?? 140;
    const bpDiastolicThreshold = req.body.bpDiastolicThreshold ?? req.body.bp_diastolic_threshold ?? 90;
    const maxDailyFluidL = req.body.maxDailyFluidL ?? req.body.max_daily_fluid_l ?? 2.2;
    const sodiumLimitMg = req.body.sodiumLimitMg ?? req.body.sodium_limit_mg ?? 2000;

    const oldVal = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;

    const newValObj = {
      diet_restrictions: dietRestrictions,
      exercise_restrictions: exerciseRestrictions,
      max_exercise_hr: maxExerciseHr,
      bp_systolic_threshold: bpSystolicThreshold,
      bp_diastolic_threshold: bpDiastolicThreshold,
      max_daily_fluid_l: maxDailyFluidL,
      sodium_limit_mg: sodiumLimitMg
    };

    if (oldVal) {
      db.prepare(`
        UPDATE doctor_restrictions SET
          diet_restrictions = ?,
          exercise_restrictions = ?,
          max_exercise_hr = ?,
          bp_systolic_threshold = ?,
          bp_diastolic_threshold = ?,
          max_daily_fluid_l = ?,
          sodium_limit_mg = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `).run(dietRestrictions, exerciseRestrictions, maxExerciseHr, bpSystolicThreshold, bpDiastolicThreshold, maxDailyFluidL, sodiumLimitMg, patientId);
    } else {
      const id = `dr-${Date.now()}`;
      db.prepare(`
        INSERT INTO doctor_restrictions (id, patient_id, doctor_id, diet_restrictions, exercise_restrictions, max_exercise_hr, bp_systolic_threshold, bp_diastolic_threshold, max_daily_fluid_l, sodium_limit_mg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, patientId, doctorId, dietRestrictions, exerciseRestrictions, maxExerciseHr, bpSystolicThreshold, bpDiastolicThreshold, maxDailyFluidL, sodiumLimitMg);
    }

    // Write Audit Log
    const auditId = `aud-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_role, action, target_patient_id, old_val, new_val)
      VALUES (?, ?, 'doctor', 'UPDATE_CLINICAL_RESTRICTIONS', ?, ?, ?)
    `).run(auditId, doctorId, patientId, JSON.stringify(oldVal || {}), JSON.stringify(newValObj));

    res.json({
      success: true,
      message: 'Clinical restrictions updated successfully and recorded in audit log',
      auditId
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctor/audit-logs
router.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
