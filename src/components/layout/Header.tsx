import React from 'react';
import { useGym } from '../../context/GymContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Menu, Calendar, Bell, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentAdmin, theme, toggleTheme } = useGym();

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('ar-SA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!currentAdmin) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none lg:hidden transition-colors border border-slate-200 dark:border-slate-700"
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
          <span>{getFormattedDate()}</span>
        </div>

        {/* Dark/Light Mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 focus:outline-none cursor-pointer"
          title={theme === 'light' ? 'التبديل للوضع الداكن' : 'التبديل للوضع الفاتح'}
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications mock button */}
        <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 focus:outline-none">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

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
            <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">
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
