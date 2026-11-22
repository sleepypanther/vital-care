import React, { useState, useEffect, useCallback } from 'react';
import { Utensils, Camera, Check, Plus, Droplets } from 'lucide-react';
import { api } from '../../services/api';
import type { ScannedFood, DailyPlanResponse } from '../../types';

interface NutritionFoodScannerProps {
  patientId: string;
}

const PRESETS = [
  { key: 'mediterranean_salad', label: 'Mediterranean Salad' },
  { key: 'ramen_noodle', label: 'Instant Ramen' },
  { key: 'grilled_salmon', label: 'Grilled Salmon' },
  { key: 'cheese_burger', label: 'Double Cheeseburger' },
];

export const NutritionFoodScanner: React.FC<NutritionFoodScannerProps> = ({ patientId }) => {
  const [plan, setPlan] = useState<DailyPlanResponse | null>(null);
  const [scanned, setScanned] = useState<ScannedFood | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [logged, setLogged] = useState(false);

  const loadPlan = useCallback(async () => {
    try {
      const res = await api.getDailyPlan(patientId);
      setPlan(res.dailyPlan);
    } catch (e) {
      console.error('Failed loading nutrition plan', e);
    }
  }, [patientId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleScan = async (key: string) => {
    try {
      setScanning(true);
      setLogged(false);
      setSelected(key);
      const res = await api.scanFood(patientId, key);
      setScanned(res.scannedFood);
    } catch (e) {
      console.error('Food scanner error', e);
    } finally {
      setScanning(false);
    }
  };

  const handleLogMeal = async () => {
    if (!scanned) return;
    try {
      await api.logMeal(patientId, {
        mealType: 'Scanned Food',
        foodName: scanned.name,
        calories: scanned.calories,
        protein: scanned.protein,
        carbs: scanned.carbs,
        fat: scanned.fat,
        sodium: (scanned as any).sodium
      });
      setLogged(true);
      loadPlan();
    } catch (e) {
      console.error('Failed to log meal', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Nutrition</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Daily intake and food logging</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="metric-card" style={{ backgroundColor: 'var(--pastel-peach)' }}>
          <p className="text-sm font-medium">Calories Target</p>
          <p className="text-[28px] font-bold mt-3">{plan?.nutritionPlan?.calorie_target ?? '—'} <span className="text-sm font-normal text-[var(--text-secondary)]">kcal</span></p>
        </div>
        <div className="metric-card" style={{ backgroundColor: 'var(--card-spo2)' }}>
          <p className="text-sm font-medium">Protein Target</p>
          <p className="text-[28px] font-bold mt-3">{plan?.nutritionPlan?.protein_target_g ?? '—'} <span className="text-sm font-normal text-[var(--text-secondary)]">g</span></p>
        </div>
        <div className="metric-card" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Water</p>
            <Droplets className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <p className="text-[28px] font-bold mt-3">{plan?.water?.current ?? '—'} <span className="text-sm font-normal text-[var(--text-secondary)]">/ {plan?.water?.target ?? '—'} L</span></p>
        </div>
        <div className="metric-card" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
          <p className="text-sm font-medium">Logged Meals</p>
          <p className="text-[28px] font-bold mt-3">{plan?.loggedMeals?.length ?? 0}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Food Scanner</h2>
            <p className="text-sm text-[var(--text-secondary)]">Select a sample item to estimate nutrition</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => handleScan(p.key)}
              disabled={scanning}
              className={`p-3 rounded-2xl border text-left text-sm transition ${
                selected === p.key ? 'border-[var(--text-secondary)] bg-[var(--bg-card-secondary)]' : 'border-[var(--border)] hover:bg-[var(--bg-card-secondary)]'
              }`}
            >
              <p className="font-medium">{p.label}</p>
            </button>
          ))}
        </div>

        {scanning && <p className="text-sm text-[var(--text-secondary)] mt-4">Analyzing…</p>}

        {scanned && (
          <div className="mt-5 p-5 rounded-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{scanned.name}</h3>
              <span className="badge" style={{ backgroundColor: (scanned as any).fitsPlan ? 'var(--card-spo2)' : 'var(--card-glucose)' }}>
                {(scanned as any).recommendation || 'Logged'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-sm">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--pastel-peach)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Calories</p>
                <p className="font-bold mt-0.5">{scanned.calories}</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--card-spo2)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Protein</p>
                <p className="font-bold mt-0.5">{scanned.protein}g</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--pastel-blue)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Carbs</p>
                <p className="font-bold mt-0.5">{scanned.carbs}g</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--card-glucose)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Fat</p>
                <p className="font-bold mt-0.5">{scanned.fat}g</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Fiber</p>
                <p className="font-bold mt-0.5">{(scanned as any).fiber ?? '—'}g</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--pastel-coral)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Sodium</p>
                <p className="font-bold mt-0.5">{(scanned as any).sodium ?? '—'}mg</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleLogMeal} disabled={logged} className="btn btn-primary">
                {logged ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {logged ? 'Logged' : 'Log Meal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};