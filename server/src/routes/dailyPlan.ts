import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/daily-plan/:patientId
router.get('/:patientId', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];

    let nutritionPlan = db.prepare('SELECT * FROM nutrition_plans WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    let exercisePlan = db.prepare('SELECT * FROM exercise_plans WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    let dailyPlanRecord = db.prepare('SELECT * FROM daily_plans WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    let sleepRecord = db.prepare('SELECT * FROM sleep_records WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    let waterLog = db.prepare('SELECT * FROM water_logs WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;
    const loggedMeals = db.prepare('SELECT * FROM meal_logs WHERE patient_id = ? ORDER BY logged_at DESC').all(patientId) as any[];
    const loggedExercises = db.prepare('SELECT * FROM exercise_logs WHERE patient_id = ? ORDER BY logged_at DESC').all(patientId) as any[];
    
    const medications = db.prepare(`
      SELECT m.*, ml.status, ml.taken_at, ml.scheduled_time
      FROM medications m
      LEFT JOIN medication_logs ml ON m.id = ml.medication_id AND ml.patient_id = m.patient_id
      WHERE m.patient_id = ?
    `).all(patientId) as any[];

    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;

    if (!nutritionPlan) {
      nutritionPlan = db.prepare('SELECT * FROM nutrition_plans WHERE patient_id = ? ORDER BY date DESC LIMIT 1').get(patientId);
    }
    if (!exercisePlan) {
      exercisePlan = db.prepare('SELECT * FROM exercise_plans WHERE patient_id = ? ORDER BY date DESC LIMIT 1').get(patientId);
    }
    if (!dailyPlanRecord) {
      dailyPlanRecord = db.prepare('SELECT * FROM daily_plans WHERE patient_id = ? ORDER BY date DESC LIMIT 1').get(patientId);
    }

    // Dynamic Wellness & Adherence score calculation
    const takenMeds = medications.filter(m => m.status === 'taken').length;
    const totalMeds = medications.length || 1;
    const medScore = (takenMeds / totalMeds) * 25; // 25%

    const waterAmount = waterLog ? waterLog.amount_liters : 1.6;
    const waterTarget = restrictions ? restrictions.max_daily_fluid_l : 2.2;
    const waterScore = Math.min(1, waterAmount / waterTarget) * 15; // 15%

    const sleepDuration = sleepRecord ? sleepRecord.duration_hours : 7.2;
    const sleepScore = Math.min(1, sleepDuration / 8.0) * 20; // 20%

    const exerciseLogged = loggedExercises.length > 0;
    const activityScore = exerciseLogged ? 22 : 18; // 22%
    const nutritionScore = loggedMeals.length > 0 ? 18 : 15; // 18%

    const calculatedWellnessScore = Math.round(medScore + waterScore + sleepScore + activityScore + nutritionScore);

    res.json({
      success: true,
      dailyPlan: {
        date: todayStr,
        wellnessScore: calculatedWellnessScore,
        scoreDisclaimer: "This score is intended for wellness tracking and adherence monitoring and does not represent a medical diagnosis.",
        sleepWindow: dailyPlanRecord?.sleep_window || '10:30 PM — 06:15 AM',
        nutritionPlan,
        exercisePlan,
        medications,
        loggedMeals,
        loggedExercises,
        water: {
          current: waterAmount,
          target: waterTarget,
          isFluidRestricted: Boolean(restrictions?.max_daily_fluid_l)
        },
        restrictions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/daily-plan/:patientId/water
router.post('/:patientId/water', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { amount } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const existing = db.prepare('SELECT * FROM water_logs WHERE patient_id = ? AND date = ?').get(patientId, todayStr) as any;

    if (existing) {
      db.prepare('UPDATE water_logs SET amount_liters = ? WHERE id = ?').run(amount, existing.id);
    } else {
      const id = `wtr-${crypto.randomUUID()}`;
      db.prepare('INSERT INTO water_logs (id, patient_id, date, amount_liters) VALUES (?, ?, ?, ?)').run(id, patientId, todayStr, amount);
    }

    res.json({ success: true, amount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/daily-plan/:patientId/log-meal
router.post('/:patientId/log-meal', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { mealType, foodName, calories, protein, carbs, fat, sodium } = req.body;
    const id = `mlog-${crypto.randomUUID()}`;

    db.prepare(`
      INSERT INTO meal_logs (id, patient_id, meal_type, food_name, calories, protein, carbs, fat, sodium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, patientId, mealType || 'Lunch', foodName || 'Logged Meal', calories || 450, protein || 25, carbs || 40, fat || 12, sodium || 350);

    res.json({ success: true, message: 'Meal logged successfully', logId: id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/daily-plan/:patientId/log-exercise
router.post('/:patientId/log-exercise', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { activityName, durationMins, caloriesBurned, heartRateAvg } = req.body;
    const id = `elog-${crypto.randomUUID()}`;

    db.prepare(`
      INSERT INTO exercise_logs (id, patient_id, activity_name, duration_mins, calories_burned, heart_rate_avg)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, patientId, activityName || 'Aerobic Walking', durationMins || 25, caloriesBurned || 140, heartRateAvg || 112);

    res.json({ success: true, message: 'Workout logged successfully', logId: id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
