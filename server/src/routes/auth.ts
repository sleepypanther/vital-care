import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

// GET /api/auth/roles - list demo users for easy role switching
router.get('/roles', (req: Request, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, COALESCE(p.id, c.patient_id) as patient_id, d.id as doctor_id, c.id as caregiver_id
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN doctors d ON u.id = d.user_id
      LEFT JOIN caregivers c ON u.id = c.user_id
    `).all();
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.get('/me/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, COALESCE(p.id, c.patient_id) as patient_id, d.id as doctor_id, c.id as caregiver_id
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN doctors d ON u.id = d.user_id
      LEFT JOIN caregivers c ON u.id = c.user_id
      WHERE u.id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
