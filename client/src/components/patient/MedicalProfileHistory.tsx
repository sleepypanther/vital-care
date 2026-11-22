import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Pill, Activity, Phone, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { PatientProfile, MedicalHistoryEvent } from '../../types';

interface MedicalProfileHistoryProps {
  patientId: string;
}

export const MedicalProfileHistory: React.FC<MedicalProfileHistoryProps> = ({ patientId }) => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [history, setHistory] = useState<MedicalHistoryEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, histRes] = await Promise.all([
        api.getPatientProfile(patientId),
        api.getPatientHistory(patientId)
      ]);
      setProfile(profRes.patient);
      setHistory(histRes.history);
    } catch (e) {
      console.error('Failed loading profile history', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
        <p className="text-sm text-[var(--text-secondary)]">Loading profile…</p>
      </div>
    );
  }

  const initials = (profile.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const filteredHistory = categoryFilter === 'All' ? history : history.filter(h => h.category === categoryFilter);

  const InfoBlock = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: { label: string; value: string }[] }) => (
    <div className="space-y-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
      <div className="flex items-center gap-2 text-sm font-semibold">{icon}<span>{title}</span></div>
      {items.map(it => (
        <div key={it.label}>
          <p className="font-medium text-xs">{it.label}</p>
          <p className="text-[var(--text-secondary)] mt-0.5 text-sm">{it.value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: 'var(--pastel-blue)' }}>
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {profile.age} years • {profile.gender} • Blood Group: <span className="font-semibold">{profile.blood_group}</span> • BMI: {profile.bmi}
              </p>
            </div>
          </div>
          {profile.doctor_name && (
            <div className="px-4 py-2 rounded-2xl text-xs" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
              <span className="text-[var(--text-secondary)]">Primary Clinician: </span>
              <span className="font-semibold">{profile.doctor_name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBlock title="Allergies & Conditions" icon={<AlertCircle className="w-4 h-4" style={{ color: '#e11d48' }} />} items={[
            { label: 'Known Allergies', value: profile.allergies || 'None recorded' },
            { label: 'Active Conditions', value: profile.existing_conditions || 'None' }
          ]} />
          <InfoBlock title="Surgeries & Family" icon={<FileText className="w-4 h-4" style={{ color: '#0284c7' }} />} items={[
            { label: 'Previous Surgeries', value: profile.previous_surgeries || 'None' },
            { label: 'Family Medical History', value: profile.family_history || 'None recorded' }
          ]} />
          <InfoBlock title="Preferences & Contacts" icon={<Phone className="w-4 h-4" style={{ color: '#059669' }} />} items={[
            { label: 'Dietary Preferences', value: profile.dietary_preferences || 'Standard' },
            { label: 'Emergency Contacts', value: profile.emergencyContacts?.map(c => `${c.contact_name} (${c.relationship}) ${c.phone}`).join(', ') || 'None' }
          ]} />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Medical History</h2>
            <p className="text-xs text-[var(--text-secondary)]">Chronological health events and records</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
            {['All', 'Condition', 'Medication', 'Report', 'Assessment'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${categoryFilter === cat ? 'bg-white shadow text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] py-6 text-center">No events to show</p>
        ) : (
          <div className="relative border-l-2 border-[var(--border)] ml-4 space-y-6 pt-2">
            {filteredHistory.map(evt => (
              <div key={evt.id} className="relative pl-6 space-y-1">
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: 'var(--pastel-blue)' }}>
                  {evt.category === 'Condition' && <AlertCircle className="w-4 h-4" style={{ color: '#b45309' }} />}
                  {evt.category === 'Medication' && <Pill className="w-4 h-4" style={{ color: '#0284c7' }} />}
                  {evt.category === 'Report' && <FileText className="w-4 h-4" style={{ color: '#0284c7' }} />}
                  {evt.category === 'Assessment' && <Activity className="w-4 h-4" style={{ color: '#059669' }} />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs">{evt.event_year}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">• {evt.date_recorded}</span>
                  <span className="badge">{evt.category}</span>
                </div>
                <h4 className="font-bold text-sm">{evt.event_title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{evt.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};