import React, { useState, useEffect, useCallback } from 'react';
import { X, PhoneCall, CheckCircle2, Send } from 'lucide-react';
import { api } from '../../services/api';
import type { VitalRecord } from '../../types';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose, patientId }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [vital, setVital] = useState<VitalRecord | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getEmergencyData(patientId);
      setContacts(res.contacts || []);
      setVital(res.latestVital || null);
      setProfile(res.profile || null);
    } catch (e) {
      console.error('Failed loading emergency data', e);
    }
  }, [patientId]);

  useEffect(() => {
    if (isOpen) {
      setSent(false);
      setError(null);
      load();
    }
  }, [isOpen, load]);

  const handleSendSOS = async () => {
    try {
      setSending(true);
      setError(null);
      await api.sendSOS(patientId);
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send SOS');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ backgroundColor: 'var(--card-heart)' }}>
              <PhoneCall className="w-5 h-5" style={{ color: 'var(--danger, #b91c1c)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Emergency SOS</h2>
              <p className="text-xs text-[var(--text-secondary)]">Alert your emergency contacts and caregivers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--bg-card-secondary)]">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {sent && (
          <div className="p-3.5 rounded-2xl text-sm flex items-center gap-2" style={{ backgroundColor: 'var(--card-spo2)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#1a5f3f' }} />
            <span>Emergency contacts and caregivers have been notified.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl text-sm" style={{ backgroundColor: 'var(--card-heart)' }}>{error}</div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Emergency Contacts</h4>
          {contacts.length > 0 ? contacts.map(c => (
            <div key={c.id} className="p-3 rounded-2xl border border-[var(--border)] flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{c.contact_name} <span className="text-[var(--text-secondary)]">({c.relationship})</span></p>
                <p className="text-xs text-[var(--text-secondary)]">{c.phone}</p>
              </div>
              <a href={`tel:${c.phone}`} className="btn btn-outline h-8 text-xs">
                <PhoneCall className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          )) : (
            <p className="text-sm text-[var(--text-secondary)]">No emergency contacts configured</p>
          )}
        </div>

        {vital && (
          <div className="p-4 rounded-2xl border border-[var(--border)] space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Latest Vitals</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--card-heart)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Heart Rate</p>
                <p className="font-bold">{vital.heart_rate ?? '—'} <span className="text-[10px] font-normal">BPM</span></p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--card-bp)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">Blood Pressure</p>
                <p className="font-bold">{vital.bp_systolic && vital.bp_diastolic ? `${vital.bp_systolic}/${vital.bp_diastolic}` : '—'}</p>
              </div>
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--card-spo2)' }}>
                <p className="text-[10px] text-[var(--text-secondary)]">SpO₂</p>
                <p className="font-bold">{vital.spo2 ?? '—'}<span className="text-[10px] font-normal">%</span></p>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="p-3.5 rounded-2xl border border-[var(--border)] text-sm space-y-1">
            <p><strong>Blood Group:</strong> {profile.blood_group || '—'}</p>
            <p><strong>Allergies:</strong> {profile.allergies || '—'}</p>
            <p><strong>Conditions:</strong> {profile.existing_conditions || '—'}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSendSOS} disabled={sending || sent} className="btn btn-primary">
            <Send className="w-4 h-4" /> {sent ? 'SOS Sent' : sending ? 'Sending…' : 'Send SOS'}
          </button>
        </div>

        <p className="text-[10px] text-[var(--text-tertiary)] text-center leading-relaxed">
          For a life-threatening emergency, call your local emergency number (911) immediately.
        </p>
      </div>
    </div>
  );
};