import React from 'react';
import { useGym } from '../../context/GymContext';
import { useMembers } from '../../hooks/useMembers';
import { ChevronLeft, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const { activeTab, setTab, currentMemberId } = useGym();
  const { members } = useMembers();

  if (activeTab === 'login') return null;

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'البوابة', action: () => setTab('dashboard') }];

    switch (activeTab) {
      case 'dashboard':
        crumbs.push({ label: 'لوحة التحكم', action: () => {} });
        break;
      case 'members':
        crumbs.push({ label: 'الأعضاء', action: () => {} });
        break;
      case 'add-member':
        crumbs.push({ label: 'الأعضاء', action: () => setTab('members') });
        crumbs.push({ label: 'إضافة عضو', action: () => {} });
        break;
      case 'member-details':
        crumbs.push({ label: 'الأعضاء', action: () => setTab('members') });
        const member = members.find((m: any) => m.id === currentMemberId);
        crumbs.push({ label: member ? member.name : 'الملف الشخصي', action: () => {} });
        break;
      case 'memberships':
        crumbs.push({ label: 'العضويات', action: () => {} });
        break;
      case 'payments':
        crumbs.push({ label: 'المدفوعات', action: () => {} });
        break;
      case 'coaches':
        crumbs.push({ label: 'المدربين', action: () => {} });
        break;
      case 'reports':
        crumbs.push({ label: 'التقارير', action: () => {} });
        break;
      case 'settings':
        crumbs.push({ label: 'الإعدادات', action: () => {} });
        break;
      default:
        crumbs.push({ label: 'النظام', action: () => {} });
    }

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 py-1 select-none">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 space-x-reverse">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="inline-flex items-center">
              {idx > 0 && <ChevronLeft className="h-3.5 w-3.5 mx-1 text-slate-400" />}
              {idx === 0 ? (
                <button
                  onClick={crumb.action}
                  className="inline-flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors gap-1 text-slate-600 dark:text-slate-450 focus:outline-none"
                >
                  <Home className="h-3 w-3" />
                  <span>{crumb.label}</span>
                </button>
              ) : isLast ? (
                <span className="text-slate-800 dark:text-slate-100 font-semibold truncate max-w-[120px] sm:max-w-none">
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={crumb.action}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                >
                  {crumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
