import { useCallback } from 'react';
import { useGym } from '../context/GymContext';
import { useAuth } from './useAuth';
import type { TabType } from '../types';

export const useRouteGuard = () => {
  const { setTab, addToast } = useGym();
  const { canAccessTab } = useAuth();

  const guardedSetTab = useCallback((tab: TabType, memberId?: string | null) => {
    if (!canAccessTab(tab)) {
      addToast('error', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
      return;
    }
    setTab(tab, memberId);
  }, [canAccessTab, setTab, addToast]);

  return {
    canAccessTab,
    guardedSetTab,
  };
};
