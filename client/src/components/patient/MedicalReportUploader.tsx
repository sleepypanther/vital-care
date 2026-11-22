import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, FileText, Eye, Search } from 'lucide-react';
import { api } from '../../services/api';
import type { MedicalReport } from '../../types';

interface MedicalReportUploaderProps {
  patientId: string;
}

export const MedicalReportUploader: React.FC<MedicalReportUploaderProps> = ({ patientId }) => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const res = await api.getMedicalReports(patientId);
      setReports(res.reports);
      setSelectedReport(prev => prev || res.reports[0] || null);
    } catch (e) {
      console.error('Failed loading medical reports', e);
    }
  }, [patientId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      await api.uploadMedicalReport(patientId, file.name, fileType);
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const filteredValues = selectedReport?.values?.filter(val =>
    val.test_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] lg:text-[28px] font-bold tracking-tight">Medical Records</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Upload lab reports and medical documents</p>
      </div>

      <label
        className="card p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--bg-card-secondary)] transition"
        style={{ borderStyle: 'dashed' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-blue)' }}>
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium mt-3">{uploading ? 'Uploading…' : 'Upload medical report'}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">PDF, JPG or PNG</p>
        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" />
      </label>

      {error && (
        <div className="p-3 rounded-2xl text-sm" style={{ backgroundColor: 'var(--card-heart)', color: 'var(--danger, #b91c1c)' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-3">Documents ({reports.length})</h3>
          <div className="space-y-2">
            {reports.map(rep => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left p-3 rounded-2xl border transition ${
                  selectedReport?.id === rep.id ? 'border-[var(--text-secondary)]' : 'border-[var(--border)] hover:bg-[var(--bg-card-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--pastel-peach)' }}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{rep.report_name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{rep.upload_date} • {rep.file_type}</p>
                  </div>
                </div>
              </button>
            ))}
            {reports.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] py-4 text-center">No documents yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          {selectedReport ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{selectedReport.report_name}</h3>
                    <span className="badge" style={{ backgroundColor: 'var(--card-spo2)' }}>Parsed</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Uploaded {selectedReport.upload_date}</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Search biomarker…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input pl-8 h-9 text-xs"
                  />
                </div>
              </div>

              {selectedReport.values && selectedReport.values.length > 0 ? (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--text-tertiary)] uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Biomarker</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredValues.map(val => (
                        <tr key={val.id}>
                          <td className="py-3 px-3 font-medium">{val.test_name}</td>
                          <td className="py-3 px-3 font-bold">{val.value}</td>
                          <td className="py-3 px-3 text-[var(--text-secondary)]">{val.unit}</td>
                          <td className="py-3 px-3 text-[var(--text-secondary)]">{val.ref_range}</td>
                          <td className="py-3 px-3">
                            <span
                              className="badge"
                              style={{
                                backgroundColor: val.status_indicator === 'Normal' ? 'var(--card-spo2)' : 'var(--card-glucose)',
                              }}
                            >
                              {val.status_indicator}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredValues.length === 0 && (
                        <tr><td colSpan={5} className="py-6 text-center text-[var(--text-secondary)]">No biomarker values</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> No extracted values available
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-[var(--text-secondary)] py-12">Select a document to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};