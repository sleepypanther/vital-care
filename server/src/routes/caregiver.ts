import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// GET /api/caregiver/:patientId/view
router.get('/:patientId/view', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const consents = db.prepare('SELECT * FROM consents WHERE patient_id = ?').get(patientId) as any;
    const patientProfile = db.prepare('SELECT u.name, p.age, p.blood_group FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(patientId) as any;

    if (!consents) {
      return res.status(403).json({ success: false, message: 'No caregiver permissions configured for this patient' });
    }

    const payload: any = {
      patientName: patientProfile?.name || 'Patient',
      consents
    };

    if (consents.allow_vitals) {
      payload.latestVital = db.prepare('SELECT heart_rate, spo2, bp_systolic, bp_diastolic, timestamp FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId);
    }

    if (consents.allow_medication) {
      payload.medicationAdherence = db.prepare(`
        SELECT m.medicine_name, m.dosage, m.timing_instructions, ml.status, ml.taken_at
        FROM medications m
        LEFT JOIN medication_logs ml ON m.id = ml.medication_id
        WHERE m.patient_id = ?
      `).all(patientId);
    }

    if (consents.allow_activity) {
      payload.activitySummary = db.prepare('SELECT steps, calories, sleep_seconds FROM wearable_data WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId);
    }

    if (consents.allow_alerts) {
      payload.recentAlerts = db.prepare('SELECT * FROM health_alerts WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 5').all(patientId);
    }

    if (consents.allow_full_history) {
      payload.fullMedicalHistory = db.prepare('SELECT * FROM medical_history WHERE patient_id = ? ORDER BY date_recorded DESC').all(patientId);
    } else {
      payload.fullMedicalHistoryHidden = true;
    }

    res.json({ success: true, caregiverView: payload });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/caregiver/:patientId/consent (Patient managing consent permissions)
router.post('/:patientId/consent', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { allow_medication, allow_activity, allow_vitals, allow_alerts, allow_full_history } = req.body;

    db.prepare(`
      UPDATE consents SET
        allow_medication = ?,
        allow_activity = ?,
        allow_vitals = ?,
        allow_alerts = ?,
        allow_full_history = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?
    `).run(
      allow_medication ? 1 : 0,
      allow_activity ? 1 : 0,
      allow_vitals ? 1 : 0,
      allow_alerts ? 1 : 0,
      allow_full_history ? 1 : 0,
      patientId
    );

    res.json({ success: true, message: 'Caregiver access permissions updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
