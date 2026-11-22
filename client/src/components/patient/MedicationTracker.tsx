import React, { useState, useEffect, useCallback } from 'react';
import { Pill, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { Medication } from '../../types';

interface MedicationTrackerProps {
  patientId: string;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({ patientId }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadMeds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMedications(patientId);
      setMedications(res.medications);
      setAdherence(res.adherencePercent ?? 0);
    } catch (e) {
      console.error('Failed loading medications', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadMeds();
  }, [loadMeds]);

  const handleToggle = async (medId: string, currentStatus: string) => {
    try {
      const next = currentStatus === 'taken' ? 'pending' : 'taken';
      await api.toggleMedicationLog(patientId, medId, next);
      loadMeds();
    } catch (e) {
      console.error('Failed toggling med log', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const takenCount = medications.filter(m => m.status === 'taken').length;
  const activeCount = medications.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Medication</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Track daily prescriptions and adherence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="metric-card" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Active Prescriptions</p>
            <Pill className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <p className="text-[32px] font-bold tracking-tight mt-3">{activeCount}</p>
        </div>
        <div className="metric-card" style={{ backgroundColor: 'var(--card-spo2)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Taken Today</p>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <p className="text-[32px] font-bold tracking-tight mt-3">{takenCount}</p>
        </div>
        <div className="metric-card" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pending</p>
            <Circle className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <p className="text-[32px] font-bold tracking-tight mt-3">{activeCount - takenCount}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Medication Adherence</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">30-day overview</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#1a5f3f' }}>{adherence}%</p>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-card-secondary)] overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${adherence}%` }} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4">Today's Scheduled Regimen</h2>
        {medications.length > 0 ? (
          <div className="space-y-3">
            {medications.map(med => (
              <div
                key={med.id}
                className="p-4 rounded-2xl border border-[var(--border)] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(med.id, med.status || 'pending')}
                    className="rounded-xl hover:opacity-80 transition"
                  >
                    {med.status === 'taken' ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    ) : (
                      <Circle className="w-7 h-7 text-[var(--text-tertiary)]" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{med.medicine_name}</h4>
                      <span className="badge" style={{ backgroundColor: 'var(--pastel-lavender)' }}>{med.dosage}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{med.timing_instructions}</p>
                    {med.prescribed_by && (
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Prescribed by {med.prescribed_by}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold ${med.status === 'taken' ? 'text-emerald-600' : 'text-[var(--text-tertiary)]'}`}>
                  {med.status === 'taken' ? 'Taken' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">No medications scheduled</p>
        )}
      </div>

      <div className="p-4 rounded-2xl flex items-start gap-2.5 text-xs" style={{ backgroundColor: 'var(--card-glucose)', border: '1px solid var(--border)' }}>
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
        <p className="leading-relaxed text-[var(--text-primary)]">
          <strong className="font-semibold">Clinical Safety Guardrail:</strong> AI assistants cannot independently alter medication type, dosage or schedule. Any change requires authorization by a licensed provider.
        </p>
      </div>
    </div>
  );
};