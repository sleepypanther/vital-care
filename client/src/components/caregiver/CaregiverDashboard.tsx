import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Lock, Activity, Pill } from 'lucide-react';
import { api } from '../../services/api';

interface CaregiverDashboardProps {
  patientId: string;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ patientId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCaregiverView = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCaregiverView(patientId);
      setData(res.caregiverView);
    } catch (e) {
      console.error('Failed loading caregiver view', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadCaregiverView();
  }, [loadCaregiverView]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
        <p className="text-sm text-[var(--text-secondary)]">Loading caregiver portal…</p>
      </div>
    );
  }

  const { consents, patientName, latestVital, medicationAdherence, fullMedicalHistoryHidden } = data;

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#059669' }}>
          <ShieldCheck className="w-4 h-4" />
          <span>Patient-Authorized Caregiver Portal</span>
        </div>
        <h1 className="text-2xl font-bold">Caregiver Overview: {patientName}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Showing data authorized by {patientName} under active privacy settings.
        </p>
      </div>

      {consents.allow_vitals && latestVital ? (
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: '#0284c7' }} />
            <h3 className="font-semibold text-base">Vitals</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-heart)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Heart Rate</p>
              <p className="text-xl font-bold mt-0.5">{latestVital.heart_rate} <span className="text-xs font-normal">BPM</span></p>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-bp)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Blood Pressure</p>
              <p className="text-xl font-bold mt-0.5">{latestVital.bp_systolic}/{latestVital.bp_diastolic}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--card-spo2)' }}>
              <p className="text-xs text-[var(--text-secondary)]">Oxygen (SpO₂)</p>
              <p className="text-xl font-bold mt-0.5">{latestVital.spo2}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl flex items-center gap-2 text-sm text-[var(--text-secondary)]" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
          <Lock className="w-4 h-4" />
          <span>Vitals access is hidden per patient privacy settings.</span>
        </div>
      )}

      {consents.allow_medication && medicationAdherence ? (
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5" style={{ color: '#0284c7' }} />
            <h3 className="font-semibold text-base">Medication Adherence</h3>
          </div>
          <div className="space-y-2">
            {medicationAdherence.map((med: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl flex items-center justify-between text-sm" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
                <div>
                  <p className="font-semibold">{med.medicine_name} ({med.dosage})</p>
                  <p className="text-xs text-[var(--text-secondary)]">{med.timing_instructions}</p>
                </div>
                <span className="badge" style={{ backgroundColor: med.status === 'taken' ? 'var(--card-spo2)' : 'var(--bg-card)' }}>
                  {med.status === 'taken' ? 'Taken' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl flex items-center gap-2 text-sm text-[var(--text-secondary)]" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
          <Lock className="w-4 h-4" />
          <span>Medication adherence access is hidden per patient privacy settings.</span>
        </div>
      )}

      {fullMedicalHistoryHidden && (
        <div className="p-4 rounded-2xl flex items-start gap-2.5 text-sm" style={{ backgroundColor: 'var(--pastel-blue)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p><strong className="font-semibold">Full Medical Records:</strong> Restricted. The patient has chosen to keep raw clinical files private.</p>
        </div>
      )}
    </div>
  );
};