import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Moon, Footprints, Activity, Watch, User, ShieldCheck, Clock, Pill, Calendar, FileText, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import type { DailyPlanResponse, VitalRecord, PatientProfile } from '../../types';

interface TodayHealthDashboardProps {
  patientId: string;
  setActiveTab: (tab: string) => void;
  onOpenSOS: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const TodayHealthDashboard: React.FC<TodayHealthDashboardProps> = ({ patientId, setActiveTab }) => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null);
  const [currentVital, setCurrentVital] = useState<VitalRecord | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [planRes, vitalRes, profileRes] = await Promise.all([
        api.getDailyPlan(patientId),
        api.getCurrentVitals(patientId),
        api.getPatientProfile(patientId)
      ]);
      setDailyPlan(planRes.dailyPlan);
      setCurrentVital(vitalRes.vital);
      setPatient(profileRes.patient);
    } catch (e) {
      console.error('Failed loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = patient?.name?.split(' ')[0] || 'Patient';
  const hasVitals = !!currentVital;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">{getGreeting()}, {firstName}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Your personal health overview</p>
      </div>

      <div className="info-strip flex flex-wrap items-center gap-4 lg:gap-6 px-4 lg:px-6 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{patient?.name || 'Patient'}</p>
            <p className="text-xs text-[var(--text-secondary)]">Patient</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-mint)' }}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm">Health Status</p>
            <p className="text-xs text-[var(--text-secondary)]">{hasVitals ? 'Stable' : 'Monitoring'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm">Wearable</p>
            <p className="text-xs text-[var(--text-secondary)]">{hasVitals ? 'Connected' : 'Not connected'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm">Caregiver</p>
            <p className="text-xs text-[var(--text-secondary)]">Linked</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
          <p className="text-xs text-[var(--text-secondary)]">Last sync —</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button onClick={() => setActiveTab('health')} className="metric-card text-left" style={{ backgroundColor: 'var(--card-heart)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Heart Rate</p>
                <Heart className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                {hasVitals && currentVital?.heart_rate ? (
                  <p className="text-[30px] font-bold tracking-tight">{currentVital.heart_rate} <span className="text-base font-medium text-[var(--text-secondary)]">BPM</span></p>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">No data available</p>
                )}
              </div>
            </button>

            <button onClick={() => setActiveTab('activity')} className="metric-card text-left" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Sleep</p>
                <Moon className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[var(--text-secondary)]">No data available</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('activity')} className="metric-card text-left" style={{ backgroundColor: 'var(--card-steps)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Steps</p>
                <Footprints className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[var(--text-secondary)]">No data available</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('health')} className="metric-card text-left" style={{ backgroundColor: 'var(--card-hrv)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">HRV</p>
                <Activity className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[var(--text-secondary)]">No data available</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('health')} className="metric-card text-left" style={{ backgroundColor: 'var(--card-spo2)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">SpO₂</p>
                <Activity className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                {hasVitals && currentVital?.spo2 ? (
                  <p className="text-[30px] font-bold tracking-tight">{currentVital.spo2} <span className="text-base font-medium text-[var(--text-secondary)]">%</span></p>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">No data available</p>
                )}
              </div>
            </button>

            <button onClick={() => setActiveTab('activity')} className="metric-card text-left" style={{ backgroundColor: 'var(--card-glucose)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Activity</p>
                <Activity className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[var(--text-secondary)]">No data available</p>
              </div>
            </button>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Health Trend Analytics</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Heart rate overview</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                <button className="px-2.5 py-1 rounded-full hover:bg-[rgba(233,227,216,0.5)]">Today</button>
                <button className="px-2.5 py-1 rounded-full hover:bg-[rgba(233,227,216,0.5)]">7D</button>
                <button className="px-2.5 py-1 rounded-full hover:bg-[rgba(233,227,216,0.5)]">30D</button>
              </div>
            </div>
            <div className="h-56 flex items-center justify-center text-sm text-[var(--text-secondary)]">
              No chart data available
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Recent Activity</h2>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">No recent activity</p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Today's Care</h2>
                <button onClick={() => setActiveTab('care')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {dailyPlan?.medications && dailyPlan.medications.length > 0 ? (
                <div className="space-y-2">
                  {dailyPlan.medications.slice(0, 2).map(med => (
                    <div key={med.id} className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-coral)' }}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm">{med.medicine_name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{med.dosage}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{med.status === 'taken' ? 'Taken' : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">Nothing scheduled</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
                {firstName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold">{patient?.name || 'Patient'}</p>
                <p className="text-sm text-[var(--text-secondary)]">Patient Profile</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Age</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Blood Group</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Status</span>
                <span>{hasVitals ? 'Stable' : 'Monitoring'}</span>
              </div>
            </div>
            <button className="btn btn-outline h-9 w-full mt-4">Edit Profile</button>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold mb-3">Detailed Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Allergies</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Medical Conditions</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Emergency Contact</span>
                <span>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Connected Devices</span>
                <span>{hasVitals ? '1' : '0'}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Upcoming</h2>
              <button onClick={() => setActiveTab('care')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Appointments</p>
                  <p className="text-xs text-[var(--text-secondary)]">None</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-mint)' }}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">Records</p>
                  <p className="text-xs text-[var(--text-secondary)]">None</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
