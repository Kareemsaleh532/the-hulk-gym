import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useGym } from '../../context/GymContext';
import { X, Bell } from 'lucide-react';

export const NotificationPopup: React.FC = () => {
  const { unreadNotifications, shouldShowPopup, dismissPopupForAWeek } = useNotifications();
  const { setTab } = useGym();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShowPopup) {
      // Delay showing the popup slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowPopup]);

  if (!isVisible || unreadNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">إشعارات جديدة</h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">لديك {unreadNotifications.length} تنبيه غير مقروء</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            dismissPopupForAWeek();
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none"
          title="إغلاق وعدم التذكير لمدة أسبوع"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 bg-white dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-relaxed">
          هناك بعض الاشتراكات والدفعات التي تتطلب انتباهك. هل ترغب في مراجعتها الآن؟
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsVisible(false);
              setTab('notifications');
            }}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-xs transition-colors"
          >
            عرض الإشعارات
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              dismissPopupForAWeek();
            }}
            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};
