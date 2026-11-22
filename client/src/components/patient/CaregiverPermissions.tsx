import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import type { CaregiverConsent } from '../../types';

interface CaregiverPermissionsProps {
  patientId: string;
}

const permissionItems: { key: keyof CaregiverConsent; title: string; desc: string; color: string }[] = [
  { key: 'allow_medication', title: 'Medication Adherence', desc: 'Daily medication checklist and taken/missed status', color: 'var(--pastel-lavender)' },
  { key: 'allow_activity', title: 'Activity & Workout', desc: 'Steps, calories and exercise completion', color: 'var(--pastel-blue)' },
  { key: 'allow_vitals', title: 'Live Vitals', desc: 'Heart rate, SpO₂ and blood pressure telemetry', color: 'var(--card-heart)' },
  { key: 'allow_alerts', title: 'Emergency & Health Alerts', desc: 'Urgent alerts and emergency SOS notifications', color: 'var(--pastel-coral)' },
  { key: 'allow_full_history', title: 'Medical Records & Reports', desc: 'Full medical history, lab panels and ECG scans', color: 'var(--card-spo2)' },
];

export const CaregiverPermissions: React.FC<CaregiverPermissionsProps> = ({ patientId }) => {
  const [consents, setConsents] = useState<CaregiverConsent | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getCaregiverView(patientId);
      if (res.caregiverView?.consents) {
        setConsents(res.caregiverView.consents);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load permissions');
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = (field: keyof CaregiverConsent) => {
    setConsents(prev => (prev ? { ...prev, [field]: prev[field] === 1 ? 0 : 1 } : prev));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (!consents) return;
    try {
      setSaving(true);
      await api.updateCaregiverConsent(patientId, consents);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!consents) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Caregiver Access</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage what your caregiver can access</p>
        </div>
        <div className="card p-6 text-sm text-[var(--text-secondary)]">
          {error || 'No caregiver permissions configured yet.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Caregiver Access</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage what your caregiver can access</p>
      </div>

      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-semibold">Your Caregiver</p>
            <p className="text-sm text-[var(--text-secondary)]">Designated caregiver</p>
          </div>
        </div>
        <span className="badge" style={{ backgroundColor: 'var(--card-spo2)' }}>Active</span>
      </div>

      {error && (
        <div className="p-3 rounded-2xl text-sm" style={{ backgroundColor: 'var(--card-heart)' }}>{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {permissionItems.map(item => {
          const enabled = consents[item.key] === 1;
          return (
            <div key={item.key} className="card p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color }}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`w-11 h-6 rounded-full flex-shrink-0 transition-colors flex items-center px-0.5 ${enabled ? 'bg-emerald-500 justify-end' : 'bg-[var(--bg-card-secondary)] justify-start'}`}
                    aria-pressed={enabled}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        {savedSuccess ? (
          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Permissions updated
          </span>
        ) : (
          <span className="text-sm text-[var(--text-secondary)]">You can revoke caregiver access anytime.</span>
        )}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
};