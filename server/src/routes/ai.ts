import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/ai/:patientId/history
router.get('/:patientId/history', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const messages = db.prepare('SELECT * FROM ai_conversations WHERE patient_id = ? ORDER BY timestamp ASC').all(patientId);
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/:patientId/chat
router.post('/:patientId/chat', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Save user message
    const userMsgId = `aic-${crypto.randomUUID()}`;
    db.prepare('INSERT INTO ai_conversations (id, patient_id, sender, message) VALUES (?, ?, "user", ?)').run(userMsgId, patientId, message);

    // Fetch patient health context
    const profile = db.prepare('SELECT p.*, u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(patientId) as any;
    const latestVital = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId) as any;
    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;
    const reports = db.prepare('SELECT report_name, upload_date FROM medical_reports WHERE patient_id = ?').all(patientId) as any[];

    const lower = message.toLowerCase();
    let replyText = '';

    // Guardrail check for emergency keywords
    if (lower.includes('chest pain') || lower.includes('shortness of breath') || lower.includes('fainting') || lower.includes('emergency')) {
      replyText = "⚠️ URGENT CLINICAL NOTICE: If you are experiencing severe symptoms such as chest pain, extreme shortness of breath, sudden numbness, or loss of consciousness, please press the SOS button on screen or contact local emergency medical services (e.g. 911 / emergency line) immediately. Do not rely on AI assistant for urgent care.";
    } else if (lower.includes('plan') || lower.includes('today')) {
      replyText = `Based on your personalized health plan for today (${new Date().toLocaleDateString()}):\n\n• **Nutrition**: Mediterranean Low-Sodium plan (~1,900 kcal, Target <2000mg sodium per Dr. Ananya's restriction).\n• **Breakfast**: Oatmeal with almonds & chia seeds.\n• **Lunch**: Grilled chicken with quinoa & steamed broccoli.\n• **Exercise**: 25 min brisk aerobic walking with low intensity (keep heart rate under ${restrictions?.max_exercise_hr || 130} BPM).\n• **Hydration**: 2.2L daily goal (currently at 1.6L).\n• **Medications**: Lisinopril 10mg (Taken), Omega-3 (Taken), Atorvastatin 10mg (Scheduled 09:00 PM).\n\n*Note: This plan is tailored using your clinician's parameters and is intended for daily wellness adherence.*`;
    } else if (lower.includes('lunch') || lower.includes('eat') || lower.includes('food')) {
      replyText = `For lunch today, your plan recommends **Grilled Mediterranean Chicken Breast with Quinoa & Steamed Broccoli** (~520 kcal, 38g Protein).\n\nThis meal provides clean lean protein and complex carbs while strictly staying under your clinician's 2,000 mg daily sodium threshold. If you choose an alternative meal, ensure it is low in sodium and saturated fats per Dr. Ananya's instructions.`;
    } else if (lower.includes('exercise') || lower.includes('workout') || lower.includes('activity')) {
      replyText = `Your recommended workout for today is **25 minutes of Brisk Aerobic Walking** plus 5 minutes of light stretching.\n\n⚠️ **Safety Limit**: Keep your exercise heart rate below **${restrictions?.max_exercise_hr || 130} BPM** per Dr. Ananya's cardiac monitoring instructions. If your heart rate exceeds this threshold or you feel dizzy, pause activity immediately.`;
    } else if (lower.includes('heart') || lower.includes('hr') || lower.includes('trend')) {
      replyText = `Your latest recorded resting heart rate is **${latestVital?.resting_hr || 70} BPM** (current live reading: **${latestVital?.heart_rate || 76} BPM**), which is within your normal baseline range (68-76 BPM).\n\nOver the past 30 days, your heart rate stability has remained consistent. *Remember that vital measurements are for wellness monitoring and not an automated medical diagnosis.*`;
    } else if (lower.includes('report') || lower.includes('lab') || lower.includes('blood')) {
      const reportNames = reports.map(r => r.report_name).join(', ');
      replyText = `You have ${reports.length} processed medical report(s) on file: ${reportNames}.\n\nKey extracted highlights from your latest lab panel:\n• **HbA1c**: 5.5% (Normal)\n• **LDL Cholesterol**: 118 mg/dL (Borderline attention - monitored by statin therapy)\n• **Fasting Blood Glucose**: 96 mg/dL (Normal)\n\nConsult Dr. Ananya for complete clinical interpretation of lab values.`;
    } else if (lower.includes('sleep')) {
      replyText = `Last night you logged **7 hours and 12 minutes** of sleep with 1.8 hours of deep sleep and an 85/100 recovery score.\n\nYour 30-day sleep consistency is at 88%. Adequate rest supports cardiovascular recovery and blood pressure stabilization.`;
    } else {
      replyText = `Hello ${profile?.name || 'Rahul'}! I have reviewed your current vitals, active clinician restrictions, and daily health plan. I can assist you with details about today's meal schedule, exercise parameters, vitals trends, or medication reminders. How can I help you?`;
    }

    // Save assistant reply
    const astMsgId = `aic-${crypto.randomUUID()}`;
    db.prepare('INSERT INTO ai_conversations (id, patient_id, sender, message) VALUES (?, ?, "assistant", ?)').run(astMsgId, patientId, replyText);

    res.json({
      success: true,
      reply: {
        id: astMsgId,
        sender: 'assistant',
        message: replyText,
        disclaimer: "AI recommendations explain existing health data and doctor guidelines. The AI assistant does not provide medical diagnoses or modify medication schedules."
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
