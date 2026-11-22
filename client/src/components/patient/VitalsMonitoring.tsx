import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Activity, Droplets, Wind, Thermometer, Watch } from 'lucide-react';
import { api } from '../../services/api';
import type { VitalRecord } from '../../types';

interface VitalsMonitoringProps {
  patientId: string;
}

export const VitalsMonitoring: React.FC<VitalsMonitoringProps> = ({ patientId }) => {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [currentVital, setCurrentVital] = useState<VitalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vitalsRes, currentRes] = await Promise.all([
        api.getVitals(patientId),
        api.getCurrentVitals(patientId)
      ]);
      setVitals(vitalsRes.vitals);
      setCurrentVital(currentRes.vital);
    } catch (e) {
      console.error('Failed loading vitals:', e);
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

  const hasData = !!currentVital;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-pink)' }}>
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Real-Time Health Monitoring</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Live vitals from connected devices</p>
          </div>
        </div>
      </div>

      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Wearable Connection</p>
            <p className="text-sm text-[var(--text-secondary)]">{hasData ? 'Connected' : 'Not connected'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <div className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-emerald-500' : 'bg-[var(--text-tertiary)]'}`} />
            <span>{hasData ? 'Live' : 'Offline'}</span>
          </div>
          <button onClick={loadData} className="btn btn-outline h-9">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="metric-card" style={{ backgroundColor: 'var(--card-heart)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Heart Rate</p>
            <Heart className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <div className="mt-4">
            {hasData && currentVital?.heart_rate ? (
              <p className="text-[32px] font-bold tracking-tight">{currentVital.heart_rate} <span className="text-base font-medium text-[var(--text-secondary)]">BPM</span></p>
            ) : (
              <p className="text-sm">No data available</p>
            )}
          </div>
        </div>

        <div className="metric-card" style={{ backgroundColor: 'var(--card-bp)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Blood Pressure</p>
            <Activity className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <div className="mt-4">
            {hasData && currentVital?.bp_systolic && currentVital?.bp_diastolic ? (
              <p className="text-[32px] font-bold tracking-tight">{currentVital.bp_systolic}/{currentVital.bp_diastolic} <span className="text-base font-medium text-[var(--text-secondary)]">mmHg</span></p>
            ) : (
              <p className="text-sm">No data available</p>
            )}
          </div>
        </div>

        <div className="metric-card" style={{ backgroundColor: 'var(--card-spo2)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">SpO₂</p>
            <Droplets className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <div className="mt-4">
            {hasData && currentVital?.spo2 ? (
              <p className="text-[32px] font-bold tracking-tight">{currentVital.spo2} <span className="text-base font-medium text-[var(--text-secondary)]">%</span></p>
            ) : (
              <p className="text-sm">No data available</p>
            )}
          </div>
        </div>

        <div className="metric-card" style={{ backgroundColor: 'var(--card-rr)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Respiratory Rate</p>
            <Wind className="w-4 h-4" style={{ color: 'rgba(40,37,34,0.6)' }} />
          </div>
          <div className="mt-4">
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Recent Readings</h2>
        </div>
        {vitals.length > 0 ? (
          <div className="space-y-2">
            {vitals.slice(0, 10).map((v, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm">{v.heart_rate ? `${v.heart_rate} BPM` : '—'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{v.timestamp ? new Date(v.timestamp).toLocaleString() : '—'} • {v.source || 'manual'}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">BP: {v.bp_systolic || '—'}/{v.bp_diastolic || '—'} • SpO₂: {v.spo2 || '—'}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">No readings yet</p>
        )}
      </div>
    </div>
  );
};
