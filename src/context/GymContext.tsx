import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Admin, TabType, LogEntry, Plan, Coach } from '../types';
import { INITIAL_LOGS } from '../mockData';
import { seedFirebaseDefaultData } from '../lib/firebase';
import { planService } from '../services/planService';
import { coachService } from '../services/coachService';
import { staffService } from '../services/staffService';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface GymContextType {
  coaches: Coach[];
  plans: Plan[];
  logs: LogEntry[];
  currentAdmin: Admin | null;
  activeTab: TabType;
  currentMemberId: string | null;
  toasts: Toast[];
  theme: 'light' | 'dark';
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  setTab: (tab: TabType, memberId?: string | null) => void;
  toggleTheme: () => void;
  addLog: (type: LogEntry['type'], description: string) => void;
  refetchPlans: () => Promise<void>;
  refetchCoaches: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [dbReady, setDbReady] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('hulk_v2_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('hulk_v2_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('hulk_v2_admin');
    return saved ? 'dashboard' : 'login';
  });

  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hulk_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // ─── DB Initialization ───────────────────────────────────────────────────
  useEffect(() => {
    seedFirebaseDefaultData().then(() => {
      setDbReady(true);
    });
  }, []);

  const refetchPlans = useCallback(async () => {
    const data = await planService.getPlans();
    setPlans(data);
  }, []);

  const refetchCoaches = useCallback(async () => {
    const data = await coachService.getCoaches();
    setCoaches(data);
  }, []);

  useEffect(() => {
    if (dbReady) {
      refetchPlans();
      refetchCoaches();
    }
  }, [dbReady, refetchPlans, refetchCoaches]);
  // ─────────────────────────────────────────────────────────────────────────

  // Sync logs & admin to localStorage
  useEffect(() => {
    localStorage.setItem('hulk_v2_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('hulk_v2_admin', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('hulk_v2_admin');
    }
  }, [currentAdmin]);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('hulk_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Toast helpers
  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addLog = (type: LogEntry['type'], description: string) => {
    const newLog: LogEntry = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      type,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: currentAdmin?.name || 'System',
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // ─── Auth using DB staff table ────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    // Ensure DB is seeded before login
    await seedFirebaseDefaultData();

    const staffMember = await staffService.validateLogin(email, password);
    if (!staffMember) {
      addToast('error', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      return false;
    }

    const admin: Admin = {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(staffMember.name)}&background=22c55e&color=fff`,
    };

    setCurrentAdmin(admin);
    setActiveTab('dashboard');
    addToast('success', `مرحباً بعودتك، ${admin.name}!`);
    addLog('settings_update', `تم تسجيل دخول ${admin.name} إلى لوحة التحكم`);
    return true;
  };

  const logout = async () => {
    setCurrentAdmin(null);
    setActiveTab('login');
    setCurrentMemberId(null);
    addToast('info', 'تم تسجيل الخروج من نظام إدارة النادي.');
  };
  // ─────────────────────────────────────────────────────────────────────────

  const setTab = (tab: TabType, memberId: string | null = null) => {
    if (!currentAdmin && tab !== 'login') {
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
    if (memberId) setCurrentMemberId(memberId);
  };

  return (
    <GymContext.Provider
      value={{
        coaches,
        plans,
        logs,
        currentAdmin,
        activeTab,
        currentMemberId,
        toasts,
        theme,
        login,
        logout,
        addToast,
        removeToast,
        setTab,
        toggleTheme,
        addLog,
        refetchPlans,
        refetchCoaches,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) throw new Error('useGym must be used within a GymProvider');
  return context;
};
