import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/vitals/:patientId/current
router.get('/:patientId/current', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const latestVital = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId) as any;
    const wearable = db.prepare('SELECT * FROM wearable_data WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId) as any;
    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;

    if (!latestVital) {
      return res.status(404).json({ success: false, message: 'No vitals recorded' });
    }

    let isWarning = false;
    let warningMsg = '';

    if (restrictions) {
      if (latestVital.heart_rate > restrictions.max_exercise_hr) {
        isWarning = true;
        warningMsg = `Heart rate (${latestVital.heart_rate} BPM) exceeds clinician maximum limit (${restrictions.max_exercise_hr} BPM). Stop physical effort and follow clinician guidance. Seek urgent care if symptomatic.`;
      } else if (latestVital.bp_systolic && (latestVital.bp_systolic >= restrictions.bp_systolic_threshold || latestVital.bp_diastolic >= restrictions.bp_diastolic_threshold)) {
        isWarning = true;
        warningMsg = `Blood pressure (${latestVital.bp_systolic}/${latestVital.bp_diastolic} mmHg) is above clinician threshold (${restrictions.bp_systolic_threshold}/${restrictions.bp_diastolic_threshold} mmHg). Rest and monitor.`;
      }
    }

    res.json({
      success: true,
      vital: latestVital,
      wearable,
      restrictions,
      warning: isWarning ? { isWarning, warningMsg } : null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vitals/:patientId/wearable — fetch latest wearable/steps/HRV data
router.get('/:patientId/wearable', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const wearable = db.prepare('SELECT * FROM wearable_data WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patientId) as any;
    res.json({ success: true, wearable: wearable || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vitals/:patientId/sleep — fetch today's sleep record
router.get('/:patientId/sleep', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const sleep = db.prepare('SELECT * FROM sleep_records WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    // Fallback: get most recent sleep record if today's not found
    const recent = sleep || db.prepare('SELECT * FROM sleep_records WHERE patient_id = ? ORDER BY date DESC LIMIT 1').get(patientId) as any;
    res.json({ success: true, sleep: recent || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vitals/:patientId/trends?timeframe=7D|30D|3M|6M|1Y
router.get('/:patientId/trends', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { timeframe = '30D' } = req.query;

    let limit = 30;
    if (timeframe === '7D') limit = 7;
    if (timeframe === '30D') limit = 30;
    if (timeframe === '3M') limit = 90;
    if (timeframe === '6M') limit = 180;
    if (timeframe === '1Y') limit = 365;

    const history = db.prepare(`
      SELECT * FROM vitals 
      WHERE patient_id = ? 
      ORDER BY timestamp ASC 
      LIMIT ?
    `).all(patientId, limit) as any[];

    let anomalyNote = null;
    if (history.length >= 7) {
      const recent = history.slice(-3);
      const past = history.slice(0, history.length - 3);

      const avgRecentHR = recent.reduce((acc, v) => acc + (v.resting_hr ?? v.heart_rate ?? 0), 0) / recent.length;
      const avgPastHR = past.reduce((acc, v) => acc + (v.resting_hr ?? v.heart_rate ?? 0), 0) / past.length;

      if (avgRecentHR - avgPastHR >= 4) {
        anomalyNote = `Notice: Your resting heart rate (${avgRecentHR.toFixed(0)} BPM) has been elevated above your usual baseline (${avgPastHR.toFixed(0)} BPM) over the last 3 days.`;
      }
    }

    res.json({
      success: true,
      timeframe,
      history,
      anomalyNote
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vitals/:patientId/demo-update — Simulator / Manual entry
router.post('/:patientId/demo-update', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { heartRate, restingHr, spo2, bpSystolic, bpDiastolic, glucose, weight, steps, sleepHours } = req.body;

    const id = `vit-demo-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO vitals (id, patient_id, heart_rate, resting_hr, spo2, bp_systolic, bp_diastolic, glucose, weight, source, timestamp, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo', ?, 1)
    `).run(id, patientId, heartRate || 76, restingHr || 70, spo2 || 98, bpSystolic || 126, bpDiastolic || 82, glucose || 96, weight || 78.5, nowStr);

    if (steps !== undefined) {
      db.prepare(`
        UPDATE wearable_data SET steps = ?, timestamp = CURRENT_TIMESTAMP WHERE patient_id = ?
      `).run(steps, patientId);
    }

    if (sleepHours !== undefined) {
      const todayStr = new Date().toISOString().split('T')[0];
      db.prepare(`
        UPDATE sleep_records SET duration_hours = ? WHERE patient_id = ? AND date = ?
      `).run(sleepHours, patientId, todayStr);
    }

    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;
    if (restrictions && heartRate > restrictions.max_exercise_hr) {
      const alertId = `alt-${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO health_alerts (id, patient_id, severity, title, message)
        VALUES (?, ?, 'urgent', 'Elevated Heart Rate Threshold Alert', ?)
      `).run(alertId, patientId, `Live heart rate reading (${heartRate} BPM) exceeded clinician limit of ${restrictions.max_exercise_hr} BPM.`);
    }

    res.json({ success: true, message: 'Demo vitals updated successfully', vitalId: id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vitals/:patientId/real-update — REAL sensor data (Bluetooth / Camera / HealthKit)
// Only saves the fields that are actually provided — no fake fallbacks
router.post('/:patientId/real-update', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const {
      source = 'bluetooth', // 'bluetooth' | 'camera' | 'healthkit' | 'manual'
      heartRate,
      restingHr,
      spo2,
      bpSystolic,
      bpDiastolic,
      glucose,
      weight,
      steps,
      calories,
      hrv,
      respRate,
      sleepHours,
      deviceName
    } = req.body;

    if (!heartRate) {
      return res.status(400).json({ success: false, message: 'heartRate is required' });
    }

    const id = `vit-real-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Only insert fields that were actually measured — NULL for unmeasured fields
    db.prepare(`
      INSERT INTO vitals (id, patient_id, heart_rate, resting_hr, spo2, bp_systolic, bp_diastolic, glucose, weight, source, timestamp, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      id,
      patientId,
      heartRate,
      restingHr || null,
      spo2 || null,
      bpSystolic || null,
      bpDiastolic || null,
      glucose || null,
      weight || null,
      source,
      nowStr
    );

    // Update wearable_data if steps or HRV data provided
    if (steps !== undefined || hrv !== undefined || respRate !== undefined || calories !== undefined) {
      const wearId = `wear-real-${Date.now()}`;
      const existingWear = db.prepare('SELECT id FROM wearable_data WHERE patient_id = ?').get(patientId) as any;
      
      if (existingWear) {
        db.prepare(`
          UPDATE wearable_data SET 
            device_name = COALESCE(?, device_name),
            steps = COALESCE(?, steps),
            calories = COALESCE(?, calories),
            hrv = COALESCE(?, hrv),
            resp_rate = COALESCE(?, resp_rate),
            timestamp = CURRENT_TIMESTAMP
          WHERE patient_id = ?
        `).run(deviceName || null, steps || null, calories || null, hrv || null, respRate || null, patientId);
      } else {
        db.prepare(`
          INSERT INTO wearable_data (id, patient_id, device_name, steps, calories, sleep_seconds, hrv, resp_rate, timestamp)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP)
        `).run(wearId, patientId, deviceName || 'Unknown Device', steps || 0, calories || 0, hrv || 0, respRate || 0);
      }
    }

    // Update sleep if provided
    if (sleepHours !== undefined) {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingSleep = db.prepare('SELECT id FROM sleep_records WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
      if (existingSleep) {
        db.prepare('UPDATE sleep_records SET duration_hours = ? WHERE patient_id = ? AND date = ?').run(sleepHours, patientId, todayStr);
      } else {
        db.prepare(`
          INSERT INTO sleep_records (id, patient_id, date, duration_hours, deep_sleep_hours, consistency_score, interruptions, recovery_score)
          VALUES (?, ?, ?, ?, 0, 0, 0, 0)
        `).run(`slp-real-${Date.now()}`, patientId, todayStr, sleepHours);
      }
    }

    // Check doctor threshold alert
    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;
    if (restrictions && heartRate > restrictions.max_exercise_hr) {
      const alertId = `alt-${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO health_alerts (id, patient_id, severity, title, message)
        VALUES (?, ?, 'urgent', 'Live Sensor Alert', ?)
      `).run(alertId, patientId, `${source.charAt(0).toUpperCase() + source.slice(1)} sensor detected HR (${heartRate} BPM) exceeding clinician limit (${restrictions.max_exercise_hr} BPM).`);
    }

    res.json({
      success: true,
      message: `Real sensor data saved from ${source}`,
      vitalId: id,
      timestamp: nowStr,
      savedFields: {
        heartRate: true,
        restingHr: restingHr != null,
        spo2: spo2 != null,
        bpSystolic: bpSystolic != null,
        bpDiastolic: bpDiastolic != null,
        glucose: glucose != null
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vitals/:patientId/healthkit-sync (Apple Watch & HealthKit Webhook)
router.post('/:patientId/healthkit-sync', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const {
      deviceName = 'Apple Watch',
      heartRate,
      restingHr,
      spo2,
      bpSystolic,
      bpDiastolic,
      glucose,
      steps,
      hrv,
      respRate,
      sleepSeconds
    } = req.body;

    const id = `vit-hk-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO vitals (id, patient_id, heart_rate, resting_hr, spo2, bp_systolic, bp_diastolic, glucose, weight, source, timestamp, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'healthkit', ?, 0)
    `).run(
      id, patientId,
      heartRate ?? 72,
      restingHr || null,
      spo2 || null,
      bpSystolic || null,
      bpDiastolic || null,
      glucose || null,
      nowStr
    );

    if (steps !== undefined || hrv !== undefined || respRate !== undefined) {
      const wearId = `wear-hk-${Date.now()}`;
      const existingWear = db.prepare('SELECT id FROM wearable_data WHERE patient_id = ?').get(patientId) as any;
      if (existingWear) {
        db.prepare(`
          UPDATE wearable_data SET 
            device_name = ?, steps = COALESCE(?, steps), 
            sleep_seconds = COALESCE(?, sleep_seconds),
            hrv = COALESCE(?, hrv), resp_rate = COALESCE(?, resp_rate),
            timestamp = CURRENT_TIMESTAMP
          WHERE patient_id = ?
        `).run(deviceName, steps || null, sleepSeconds || null, hrv || null, respRate || null, patientId);
      } else {
        db.prepare(`
          INSERT INTO wearable_data (id, patient_id, device_name, steps, calories, sleep_seconds, hrv, resp_rate, timestamp)
          VALUES (?, ?, ?, ?, 0, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(wearId, patientId, deviceName, steps || 0, sleepSeconds || 0, hrv || 0, respRate || 0);
      }
    }

    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;
    if (restrictions && heartRate && heartRate > restrictions.max_exercise_hr) {
      const alertId = `alt-${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO health_alerts (id, patient_id, severity, title, message)
        VALUES (?, ?, 'urgent', 'Apple Watch Sensor Alert', ?)
      `).run(alertId, patientId, `Apple Watch detected HR (${heartRate} BPM) exceeding clinician limit (${restrictions.max_exercise_hr} BPM).`);
    }

    res.json({
      success: true,
      message: `HealthKit sync received from ${deviceName}`,
      syncId: id,
      timestamp: nowStr
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
