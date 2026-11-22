import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// GET /api/patient/:id/profile
router.get('/:id/profile', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = db.prepare(`
      SELECT p.*, u.name, u.email, d.user_id as doctor_user_id, du.name as doctor_name
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN doctors d ON p.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE p.id = ?
    `).get(id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const emergencyContacts = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id = ?').all(id);
    const doctorRestrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(id);
    const conditions = db.prepare('SELECT * FROM medical_conditions WHERE patient_id = ?').all(id);

    res.json({
      success: true,
      patient: {
        ...patient,
        emergencyContacts,
        doctorRestrictions,
        conditions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/patient/:id/history
router.get('/:id/history', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = db.prepare('SELECT * FROM medical_history WHERE patient_id = ? ORDER BY event_year DESC, date_recorded DESC').all(id);
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/patient/:id/emergency
router.get('/:id/emergency', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id = ?').all(id);
    const latestVital = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(id);
    const profile = db.prepare('SELECT age, blood_group, allergies, existing_conditions FROM patients WHERE id = ?').get(id);

    res.json({
      success: true,
      contacts,
      latestVital,
      profile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
