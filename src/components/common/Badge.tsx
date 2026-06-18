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
      styles = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-800/40';
      break;
    case 'expired':
    case 'failed':
      styles = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40';
      break;
    case 'expiring':
    case 'pending':
      styles = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40';
      break;
    case 'admin':
      styles = 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/40';
      break;
    case 'manager':
      styles = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40';
      break;
    case 'staff':
      styles = 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/30 dark:text-sky-450 dark:border-sky-800/40';
      break;
    default:
      styles = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {text}
    </span>
  );
};
