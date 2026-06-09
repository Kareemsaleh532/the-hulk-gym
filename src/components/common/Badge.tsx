import React from 'react';

interface BadgeProps {
  type: 'active' | 'expired' | 'expiring' | 'paid' | 'pending' | 'failed' | 'admin' | 'staff' | 'manager';
  label?: string;
}

const badgeLabels: Record<string, string> = {
  active: 'نشط',
  expired: 'منتهي',
  expiring: 'قارب الانتهاء',
  paid: 'مدفوع',
  pending: 'معلّق',
  failed: 'فشل',
  admin: 'مدير',
  staff: 'موظف',
  manager: 'مشرف',
};

export const Badge: React.FC<BadgeProps> = ({ type, label }) => {
  let styles = '';
  const text = label || badgeLabels[type] || type.toUpperCase();

  switch (type) {
    case 'active':
    case 'paid':
      styles = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      break;
    case 'expired':
    case 'failed':
      styles = 'bg-rose-100 text-rose-800 border-rose-200';
      break;
    case 'expiring':
    case 'pending':
      styles = 'bg-amber-100 text-amber-800 border-amber-200';
      break;
    case 'admin':
      styles = 'bg-indigo-100 text-indigo-800 border-indigo-200';
      break;
    case 'manager':
      styles = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    case 'staff':
      styles = 'bg-sky-100 text-sky-800 border-sky-200';
      break;
    default:
      styles = 'bg-slate-100 text-slate-800 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {text}
    </span>
  );
};
