import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { useMembers, useDeleteMember } from '../hooks/useMembers';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ResponsiveTable } from '../components/common/ResponsiveTable';
import type { TableColumn } from '../components/common/ResponsiveTable';
import { getInitials, getPlanName } from '../utils/helpers';
import { Search, Filter, Plus, Trash2, Eye, ChevronLeft, ChevronRight, UserX } from 'lucide-react';

export const Members: React.FC = () => {
  const { plans, setTab } = useGym();
  const { members, loading: membersLoading } = useMembers();
  const { deleteMember } = useDeleteMember();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Confirm dialog state
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesPlan = planFilter === 'all' || member.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [members, searchTerm, statusFilter, planFilter]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter]);

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const handleDelete = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await deleteMember(pendingDelete.id);
    }
  };

  const columns = useMemo<TableColumn<any>[]>(() => [
    {
      key: 'name',
      header: 'الملف الشخصي',
      render: (member) => {
        const initials = getInitials(member.name);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-slate-800 dark:text-slate-205 truncate">
                {member.name}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'phone',
      header: 'رقم الهاتف',
      render: (member) => (
        <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
          {member.phone || '—'}
        </span>
      )
    },
    {
      key: 'planId',
      header: 'خطة العضوية',
      render: (member) => (
        <span className="font-bold text-slate-850 dark:text-slate-205 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
          {getPlanName(member.planId, plans)}
        </span>
      )
    },
    {
      key: 'endDate',
      header: 'تاريخ الانتهاء',
      render: (member) => (
        <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">
          {member.endDate}
        </span>
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
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setTab('member-details', member.id)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all focus:outline-none cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => handleDelete(member.id, member.name)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-455 hover:text-rose-650 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 dark:hover:border-rose-900 transition-all focus:outline-none cursor-pointer"
            title="حذف العضو"
          >
            <Trash2 className="h-4.5 w-4.5" />
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs select-none">
              {initials}
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-205">
                {member.name}
              </span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 text-right">
                {member.phone || 'بدون هاتف'}
              </span>
            </div>
          </div>
          <Badge type={member.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 dark:border-slate-800 text-xs">
          <div>
            <span className="block text-slate-400 dark:text-slate-500 font-bold mb-1">خطة العضوية</span>
            <span className="font-semibold text-slate-850 dark:text-slate-205">
              {getPlanName(member.planId, plans)}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 dark:text-slate-500 font-bold mb-1">تاريخ الانتهاء</span>
            <span className="font-semibold text-slate-850 dark:text-slate-205">{member.endDate}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setTab('member-details', member.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-305 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-650 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>التفاصيل</span>
          </button>
          <button
            onClick={() => handleDelete(member.id, member.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-305 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-650 dark:hover:text-rose-400 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">دليل الأعضاء</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            إدارة وتصفية ومراجعة الأعضاء وملفات الوصول الخاصة بهم.
          </p>
        </div>
        <button
          onClick={() => setTab('add-member')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-98 cursor-pointer shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>إضافة عضو جديد</span>
        </button>
      </div>

      {/* Search & Filters Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="status-filter"
              aria-label="تصفية الحالة"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-48 pl-3 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="expiring">قارب الانتهاء</option>
              <option value="expired">منتهي فقط</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Plan Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="plan-filter"
              aria-label="تصفية الخطة"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="block w-full sm:w-48 pl-3 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">جميع الخطط</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden p-4">
        <ResponsiveTable
          columns={columns}
          data={paginatedMembers}
          isLoading={membersLoading}
          renderMobileCard={renderMobileCard}
          rowKey={(member) => member.id}
          emptyState={
            <EmptyState
              title="لا يوجد أعضاء مطابقين"
              description="عدّل معايير البحث أو أضف ملف عضو جديد إذا لم يكن مسجلاً بعد."
              icon={<UserX className="h-6 w-6" />}
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

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف العضو"
        message={`هل أنت متأكد من حذف العضو ${pendingDelete?.name || ''}؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="تأكيد الحذف"
        type="danger"
      />
    </div>
  );
};
