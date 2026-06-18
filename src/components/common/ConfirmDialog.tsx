import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  type = 'danger',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'info':
        return <AlertTriangle className="h-6 w-6 text-indigo-500" />;
      case 'danger':
      default:
        return <Trash2 className="h-6 w-6 text-rose-500" />;
    }
  };

  const getButtonBg = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10';
      case 'info':
        return 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/10';
      case 'danger':
      default:
        return 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/10';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-500';
      case 'info':
        return 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40 text-indigo-500';
      case 'danger':
      default:
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 text-rose-500';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border flex-shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>{cancelText}</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${getButtonBg()}`}
          >
            {getIcon()}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
