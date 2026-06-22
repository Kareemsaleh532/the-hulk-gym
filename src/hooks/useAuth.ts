import { useMemo } from 'react';
import { useGym } from '../context/GymContext';
import type { Member, Coach, GenderType, TabType } from '../types';

export const useAuth = () => {
  const { currentAdmin } = useGym();

  const isAdmin = currentAdmin?.role === 'admin';
  const isManager = currentAdmin?.role === 'manager';
  const isStaff = currentAdmin?.role === 'staff';
  const staffGender = currentAdmin?.gender || null;

  // Page access permissions
  const canViewAccounting = isAdmin || isManager;
  const canViewAdminPanel = isAdmin || isManager;
  const canManageStaff = isAdmin;

  // Gender-based member filtering
  const allowedGenders: GenderType[] = useMemo(() => {
    if (isAdmin || isManager) return ['Male', 'Female', 'Other'];
    if (isStaff && staffGender === 'male') return ['Male'];
    if (isStaff && staffGender === 'female') return ['Female'];
    // Fallback: no gender set, show all
    return ['Male', 'Female', 'Other'];
  }, [isAdmin, isManager, isStaff, staffGender]);

  const canViewMember = (member: Member): boolean => {
    if (isAdmin || isManager) return true;
    if (isStaff && staffGender === 'male') return member.gender === 'Male';
    if (isStaff && staffGender === 'female') return member.gender === 'Female';
    return true;
  };

  const filterMembersByAccess = (members: Member[]): Member[] => {
    if (isAdmin || isManager) return members;
    return members.filter(canViewMember);
  };

  // Gender-based coach filtering
  const filterCoachesByAccess = (coaches: Coach[]): Coach[] => {
    if (isAdmin || isManager) return coaches;
    if (isStaff && staffGender) {
      return coaches.filter(c => !c.gender || c.gender === staffGender);
    }
    return coaches;
  };

  // Tab/page access check
  const canAccessTab = (tab: TabType): boolean => {
    if (tab === 'accounting') return canViewAccounting;
    if (tab === 'admin') return canViewAdminPanel;
    return true; // All other pages are accessible to all logged-in users
  };

  return {
    isAdmin,
    isManager,
    isStaff,
    staffGender,
    canViewAccounting,
    canViewAdminPanel,
    canManageStaff,
    allowedGenders,
    canViewMember,
    filterMembersByAccess,
    filterCoachesByAccess,
    canAccessTab,
  };
};
