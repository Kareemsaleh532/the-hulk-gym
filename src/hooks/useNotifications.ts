import { useState, useEffect, useMemo } from 'react';
import { useMembers } from './useMembers';
import { usePayments } from './usePayments';
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'expired' | 'expiring' | 'pending';
  icon: LucideIcon;
  iconClass: string;
  memberId: string;
  isRead: boolean;
}

export const useNotifications = () => {
  const { members } = useMembers();
  const { payments } = usePayments();

  const [readIds, setReadIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hulk_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [dismissedPopupUntil, setDismissedPopupUntil] = useState<number>(() => {
    const saved = localStorage.getItem('hulk_popup_dismissed_until');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('hulk_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem('hulk_popup_dismissed_until', dismissedPopupUntil.toString());
  }, [dismissedPopupUntil]);

  const notifications = useMemo(() => {
    const computed: AppNotification[] = [
      ...members
        .filter((m) => m.status === 'expired')
        .map((m) => ({
          id: `expired-${m.id}`,
          title: 'اشتراك منتهي',
          description: `انتهى اشتراك العضو ${m.name} بتاريخ ${m.endDate}`,
          type: 'expired' as const,
          icon: XCircle,
          iconClass: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
          memberId: m.id,
          isRead: false,
        })),
      ...members
        .filter((m) => m.status === 'expiring')
        .map((m) => ({
          id: `expiring-${m.id}`,
          title: 'ينتهي قريباً',
          description: `اشتراك العضو ${m.name} ينتهي قريباً بتاريخ ${m.endDate}`,
          type: 'expiring' as const,
          icon: AlertTriangle,
          iconClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
          memberId: m.id,
          isRead: false,
        })),
      ...payments
        .filter((p) => p.status === 'pending')
        .map((p) => ({
          id: `pending-${p.id}`,
          title: 'دفعة معلقة',
          description: `دفعة معلقة للعضو ${p.memberName} بقيمة ${p.amount} شيكل`,
          type: 'pending' as const,
          icon: Info,
          iconClass: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50',
          memberId: p.memberId,
          isRead: false,
        })),
    ];

    return computed.map(n => ({
      ...n,
      isRead: readIds.includes(n.id)
    }));
  }, [members, payments, readIds]);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const markAsRead = (id: string) => {
    setReadIds(prev => Array.from(new Set([...prev, id])));
  };

  const markAllAsRead = () => {
    setReadIds(notifications.map(n => n.id));
  };

  const dismissPopupForAWeek = () => {
    setDismissedPopupUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  const shouldShowPopup = unreadNotifications.length > 0 && Date.now() > dismissedPopupUntil;

  return {
    notifications,
    unreadNotifications,
    markAsRead,
    markAllAsRead,
    shouldShowPopup,
    dismissPopupForAWeek
  };
};
