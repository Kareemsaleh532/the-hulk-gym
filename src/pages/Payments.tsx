import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { usePayments, useCreatePayment, useUpdatePaymentStatus, useDeletePayment } from '../hooks/usePayments';
import { useMembers } from '../hooks/useMembers';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, Plus, Eye, CreditCard, Loader2, Trash2, CheckCircle } from 'lucide-react';

export const Payments: React.FC = () => {
  const { setTab, addToast } = useGym();
  const { payments, loading: paymentsLoading } = usePayments();
  const { members } = useMembers();
  const { createPayment, loading: paying } = useCreatePayment();
  const { updateStatus } = useUpdatePaymentStatus();
  const { deletePayment } = useDeletePayment();

  const handleMarkPaid = async (id: string) => {
    await updateStatus(id, 'paid');
    addToast('success', 'تم تحديث حالة الدفعة إلى "مدفوع"');
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    await deletePayment(id);
    addToast('success', 'تم حذف سجل الدفعة بنجاح');
  };

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Modal state
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  // Form states
  const [newPayMemberId, setNewPayMemberId] = useState(members[0]?.id || '');
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayMethod, setNewPayMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Mobile Payment'>('Credit Card');
  const [newPayStatus, setNewPayStatus] = useState<'paid' | 'pending'>('paid');

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const matchesSearch =
        pay.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || pay.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === '2026-06') {
        matchesDate = pay.date.startsWith('2026-06');
      } else if (dateFilter === '2026-05') {
        matchesDate = pay.date.startsWith('2026-05');
      } else if (dateFilter === '2025') {
        matchesDate = pay.date.startsWith('2025');
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPayMemberId) {
      addToast('error', 'يرجى اختيار عضو.');
      return;
    }

    if (!newPayAmount || isNaN(Number(newPayAmount)) || Number(newPayAmount) <= 0) {
      addToast('error', 'يرجى إدخال مبلغ فوترة صحيح.');
      return;
    }

    try {
      await createPayment({
        memberId: newPayMemberId,
        amount: Number(newPayAmount),
        method: newPayMethod,
        status: newPayStatus,
      });

      addToast('success', 'تم تسجيل إيصال الدفع بنجاح');
      // Reset form & close modal
      setNewPayAmount('');
      setIsAddPaymentOpen(false);
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء تسجيل الدفعة');
    }
  };

  const methodLabels: Record<string, string> = {
    'Credit Card': 'بطاقة ائتمان',
    'Cash': 'نقداً',
    'Bank Transfer': 'تحويل بنكي',
    'Mobile Payment': 'دفع إلكتروني',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">دليل المدفوعات</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            مراجعة الفواتير، تسجيل المدفوعات النقدية/البطاقات، والتحقق من إيصالات المعاملات.
          </p>
        </div>
        <button
          onClick={() => {
            if (members.length === 0) {
              addToast('error', 'أضف عضواً قبل تسجيل دفعة.');
              return;
            }
            setNewPayMemberId(members[0].id);
            setIsAddPaymentOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-98 cursor-pointer shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>تسجيل معاملة دفع</span>
        </button>
      </div>

      {/* Search & Filters Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="البحث باسم العضو أو رقم الإيصال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="payments-status-filter"
              aria-label="تصفية الحالة"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-44 pl-3 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="paid">مدفوع فقط</option>
              <option value="pending">معلّق فقط</option>
              <option value="failed">فشل فقط</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Filter className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Date Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              id="payments-date-filter"
              aria-label="تصفية التاريخ"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full sm:w-44 pl-3 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">جميع التواريخ</option>
              <option value="2026-06">يونيو ٢٠٢٦</option>
              <option value="2026-05">مايو ٢٠٢٦</option>
              <option value="2025">سنة ٢٠٢٥</option>
            </select>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Filter className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Payments History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {paymentsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">جاري تحميل المدفوعات...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            title="لا توجد مدفوعات مطابقة"
            description="عدّل معايير البحث أو سجّل معاملة عميل جديدة أعلاه."
            icon={<CreditCard className="h-6 w-6" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">رقم الإيصال</th>
                  <th className="px-6 py-4">اسم العضو</th>
                  <th className="px-6 py-4">تاريخ المعاملة</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {pay.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-100">
                      {pay.memberName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                      {pay.date}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100">
                      ${pay.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                      {methodLabels[pay.method] || pay.method}
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={pay.status} />
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setTab('member-details', pay.memberId)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all focus:outline-none"
                          title="عرض ملف العضو"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {pay.status === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(pay.id)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-100 dark:hover:border-emerald-800 transition-all focus:outline-none"
                            title="تحديد كمدفوع"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayment(pay.id)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-100 dark:hover:border-rose-800 transition-all focus:outline-none"
                          title="حذف الدفعة"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        title="تسجيل معاملة دفع"
      >
        <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-pay-member" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              اختر عضو النادي
            </label>
            <select
              id="new-pay-member"
              aria-label="اختر عضو النادي"
              value={newPayMemberId}
              onChange={(e) => setNewPayMemberId(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-pay-amount" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              مبلغ الفاتورة ($)
            </label>
            <input
              id="new-pay-amount"
              aria-label="مبلغ الفاتورة"
              type="number"
              step="0.01"
              required
              placeholder="مثال: ٤٩.٩٩"
              value={newPayAmount}
              onChange={(e) => setNewPayAmount(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="new-pay-method" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              طريقة الدفع
            </label>
            <select
              id="new-pay-method"
              aria-label="طريقة الدفع"
              value={newPayMethod}
              onChange={(e) => setNewPayMethod(e.target.value as any)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Credit Card">بطاقة ائتمان</option>
              <option value="Cash">نقداً</option>
              <option value="Bank Transfer">تحويل بنكي</option>
              <option value="Mobile Payment">دفع إلكتروني</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              حالة الدفع
            </label>
            <div className="flex gap-2">
              {(['paid', 'pending'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setNewPayStatus(opt)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    newPayStatus === opt
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs dark:bg-emerald-600 dark:border-emerald-600 dark:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt === 'paid' ? 'مدفوع' : 'معلّق'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddPaymentOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
            >
              {paying && <Loader2 className="h-3 w-3 animate-spin" />}
              تسجيل الإيصال
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
