import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { useMembers, useDeleteMember } from '../hooks/useMembers';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, Plus, Trash2, Eye, ChevronLeft, ChevronRight, UserX, Loader2 } from 'lucide-react';

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

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : 'خطة غير معروفة';
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف العضو ${name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      await deleteMember(id);
    }
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
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {membersLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">جاري تحميل الأعضاء...</p>
          </div>
        ) : totalItems === 0 ? (
          <EmptyState
            title="لا يوجد أعضاء مطابقين"
            description="عدّل معايير البحث أو أضف ملف عضو جديد إذا لم يكن مسجلاً بعد."
            icon={<UserX className="h-6 w-6" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-4">الملف الشخصي</th>
                    <th className="px-6 py-4">رقم الهاتف</th>
                    <th className="px-6 py-4">خطة العضوية</th>
                    <th className="px-6 py-4">تاريخ الانتهاء</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {paginatedMembers.map((member) => {
                    // Create simple initials avatar
                    const initials = member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Name / Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs select-none">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">
                                {member.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                          {member.phone || '—'}
                        </td>

                        {/* Plan */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                            {getPlanName(member.planId)}
                          </span>
                        </td>

                        {/* End Date */}
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                          {member.endDate}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <Badge type={member.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-left">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setTab('member-details', member.id)}
                              className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all focus:outline-none"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id, member.name)}
                              className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 dark:hover:border-rose-900 transition-all focus:outline-none"
                              title="حذف العضو"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                عرض <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                من <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> عضو
              </span>

              <div className="inline-flex gap-1.5">
                <button
                  id="prev-page"
                  aria-label="الصفحة السابقة"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all focus:outline-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all focus:outline-none ${
                      currentPage === page
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all focus:outline-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
