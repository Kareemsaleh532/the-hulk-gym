import React from 'react';
import { useGym } from '../../context/GymContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let bgColor = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="h-5 w-5 text-sky-500" />;

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-800';
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50 border-rose-200 text-rose-800';
          icon = <XCircle className="h-5 w-5 text-rose-500" />;
        } else if (toast.type === 'info') {
          bgColor = 'bg-blue-50 border-blue-200 text-blue-800';
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
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
