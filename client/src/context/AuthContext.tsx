import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  availableUsers: User[];
  loading: boolean;
  switchRole: (role: UserRole) => void;
  selectUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getRoles();
      setAvailableUsers(res.users);

      const patient = res.users.find(u => u.role === 'patient') || res.users[0];
      if (patient) {
        setCurrentUser(patient);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: UserRole) => {
    const target = availableUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const selectUser = (userId: string) => {
    const target = availableUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, availableUsers, loading, switchRole, selectUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
