import React, { useState, useMemo, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { useFilteredMembers } from '../hooks/useFilteredMembers';
import { useRenewMembership } from '../hooks/useMemberships';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ResponsiveTable } from '../components/common/ResponsiveTable';
import type { TableColumn } from '../components/common/ResponsiveTable';
import { getInitials, getPlanName } from '../utils/helpers';
import { Award, RefreshCw, Eye, CheckCircle, Clock, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

type SubTabType = 'active' | 'expired' | 'expiring';

export const Memberships: React.FC = () => {
  const { plans, setTab, addToast } = useGym();
  const { members, loading: membersLoading } = useFilteredMembers();
  const { renewMembership, loading: renewing } = useRenewMembership();
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('active');

  // Renew modal state
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [renewPlanId, setRenewPlanId] = useState(plans[0]?.id || 'plan-basic');
  const [renewStartDate, setRenewStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset pagination on sub tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  // Filter members based on active sub tab
  const tabMembers = useMemo(() => {
    return members.filter((m) => m.status === activeSubTab);
  }, [members, activeSubTab]);

  // Pagination calculations
  const totalItems = tabMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return tabMembers.slice(startIdx, startIdx + itemsPerPage);
  }, [tabMembers, currentPage]);

  const getActiveCount = (planId: string) => {
    return members.filter((m) => m.planId === planId && m.status === 'active').length;
  };

  const openRenewModal = (memberId: string, currentPlanId: string) => {
    setSelectedMemberId(memberId);
    setRenewPlanId(currentPlanId);
    setRenewStartDate(new Date().toISOString().split('T')[0]);
    setIsRenewOpen(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      await renewMembership(selectedMemberId, renewPlanId, renewStartDate);
      addToast('success', 'تم تجديد الاشتراك بنجاح!');
      setIsRenewOpen(false);
      setSelectedMemberId('');
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء تجديد الاشتراك');
    }
  };

  // Helper to format plan duration in Arabic
  const formatDuration = (months: number) => {
    if (months === 1) return 'شهر واحد';
    if (months === 2) return 'شهران';
    if (months === 3) return '٣ أشهر';
    if (months === 6) return '٦ أشهر';
    if (months === 12) return 'سنة كاملة (١٢ شهرًا)';
    return `${months} أشهر`;
  };

  const columns = useMemo<TableColumn<any>[]>(() => [
    {
      key: 'name',
      header: 'اسم العضو',
      render: (member) => {
        const initials = getInitials(member.name);
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-[10px] select-none">
              {initials}
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-250 text-right">{member.name}</span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-right">{member.phone}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'planId',
      header: 'برنامج الاشتراك',
      render: (member) => (
        <span className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
          {getPlanName(member.planId, plans)}
        </span>
      )
    },
    {
      key: 'startDate',
      header: 'تاريخ البدء',
      render: (member) => (
        <span className="text-slate-500 dark:text-slate-400 font-semibold">{member.startDate}</span>
      )
    },
    {
      key: 'endDate',
      header: 'تاريخ الانتهاء',
      render: (member) => (
        <span className="text-slate-500 dark:text-slate-400 font-semibold">{member.endDate}</span>
      )
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (member) => <Badge type={member.status} />
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'left',
      render: (member) => (
        <div className="inline-flex gap-2">
          <button
            onClick={() => setTab('member-details', member.id)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all focus:outline-none cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openRenewModal(member.id, member.planId)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-655 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-100 dark:hover:border-emerald-800 transition-all focus:outline-none cursor-pointer"
            title="تجديد الاشتراك"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ], [plans, setTab]);

  const renderMobileCard = (member: any) => {
    const initials = getInitials(member.name);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-605 dark:text-slate-400 flex items-center justify-center font-bold text-xs select-none">
              {initials}
            </div>
            <div>
              <span className="block font-bold text-slate-850 dark:text-slate-100 text-right">{member.name}</span>
              <span className="block text-[10px] text-slate-405 dark:text-slate-500 mt-0.5 text-right">{member.phone}</span>
            </div>
          </div>
          <Badge type={member.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 dark:border-slate-800 text-xs">
          <div>
            <span className="block text-slate-400 dark:text-slate-500 font-bold mb-1 text-right">الخطة</span>
            <span className="font-semibold text-slate-850 dark:text-slate-205 block text-right">
              {getPlanName(member.planId, plans)}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 dark:text-slate-500 font-bold mb-1 text-right">البدء</span>
            <span className="font-semibold text-slate-850 dark:text-slate-205 block text-right">{member.startDate}</span>
          </div>
          <div>
            <span className="block text-slate-400 dark:text-slate-500 font-bold mb-1 text-right">الانتهاء</span>
            <span className="font-semibold text-slate-850 dark:text-slate-205 block text-right">{member.endDate}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTab('member-details', member.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-605 dark:text-slate-305 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-650 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>التفاصيل</span>
          </button>
          <button
            onClick={() => openRenewModal(member.id, member.planId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-605 dark:text-slate-305 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-650 dark:hover:text-emerald-400 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تجديد</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">إدارة الاشتراكات</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          مراجعة باقات اشتراكات النادي ومراقبة دورة حياة اشتراكات العملاء.
        </p>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const count = getActiveCount(plan.id);
          let planBorder = 'border-slate-100';
          let iconColor = 'text-slate-400 bg-slate-50';

          if (plan.durationMonths <= 3) {
            planBorder = 'border-slate-100 dark:border-slate-800';
            iconColor = 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800';
          } else if (plan.durationMonths <= 6) {
            planBorder = 'border-indigo-100 dark:border-indigo-900/50 shadow-sm shadow-indigo-100/20';
            iconColor = 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30';
          } else {
            planBorder = 'border-emerald-100 dark:border-emerald-900/50 shadow-md shadow-emerald-50/40';
            iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
          }

          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${planBorder}`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50 ${iconColor}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                    {formatDuration(plan.durationMonths)}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{plan.name}</h3>
                
                <div className="flex items-baseline mt-2 mb-4">
                  <span className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">{plan.price} شيكل</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold mr-1">/ باقة</span>
                </div>

                <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-black mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-500">الأعضاء النشطون</span>
                <span className="text-slate-800 dark:text-slate-200 font-black bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  {count} مسجل
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Tab triggers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-2 gap-2">
          {(['active', 'expiring', 'expired'] as SubTabType[]).map((tab) => {
            let count = members.filter((m) => m.status === tab).length;
            let tabLabel = 'البرامج النشطة';
            let tabIcon = <CheckCircle className="h-4 w-4" />;
            let activeColor = 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-xs';

            if (tab === 'expiring') {
              tabLabel = 'أوشكت على الانتهاء';
              tabIcon = <Clock className="h-4 w-4" />;
              activeColor = 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-xs';
            } else if (tab === 'expired') {
              tabLabel = 'منتهية الصلاحية';
              tabIcon = <AlertTriangle className="h-4 w-4" />;
              activeColor = 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs';
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-transparent transition-all focus:outline-none cursor-pointer ${
                  activeSubTab === tab
                    ? activeColor
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {tabIcon}
                <span>{tabLabel}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-4">
          <ResponsiveTable
            columns={columns}
            data={paginatedMembers}
            isLoading={membersLoading}
            renderMobileCard={renderMobileCard}
            rowKey={(member) => member.id}
            emptyState={
              <EmptyState
                title={`لا يوجد أعضاء ${activeSubTab === 'active' ? 'نشطون' : activeSubTab === 'expiring' ? 'تنتهي صلاحيتهم قريبًا' : 'منتهية صلاحيتهم'}`}
                description={`لا يوجد حاليًا أي أعضاء في النادي يندرجون تحت تصنيف ${activeSubTab === 'active' ? 'النشطين' : activeSubTab === 'expiring' ? 'الذين يوشك اشتراكهم على الانتهاء' : 'منتهيي الصلاحية'}.`}
              />
            }
          />

          {!membersLoading && totalItems > 0 && (
            /* Pagination Controls */
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 mt-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                عرض <span className="font-bold text-slate-800 dark:text-slate-205">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                <span className="font-bold text-slate-800 dark:text-slate-205">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                من <span className="font-bold text-slate-800 dark:text-slate-205">{totalItems}</span> عضو
              </span>

              <div className="inline-flex gap-1.5">
                <button
                  id="prev-page"
                  aria-label="الصفحة السابقة"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-500 transition-all focus:outline-none cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                      currentPage === page
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-205'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  id="next-page"
                  aria-label="الصفحة التالية"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-500 transition-all focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Renew Modal */}
      <Modal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        title="تجديد برنامج الاشتراك"
      >
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          <div>
            <label htmlFor="renew-plan" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              اختر برنامج الاشتراك
            </label>
            <select
              id="renew-plan"
              aria-label="اختر برنامج الاشتراك"
              value={renewPlanId}
              onChange={(e) => setRenewPlanId(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price} شيكل / {formatDuration(p.durationMonths)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="renew-start-date" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              تاريخ بدء التجديد
            </label>
            <input
              id="renew-start-date"
              aria-label="تاريخ بدء التجديد"
              type="date"
              required
              value={renewStartDate}
              onChange={(e) => setRenewStartDate(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRenewOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={renewing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
            >
              {renewing && <Loader2 className="h-3 w-3 animate-spin" />}
              تأكيد التجديد
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
