import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// GET /api/medications/:patientId
router.get('/:patientId', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const medications = db.prepare('SELECT * FROM medications WHERE patient_id = ?').all(patientId) as any[];
    const todayStr = new Date().toISOString().split('T')[0];

    const logs = db.prepare('SELECT * FROM medication_logs WHERE patient_id = ?').all(patientId) as any[];

    // Calculate adherence percentage
    const totalLogs = logs.length || 1;
    const takenLogs = logs.filter(l => l.status === 'taken').length;
    const adherencePercent = Math.round((takenLogs / totalLogs) * 100);

    res.json({
      success: true,
      medications,
      logs,
      adherencePercent
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/medications/:patientId/toggle-log
router.post('/:patientId/toggle-log', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { medicationId, status } = req.body; // 'taken' or 'missed' or 'pending'
    const todayStr = new Date().toISOString().split('T')[0];

    const existingLog = db.prepare(`
      SELECT * FROM medication_logs 
      WHERE medication_id = ? AND patient_id = ?
    `).get(medicationId, patientId) as any;

    const takenAt = status === 'taken' ? new Date().toISOString() : null;

    if (existingLog) {
      db.prepare(`
        UPDATE medication_logs SET status = ?, taken_at = ? WHERE id = ?
      `).run(status, takenAt, existingLog.id);
    } else {
      const id = `mlog-${Date.now()}`;
      db.prepare(`
        INSERT INTO medication_logs (id, medication_id, patient_id, scheduled_time, taken_at, status)
        VALUES (?, ?, ?, '08:00 AM', ?, ?)
      `).run(id, medicationId, patientId, takenAt, status);
    }

    res.json({ success: true, medicationId, status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
