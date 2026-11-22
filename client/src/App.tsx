import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Patient Views
import { TodayHealthDashboard } from './components/patient/TodayHealthDashboard';
import { VitalsMonitoring } from './components/patient/VitalsMonitoring';
import { MedicalProfileHistory } from './components/patient/MedicalProfileHistory';
import { MedicalReportUploader } from './components/patient/MedicalReportUploader';
import { NutritionFoodScanner } from './components/patient/NutritionFoodScanner';
import { SmartWorkoutSleep } from './components/patient/SmartWorkoutSleep';
import { MedicationTracker } from './components/patient/MedicationTracker';
import { HealthTrendsReports } from './components/patient/HealthTrendsReports';
import { CaregiverPermissions } from './components/patient/CaregiverPermissions';
import { AIAssistantModal } from './components/patient/AIAssistantModal';
import { EmergencySOSModal } from './components/patient/EmergencySOSModal';

// Caregiver Views
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [showAI, setShowAI] = useState<boolean>(false);
  const [showSOS, setShowSOS] = useState<boolean>(false);

  const patientId = currentUser?.patient_id || selectedPatientId || 'pat-1';
  const role = currentUser?.role || 'patient';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setShowSOS(true)}
      />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-10">
        {role === 'caregiver' && (
          <>
            {(activeTab === 'today' || activeTab === 'overview' || activeTab === 'dashboard') && (
              <CaregiverDashboard patientId={patientId} />
            )}
            {activeTab === 'health' && <VitalsMonitoring patientId={patientId} />}
            {activeTab === 'medications' && <MedicationTracker patientId={patientId} />}
            {activeTab === 'schedule' && <MedicationTracker patientId={patientId} />}
            {activeTab === 'records' && <MedicalReportUploader patientId={patientId} />}
            {activeTab === 'alerts' && <CaregiverDashboard patientId={patientId} />}
            {activeTab === 'patients' && <CaregiverDashboard patientId={patientId} />}
          </>
        )}

        {role === 'patient' && (
          <>
            {(activeTab === 'overview' || activeTab === 'dashboard' || activeTab === 'home') && (
              <TodayHealthDashboard
                patientId={patientId}
                setActiveTab={setActiveTab}
                onOpenSOS={() => setShowSOS(true)}
              />
            )}
            {activeTab === 'health' && <VitalsMonitoring patientId={patientId} />}
            {activeTab === 'activity' && <SmartWorkoutSleep patientId={patientId} />}
            {activeTab === 'care' && <MedicationTracker patientId={patientId} />}
            {activeTab === 'schedule' && <MedicationTracker patientId={patientId} />}
            {activeTab === 'medications' && <MedicationTracker patientId={patientId} />}
            {activeTab === 'nutrition' && <NutritionFoodScanner patientId={patientId} />}
            {activeTab === 'records' && <MedicalReportUploader patientId={patientId} />}
            {activeTab === 'history' && <MedicalProfileHistory patientId={patientId} />}
            {activeTab === 'caregiver' && <CaregiverPermissions patientId={patientId} />}
            {activeTab === 'profile' && <CaregiverPermissions patientId={patientId} />}
            {activeTab === 'reports' && <HealthTrendsReports patientId={patientId} />}
          </>
        )}
      </main>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAI={() => setShowAI(true)}
      />

      <AIAssistantModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        patientId={patientId}
      />

      <EmergencySOSModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        patientId={patientId}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
