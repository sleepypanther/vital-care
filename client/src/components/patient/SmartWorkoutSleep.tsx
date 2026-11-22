import React, { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Moon, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import type { DoctorRestriction, VitalRecord } from '../../types';

interface SmartWorkoutSleepProps {
  patientId: string;
}

export const SmartWorkoutSleep: React.FC<SmartWorkoutSleepProps> = ({ patientId }) => {
  const [currentVital, setCurrentVital] = useState<VitalRecord | null>(null);
  const [restrictions, setRestrictions] = useState<DoctorRestriction | null>(null);
  const [sleep, setSleep] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vitalsRes, sleepRes] = await Promise.all([
        api.getCurrentVitals(patientId),
        api.getSleepRecord(patientId)
      ]);
      setCurrentVital(vitalsRes.vital);
      setRestrictions(vitalsRes.restrictions);
      setSleep(sleepRes.sleep);
    } catch (e) {
      console.error('Failed loading activity', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const workoutHold = !!(
    currentVital && restrictions && (
      currentVital.heart_rate > restrictions.max_exercise_hr ||
      (currentVital.bp_systolic != null && currentVital.bp_systolic >= restrictions.bp_systolic_threshold)
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const sleepHours = sleep?.duration_hours ?? null;
  const deepHours = sleep?.deep_sleep_hours ?? null;
  const consistency = sleep?.consistency_score ?? null;
  const recovery = sleep?.recovery_score ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Activity & Recovery</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Workout guidance and sleep recovery</p>
      </div>

      {workoutHold && (
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: 'var(--card-glucose)', border: '1px solid var(--border)' }}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
          <div className="text-sm">
            <p className="font-semibold">Activity advised to pause</p>
            <p className="text-[var(--text-secondary)] mt-0.5">
              Your heart rate ({currentVital?.heart_rate} BPM) or blood pressure ({currentVital?.bp_systolic}/{currentVital?.bp_diastolic} mmHg) is at or above your configured safety limit ({restrictions?.max_exercise_hr} BPM / {restrictions?.bp_systolic_threshold} mmHg). Rest and resume only after vitals return to baseline.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Today's Activity</h2>
              <p className="text-sm text-[var(--text-secondary)]">General wellness guidance</p>
            </div>
          </div>
          {restrictions ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Keep activity within your configured heart-rate limit of {restrictions.max_exercise_hr} BPM. Follow any instructions set by your care provider.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">No activity restrictions configured. Follow general wellness guidance.</p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--pastel-peach)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Warm-up</p>
              <p className="font-semibold mt-1">Light</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--pastel-blue)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Main</p>
              <p className="font-semibold mt-1">Moderate</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--pastel-mint)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Cool-down</p>
              <p className="font-semibold mt-1">Stretch</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Sleep & Recovery</h2>
              <p className="text-sm text-[var(--text-secondary)]">Latest night</p>
            </div>
          </div>
          {sleep ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Total Sleep</span>
                <span className="font-semibold">{sleepHours != null ? `${sleepHours}h` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Deep Sleep</span>
                <span className="font-semibold">{deepHours != null ? `${deepHours}h` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Consistency</span>
                <span className="font-semibold">{consistency != null ? `${consistency}%` : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[var(--text-secondary)]">Recovery</span>
                <span className="font-semibold">{recovery != null ? `${recovery}/100` : '—'}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">No sleep data available</p>
          )}
        </div>
      </div>
    </div>
  );
};