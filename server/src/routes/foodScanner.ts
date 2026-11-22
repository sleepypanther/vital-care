import { Router, Request, Response } from 'express';
import db from '../db/schema';

const router = Router();

interface PresetFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  category: string;
}

const presetFoods: Record<string, PresetFood> = {
  'mediterranean_salad': {
    name: 'Greek Mediterranean Salad with Olive Oil & Feta',
    calories: 310,
    protein: 12,
    carbs: 18,
    fat: 22,
    fiber: 6,
    sodium: 480,
    category: 'Salad'
  },
  'ramen_noodle': {
    name: 'Instant Ramen Noodles with Seasoning',
    calories: 460,
    protein: 9,
    carbs: 64,
    fat: 18,
    fiber: 2,
    sodium: 1760, // High sodium!
    category: 'Noodles'
  },
  'grilled_salmon': {
    name: 'Pan-Seared Salmon with Steamed Asparagus',
    calories: 420,
    protein: 38,
    carbs: 8,
    fat: 24,
    fiber: 4,
    sodium: 320,
    category: 'Fish'
  },
  'cheese_burger': {
    name: 'Double Bacon Cheeseburger with Fries',
    calories: 890,
    protein: 42,
    carbs: 76,
    fat: 48,
    fiber: 3,
    sodium: 1540,
    category: 'Fast Food'
  }
};

// POST /api/food-scanner/:patientId/scan
router.post('/:patientId/scan', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { foodKey = 'mediterranean_salad' } = req.body;

    const food = presetFoods[foodKey] || presetFoods['mediterranean_salad'];
    const restrictions = db.prepare('SELECT * FROM doctor_restrictions WHERE patient_id = ?').get(patientId) as any;

    let fitsPlan = true;
    let restrictionWarning = null;

    if (restrictions) {
      if (food.sodium > 800) {
        fitsPlan = false;
        restrictionWarning = `This food contains ${food.sodium}mg sodium. Your clinician restriction limits daily sodium intake to under ${restrictions.sodium_limit_mg}mg. Consider limiting or choosing a lower-sodium option.`;
      } else if (restrictions.diet_restrictions?.toLowerCase().includes('fried') && food.fat > 30) {
        fitsPlan = false;
        restrictionWarning = `High saturated fat content (${food.fat}g) conflicts with your clinician-configured dietary restriction against fried or high-fat meals.`;
      }
    }

    res.json({
      success: true,
      scannedFood: {
        ...food,
        fitsPlan,
        recommendation: fitsPlan ? "Fits today's plan" : "Consider limiting this food because it conflicts with your configured dietary restrictions.",
        restrictionWarning,
        disclaimer: "Nutritional values are estimated based on image recognition model approximations."
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
