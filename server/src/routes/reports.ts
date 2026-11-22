import { Router, Request, Response } from 'express';
import db from '../db/schema';
import crypto from 'crypto';

const router = Router();

// GET /api/reports/:patientId
router.get('/:patientId', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const reports = db.prepare('SELECT * FROM medical_reports WHERE patient_id = ? ORDER BY upload_date DESC').all(patientId) as any[];

    const reportsWithValues = reports.map(r => {
      const values = db.prepare('SELECT * FROM report_values WHERE report_id = ?').all(r.id);
      return { ...r, values };
    });

    res.json({ success: true, reports: reportsWithValues });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/:patientId/upload (Simulated OCR document extraction)
router.post('/:patientId/upload', (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { reportName = 'Uploaded_Medical_Report.pdf', fileType = 'PDF', reportCategory = 'Blood Test' } = req.body;

    const reportId = `mr-${crypto.randomUUID()}`;
    const uploadDate = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO medical_reports (id, patient_id, report_name, file_type, file_path, upload_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Processed')
    `).run(reportId, patientId, reportName, fileType, `/uploads/reports/${reportName}`, uploadDate);

    // Simulate OCR Extraction of structured lab values based on report type
    const simulatedExtractedValues = [
      { id: `rv-${Date.now()}-1`, report_id: reportId, test_name: 'Hemoglobin', value: '14.2', unit: 'g/dL', ref_range: '13.5 - 17.5', status_indicator: 'Normal' },
      { id: `rv-${Date.now()}-2`, report_id: reportId, test_name: 'Fasting Blood Glucose', value: '102', unit: 'mg/dL', ref_range: '70 - 99', status_indicator: 'Attention' },
      { id: `rv-${Date.now()}-3`, report_id: reportId, test_name: 'HbA1c', value: '5.6', unit: '%', ref_range: '4.0 - 5.6', status_indicator: 'Normal' },
      { id: `rv-${Date.now()}-4`, report_id: reportId, test_name: 'LDL Cholesterol', value: '124', unit: 'mg/dL', ref_range: '< 100', status_indicator: 'Attention' },
      { id: `rv-${Date.now()}-5`, report_id: reportId, test_name: 'Triglycerides', value: '140', unit: 'mg/dL', ref_range: '< 150', status_indicator: 'Normal' },
      { id: `rv-${Date.now()}-6`, report_id: reportId, test_name: 'High Sensitivity CRP', value: '1.2', unit: 'mg/L', ref_range: '< 1.0', status_indicator: 'Attention' }
    ];

    const stmt = db.prepare(`
      INSERT INTO report_values (id, report_id, test_name, value, unit, ref_range, status_indicator)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const val of simulatedExtractedValues) {
      stmt.run(val.id, val.report_id, val.test_name, val.value, val.unit, val.ref_range, val.status_indicator);
    }

    // Insert history entry
    const histId = `mh-${Date.now()}`;
    db.prepare(`
      INSERT INTO medical_history (id, patient_id, event_year, event_title, category, details, date_recorded)
      VALUES (?, ?, 2026, ?, 'Report', ?, ?)
    `).run(histId, patientId, reportName, `Extracted ${simulatedExtractedValues.length} key lab metrics via OCR parser.`, uploadDate);

    res.json({
      success: true,
      message: 'Report uploaded and extracted successfully',
      reportId,
      extractedValues: simulatedExtractedValues,
      disclaimer: "Extracted report values are for monitoring visualization and decision support. They do not constitute an automated medical diagnosis."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
