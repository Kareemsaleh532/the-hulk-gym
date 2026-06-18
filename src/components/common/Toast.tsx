import React from 'react';
import { useGym } from '../../context/GymContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let bgColor = 'bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200';
        let icon = <Info className="h-5 w-5 text-sky-500" />;

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300';
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300';
          icon = <XCircle className="h-5 w-5 text-rose-500" />;
        } else if (toast.type === 'info') {
          bgColor = 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300';
          icon = <Info className="h-5 w-5 text-blue-500" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform duration-300 animate-slide-in ${bgColor}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="إغلاق الإشعار"
              title="إغلاق الإشعار"
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
