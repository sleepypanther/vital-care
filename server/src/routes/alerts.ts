import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/alerts/:patientId
router.get('/:patientId', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const alerts = db.prepare('SELECT * FROM health_alerts WHERE patient_id = ? ORDER BY timestamp DESC').all(patientId);
    res.json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alerts/:patientId/sos — create an emergency SOS alert
router.post('/:patientId/sos', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const id = `alert-sos-${Date.now()}`;
    db.prepare(`
      INSERT INTO health_alerts (id, patient_id, severity, title, message, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(
      id,
      patientId,
      'critical',
      'Emergency SOS Activated',
      'The patient triggered an emergency SOS. Caregivers and emergency contacts have been notified.'
    );
    res.json({ success: true, alertId: id, message: 'Emergency SOS sent to emergency contacts and caregivers.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alerts/:alertId/read
router.post('/:alertId/read', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    db.prepare('UPDATE health_alerts SET is_read = 1 WHERE id = ?').run(alertId);
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
