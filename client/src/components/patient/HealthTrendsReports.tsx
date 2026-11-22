import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Heart, Activity, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import type { VitalRecord } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface HealthTrendsReportsProps {
  patientId: string;
}

export const HealthTrendsReports: React.FC<HealthTrendsReportsProps> = ({ patientId }) => {
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [anomalyNote, setAnomalyNote] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadTrends = useCallback(async () => {
    try {
      const res = await api.getVitalTrends(patientId, timeframe);
      setVitalsHistory(res.history);
      setAnomalyNote(res.anomalyNote || null);
    } catch (e) {
      console.error('Failed loading vital trends', e);
    }
  }, [patientId, timeframe]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.getPatientProfile(patientId);
      setPatientName((res.patient as any).name || '');
    } catch (e) {
      console.error('Failed loading profile', e);
    }
  }, [patientId]);

  useEffect(() => {
    loadTrends();
    loadProfile();
  }, [loadTrends, loadProfile]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      setExportingPDF(true);
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#FFFFFF' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CareSync_Health_Report_${timeframe}.pdf`);
    } catch (e) {
      console.error('Failed generating PDF export', e);
    } finally {
      setExportingPDF(false);
    }
  };

  const chartData = vitalsHistory.map((v, i) => ({
    date: v.timestamp ? new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `Day ${i + 1}`,
    heartRate: v.heart_rate,
    restingHr: v.resting_hr,
    systolic: v.bp_systolic,
    diastolic: v.bp_diastolic
  }));

  const tooltipStyle = { backgroundColor: '#FFFDF8', borderColor: '#E9E3D8', borderRadius: '12px', color: '#282522', fontSize: '12px' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Health Trends</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Historical tracking across vital signs</p>
        </div>
        <button onClick={handleExportPDF} disabled={exportingPDF} className="btn btn-primary">
          <Download className={`w-4 h-4 ${exportingPDF ? 'animate-bounce' : ''}`} />
          {exportingPDF ? 'Generating…' : 'Export PDF'}
        </button>
      </div>

      {anomalyNote && (
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: 'var(--card-glucose)', border: '1px solid var(--border)' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
          <div className="text-sm">
            <p className="font-semibold">Trend notice</p>
            <p className="text-[var(--text-secondary)] mt-0.5">{anomalyNote}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">For wellness tracking only, not a medical diagnosis.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl w-fit" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
        {['7D', '30D', '3M', '6M', '1Y'].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition ${timeframe === tf ? 'bg-white shadow text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-3xl border border-[var(--border)]">
        <div className="border-b border-[var(--border)] pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">CareSync Health Assessment Summary</h2>
            <p className="text-xs text-[var(--text-secondary)]">Patient: {patientName || '—'}</p>
          </div>
          <div className="text-right text-xs text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Period: {timeframe}</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: '#e11d48' }} />
            Heart Rate & Resting HR (BPM)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3D8" />
                <XAxis dataKey="date" stroke="#A0998E" fontSize={11} />
                <YAxis domain={[50, 140]} stroke="#A0998E" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="heartRate" name="Live HR" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="restingHr" name="Resting HR" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: '#0284c7' }} />
            Blood Pressure (Systolic / Diastolic mmHg)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E3D8" />
                <XAxis dataKey="date" stroke="#A0998E" fontSize={11} />
                <YAxis domain={[60, 160]} stroke="#A0998E" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#0284c7" strokeWidth={2.5} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};