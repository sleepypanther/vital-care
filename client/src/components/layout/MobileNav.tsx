import React from 'react';
import { Home, HeartPulse, Activity, FileText, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'patient';

  const items = role === 'caregiver'
    ? [
        { id: 'today', label: 'Today', icon: Home },
        { id: 'patients', label: 'Patients', icon: HeartPulse },
        { id: 'schedule', label: 'Schedule', icon: Activity },
        { id: 'alerts', label: 'Alerts', icon: FileText },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    : [
        { id: 'overview', label: 'Home', icon: Home },
        { id: 'health', label: 'Health', icon: HeartPulse },
        { id: 'care', label: 'Care', icon: Activity },
        { id: 'records', label: 'Records', icon: FileText },
        { id: 'profile', label: 'Profile', icon: User },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 nav-shell">
      <div className="grid grid-cols-5 h-16">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-xs ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
