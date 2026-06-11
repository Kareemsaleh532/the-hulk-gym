import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Admin, TabType, LogEntry, Plan, Coach } from '../types';
import { INITIAL_COACHES, INITIAL_PLANS, INITIAL_LOGS } from '../mockData';

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
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [plans] = useState<Plan[]>(INITIAL_PLANS);

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('hulk_v2_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('hulk_v2_admin');
    return saved ? JSON.parse(saved) : {
      id: 'admin-1',
      name: 'جون هلكرسون',
      email: 'admin@hulkgym.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return currentAdmin ? 'dashboard' : 'login';
  });

  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hulk_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Sync to local storage
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

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('hulk_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast Helpers
  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to add activity log
  const addLog = (type: LogEntry['type'], description: string) => {
    const newLog: LogEntry = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      type,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: currentAdmin?.name || 'System Operator',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  // Helper to fetch the staff profile linked to an auth.user id
  const fetchStaffProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as { user_id: string; name: string; email: string; role: string };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        addToast('error', 'البريد الإلكتروني أو كلمة المرور غير صالحة.');
        return false;
      }

      const user = data.user;
      const profile = await fetchStaffProfile(user.id);
      if (!profile) {
        // Not a staff user
        await supabase.auth.signOut();
        addToast('error', 'ليس لديك صلاحية دخول إلى لوحة الموظفين. تواصل مع المسؤول.');
        return false;
      }

      const admin: Admin = {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        role: profile.role as any,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=22c55e&color=fff`
      };

      setCurrentAdmin(admin);
      setActiveTab('dashboard');
      addToast('success', `تم تسجيل الدخول باسم ${admin.name}`);
      addLog('settings_update', 'تم تسجيل دخول المسؤول إلى بوابة الموظفين');
      return true;
    } catch (err) {
      addToast('error', 'فشل الاتصال بخدمة المصادقة.');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentAdmin(null);
    setActiveTab('login');
    setCurrentMemberId(null);
    addToast('info', 'تم تسجيل الخروج من نظام إدارة النادي.');
  };

  // Initialize auth session and listen to auth state changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchStaffProfile(session.user.id);
          if (profile && mounted) {
            setCurrentAdmin({
              id: profile.user_id,
              name: profile.name,
              email: profile.email,
              role: profile.role as any,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=22c55e&color=fff`
            });
            setActiveTab('dashboard');
          } else if (mounted) {
            setActiveTab('login');
          }
        }
      } catch (e) {
        // ignore
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchStaffProfile(session.user.id);
        if (profile && mounted) {
          setCurrentAdmin({
            id: profile.user_id,
            name: profile.name,
            email: profile.email,
            role: profile.role as any,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=22c55e&color=fff`
          });
          setActiveTab('dashboard');
        }
      } else if (mounted) {
        setCurrentAdmin(null);
        setActiveTab('login');
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Navigation Helper
  const setTab = (tab: TabType, memberId: string | null = null) => {
    if (!currentAdmin && tab !== 'login') {
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
    if (memberId) {
      setCurrentMemberId(memberId);
    }
  };

  // Removed local data operations for members and payments

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
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
