import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { EmptyState } from '../components/common/EmptyState';
import { useGym } from '../context/GymContext';
import { Bell, Check, CheckCheck, ChevronLeft } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { setTab } = useGym();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-500" />
            مركز الإشعارات
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            متابعة التنبيهات، الاشتراكات المنتهية، والدفعات المعلقة.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState
            title="لا توجد إشعارات حالياً"
            description="ليس لديك أية اشتراكات منتهية أو دفعات معلقة، كل شيء على ما يرام!"
            icon={<Bell className="h-6 w-6" />}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors ${
                    notification.isRead ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-70' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${notification.iconClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 mr-14 sm:mr-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800 cursor-pointer focus:outline-none"
                        title="تحديد كمقروء"
                      >
                        <Check className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setTab('member-details', notification.memberId)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>عرض العضو</span>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
