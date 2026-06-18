import React from 'react';
import { useGym } from '../../context/GymContext';
import {
  LayoutDashboard,
  Users,
  Award,
  DollarSign,
  UserCheck,
  Settings,
  LogOut,
  X,
  PlusCircle,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setTab, logout, currentAdmin } = useGym();

  const navigationItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'members', name: 'دليل الأعضاء', icon: Users, subIds: ['add-member', 'member-details'] },
    { id: 'memberships', name: 'خطط العضوية', icon: Award },
    { id: 'payments', name: 'سجل المدفوعات', icon: DollarSign },
    { id: 'coaches', name: 'فريق المدربين', icon: UserCheck },
    ...(currentAdmin?.role === 'admin' || currentAdmin?.role === 'manager' 
      ? [
          { id: 'accounting', name: 'المحاسبة والمالية', icon: Wallet },
          { id: 'admin', name: 'إدارة النظام', icon: ShieldCheck }
        ] 
      : []),
    { id: 'settings', name: 'إعدادات البوابة', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setTab(tabId as any);
    onClose(); // Close mobile drawer if open
  };

  const isActive = (item: typeof navigationItems[0]) => {
    if (activeTab === item.id) return true;
    if (item.subIds && item.subIds.includes(activeTab)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-64 md:w-20 lg:w-64 bg-slate-950 text-slate-100 border-l border-slate-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header/Brand logo */}
        <div className="flex items-center justify-between md:justify-center lg:justify-between px-6 py-4 md:px-4 lg:px-6 border-b border-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900/50 border border-slate-800 p-0.5 overflow-hidden flex-shrink-0">
              <img
                src="/hulk-logo.png"
                alt="شعار ذا هالك جيم"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="md:hidden lg:block">
              <h1 className="text-sm font-black tracking-wider uppercase text-emerald-400 leading-none">
                ذا هالك جيم
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                بوابة الموظفين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick action button for admins */}
        <div className="px-4 md:px-2 lg:px-4 py-4 border-b border-slate-900 flex-shrink-0 flex justify-center">
          <button
            onClick={() => handleNavClick('add-member')}
            title="إضافة عضو جديد"
            className="flex items-center justify-center gap-2 w-full md:w-10 md:h-10 md:p-0 md:rounded-full lg:w-full lg:h-auto lg:rounded-xl lg:px-4 lg:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="md:hidden lg:inline">إضافة عضو جديد</span>
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 md:px-2 lg:px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.name}
                className={`flex items-center justify-start md:justify-center lg:justify-start gap-3 w-full px-4 md:px-0 md:h-10 lg:h-auto lg:px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="md:hidden lg:inline">{item.name}</span>
                {active && (
                  <span className="mr-auto w-1.5 h-6 rounded-full bg-emerald-400 md:hidden lg:block" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin profile & logout */}
        {currentAdmin && (
          <div className="p-4 border-t border-slate-900 flex-shrink-0">
            <div className="flex items-center justify-center lg:justify-start gap-3 p-2.5 md:p-1 lg:p-2.5 rounded-xl bg-slate-900/40 border border-slate-900 mb-3">
              <img
                src={currentAdmin.avatar}
                alt={currentAdmin.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="flex-1 min-w-0 md:hidden lg:block">
                <p className="text-sm font-bold text-white truncate leading-none">
                  {currentAdmin.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-1">
                  {currentAdmin.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="تسجيل الخروج"
              className="flex items-center justify-center gap-2 w-full md:w-10 md:h-10 md:p-0 md:rounded-full lg:w-full lg:h-auto lg:rounded-xl lg:px-4 lg:py-2.5 border border-slate-800 hover:border-rose-950 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 font-semibold text-sm transition-all focus:outline-none mx-auto cursor-pointer"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="md:hidden lg:inline">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
