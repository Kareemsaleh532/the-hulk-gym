export type MemberStatus = 'active' | 'expired' | 'expiring';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type GenderType = 'Male' | 'Female' | 'Other';
export type TabType = 'login' | 'dashboard' | 'members' | 'add-member' | 'member-details' | 'memberships' | 'payments' | 'coaches' | 'reports' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
  avatar: string;
}

// Alias for clarity in context
export type Admin = User;

export interface Member {
  id: string;
  name: string;
  phone: string;
  gender: GenderType;
  dob: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: MemberStatus;
  notes: string;
}

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  features: string[];
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Mobile Payment';
  status: PaymentStatus;
}

export interface Coach {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  avatar: string;
  assignedMembersCount: number;
}

export interface ActivityLog {
  id: string;
  type: 'member_add' | 'member_update' | 'payment_add' | 'membership_renew' | 'settings_update';
  description: string;
  timestamp: string;
  operatorName: string;
}

// Alias used by GymContext
export type LogEntry = ActivityLog;
