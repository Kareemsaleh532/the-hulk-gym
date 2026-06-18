import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Menu, Calendar, Bell, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentAdmin, theme, toggleTheme, setTab } = useGym();
  const { unreadNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = React.useMemo(() => {
    return new Date().toLocaleDateString('ar-SA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  if (!currentAdmin) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none md:hidden transition-colors border border-slate-200 dark:border-slate-700"
          title="قائمة التنقل"
          aria-label="قائمة التنقل"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs Trail */}
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Current Date */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl">
          <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span>{formattedDate}</span>
        </div>

        {/* Dark/Light Mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 focus:outline-none cursor-pointer"
          title={theme === 'light' ? 'التبديل للوضع الداكن' : 'التبديل للوضع الفاتح'}
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Popover Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            title="الإشعارات"
            aria-label="الإشعارات"
            className={`relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 focus:outline-none cursor-pointer ${
              isOpen ? 'bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-300' : ''
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Popover Card */}
          {isOpen && (
            <div className="absolute left-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-in">
              {/* Popover Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 dark:text-slate-205">الإشعارات والتنبيهات</span>
                {unreadNotifications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30">
                    {unreadNotifications.length} تنبيه غير مقروء
                  </span>
                )}
              </div>

              {/* Popover Body list */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 custom-scrollbar">
                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-10 px-5 space-y-1.5">
                    <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-450">لا توجد إشعارات جديدة</p>
                    <p className="text-[10px] text-slate-400">جميع الاشتراكات والدفعات المتبقية تم الاطلاع عليها.</p>
                  </div>
                ) : (
                  unreadNotifications.map((n) => {
                    const IconComponent = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setTab('member-details', n.memberId);
                          setIsOpen(false);
                        }}
                        className="flex gap-3 p-4 hover:bg-slate-50/60 dark:hover:bg-slate-850/45 cursor-pointer transition-colors"
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 h-9 w-9 flex items-center justify-center border ${n.iconClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5 truncate">{n.title}</p>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2">
                <button
                  onClick={() => {
                    setTab('notifications');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors cursor-pointer"
                >
                  عرض جميع الإشعارات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />

        {/* Profile indicator */}
        <div className="flex items-center gap-2">
          <img
            src={currentAdmin.avatar}
            alt={currentAdmin.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/10"
          />
          <div className="hidden sm:block text-right select-none">
            <p className="text-xs font-bold text-slate-850 dark:text-slate-205 leading-tight">
              {currentAdmin.name}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mt-0.5">
              {currentAdmin.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
