import React, { useState, useEffect } from 'react';
import { Bell, Search, ShieldAlert, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { HealthAlert } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSOS: () => void;
}

const patientTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'health', label: 'Health' },
  { id: 'activity', label: 'Activity' },
  { id: 'care', label: 'Care' },
  { id: 'records', label: 'Records' },
  { id: 'reports', label: 'Reports' },
];

const caregiverTabs = [
  { id: 'today', label: 'Today' },
  { id: 'patients', label: 'Patients' },
  { id: 'health', label: 'Health' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'records', label: 'Records' },
  { id: 'reports', label: 'Reports' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSOS }) => {
  const { currentUser, availableUsers, selectUser } = useAuth();
  const role = currentUser?.role || 'patient';
  const displayName = currentUser?.name || (role === 'caregiver' ? 'Caregiver' : 'Patient');
  const tabs = role === 'caregiver' ? caregiverTabs : patientTabs;

  const [showProfile, setShowProfile] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const unread = alerts.filter(a => !a.is_read).length;

  const patientId = currentUser?.patient_id;

  useEffect(() => {
    if (patientId) {
      api.getAlerts(patientId).then(r => setAlerts(r.alerts)).catch(() => setAlerts([]));
    }
  }, [patientId]);

  const markRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: 1 } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full nav-shell">
      <div className="relative w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveTab(role === 'caregiver' ? 'today' : 'overview')}
          className="flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
          <span className="text-sm font-semibold tracking-tight">CareSync</span>
        </button>

        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(233,227,216,0.4)]">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <div className="relative">
            <button
              onClick={() => { setShowAlerts(!showAlerts); setShowProfile(false); }}
              className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-[rgba(233,227,216,0.4)]"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] font-bold text-white bg-red-500 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 card p-2 z-50">
                <p className="px-2 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">Notifications</p>
                {alerts.length === 0 && <p className="px-2 py-3 text-sm text-[var(--text-secondary)]">No notifications</p>}
                {alerts.slice(0, 6).map(a => (
                  <button
                    key={a.id}
                    onClick={() => markRead(a.id)}
                    className="w-full text-left p-2 rounded-xl hover:bg-[var(--bg-card-secondary)] transition"
                  >
                    <div className="flex items-center gap-2">
                      {!a.is_read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{a.message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {role === 'patient' && (
            <button onClick={onOpenSOS} className="btn btn-outline h-9">
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowAlerts(false); }}
              className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-full hover:bg-[rgba(233,227,216,0.4)]"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'var(--pastel-blue)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 card p-1 z-50">
                <p className="px-2 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">Switch account</p>
                {availableUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { selectUser(u.id); setShowProfile(false); setActiveTab('overview'); }}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-[var(--bg-card-secondary)] transition text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ backgroundColor: 'var(--pastel-yellow)' }}>
                        {u.name.charAt(0)}
                      </span>
                      {u.name}
                    </span>
                    {currentUser?.id === u.id
                      ? <Check className="w-4 h-4 text-emerald-500" />
                      : <span className="text-[11px] text-[var(--text-tertiary)] capitalize">{u.role}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};