import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useMembers, useUpdateMember } from '../hooks/useMembers';
import { useRenewMembership, useWithdrawMembership } from '../hooks/useMemberships';
import { usePayments, useCreatePayment } from '../hooks/usePayments';
import { useCoaches } from '../hooks/useCoaches';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ResponsiveTable } from '../components/common/ResponsiveTable';
import type { TableColumn } from '../components/common/ResponsiveTable';
import {
  ArrowRight,
  User,
  Phone,
  Calendar,
  CreditCard,
  History,
  FileText,
  Save,
  RefreshCw,
  PlusCircle,
  Loader2,
  UserMinus
} from 'lucide-react';

export const MemberDetails: React.FC = () => {
  const {
    plans,
    currentMemberId,
    setTab,
    addToast
  } = useGym();

  const { members } = useMembers();
  const { payments } = usePayments();
  const { updateMember, loading: updating } = useUpdateMember();
  const { renewMembership, loading: renewing } = useRenewMembership();
  const { withdrawMembership, loading: withdrawing } = useWithdrawMembership();
  const { createPayment, loading: paying } = useCreatePayment();
  const { coaches } = useCoaches();

  const member = members.find((m) => m.id === currentMemberId);

  // States
  const [editableNotes, setEditableNotes] = useState(member?.notes || '');
  const [editableCoachId, setEditableCoachId] = useState(member?.coachId || '');
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Renew form state
  const [renewPlanId, setRenewPlanId] = useState(plans[0]?.id || 'plan-basic');
  const [renewStartDate, setRenewStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [renewPayMethod, setRenewPayMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Mobile Payment'>('Cash');
  const [renewPayStatus, setRenewPayStatus] = useState<'paid' | 'pending' | 'failed'>('paid');

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'Mobile Payment'>('Credit Card');
  const [payStatus, setPayStatus] = useState<'paid' | 'pending'>('paid');

  // Reset states if member changes
  React.useEffect(() => {
    if (member) {
      setEditableNotes(member.notes);
      setEditableCoachId(member.coachId || '');
    }
  }, [member]);

  // helper to translate payment methods for column mapping
  // Helper to translate payment methods
  const translateMethod = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return 'بطاقة ائتمانية';
      case 'Cash':
        return 'نقدًا';
      case 'Bank Transfer':
        return 'تحويل بنكي';
      case 'Mobile Payment':
        return 'الدفع عبر الهاتف';
      default:
        return method;
    }
  };

  const paymentColumns: TableColumn<any>[] = [
    {
      key: 'id',
      header: 'رقم الإيصال',
      render: (p) => <span className="font-bold text-slate-800 dark:text-slate-200">{p.id}</span>
    },
    {
      key: 'date',
      header: 'التاريخ',
      render: (p) => <span>{p.date}</span>
    },
    {
      key: 'method',
      header: 'طريقة الدفع',
      render: (p) => <span className="text-slate-500 dark:text-slate-400">{translateMethod(p.method)}</span>
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (p) => <span className="font-bold text-slate-850 dark:text-slate-100">{p.amount.toFixed(2)} شيكل</span>
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (p) => <Badge type={p.status} />
    }
  ];

  const renderPaymentMobileCard = (p: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200">إيصال #{p.id}</span>
        <Badge type={p.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-50 dark:border-slate-800/50">
        <div>
          <span className="block text-slate-400 dark:text-slate-500">التاريخ</span>
          <span className="font-semibold text-slate-705 dark:text-slate-300">{p.date}</span>
        </div>
        <div>
          <span className="block text-slate-400 dark:text-slate-500">المبلغ وطريقة الدفع</span>
          <span className="font-bold text-slate-850 dark:text-slate-100 block">{p.amount.toFixed(2)} شيكل ({translateMethod(p.method)})</span>
        </div>
      </div>
    </div>
  );

  if (!member) {
    return (
      <div className="space-y-6 animate-fade-in py-10">
        <button
          onClick={() => setTab('members')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى الدليل</span>
        </button>
        <EmptyState
          title="لم يتم العثور على ملف العضو"
          description="قد يكون الملف الشخصي المحدد قد تمت إزالته أو أنه غير موجود."
        />
      </div>
    );
  }

  const activePlan = plans.find((p) => p.id === member.planId);
  const memberPayments = payments.filter((p) => p.memberId === member.id);

  const handleSaveNotes = async () => {
    try {
      await updateMember(member.id, { 
        notes: editableNotes, 
        coachId: editableCoachId || undefined 
      });
      addToast('success', 'تم حفظ بيانات العضو بنجاح');
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await renewMembership(member.id, renewPlanId, renewStartDate, {
        method: renewPayMethod,
        status: renewPayStatus
      });
      addToast('success', 'تم تجديد الاشتراك بنجاح');
      setIsRenewOpen(false);
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء تجديد الاشتراك');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || isNaN(Number(payAmount))) return;

    try {
      await createPayment({
        memberId: member.id,
        amount: Number(payAmount),
        method: payMethod,
        status: payStatus,
      });
      addToast('success', 'تم تسجيل إيصال الدفع بنجاح');
      setPayAmount('');
      setIsPaymentOpen(false);
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء تسجيل المدفوعات');
    }
  };

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Helper to translate genders
  const translateGender = (g: string) => {
    if (g === 'Male') return 'ذكر';
    if (g === 'Female') return 'أنثى';
    return g;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header / Back action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => setTab('members')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى الدليل</span>
        </button>
        
        <div className="flex items-center gap-3">
          <Badge type={member.status} />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">المعرف: {member.id}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Column (RTL context) / Left Column (visual): Personal info & Notes */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/20 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xl mb-4 select-none shadow-inner">
              {initials}
            </div>
            
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">{member.name}</h3>

            <div className="w-full border-t border-slate-50 dark:border-slate-800/50 my-5" />

            <div className="w-full text-right space-y-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>{member.phone || 'لا يوجد هاتف مسجل'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>{translateGender(member.gender)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>تاريخ الميلاد: {member.dob}</span>
              </div>
            </div>
          </div>

          {/* Notes & Coach Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>إعدادات المدرب والملاحظات</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">المدرب الشخصي</label>
                <select
                  value={editableCoachId}
                  onChange={(e) => setEditableCoachId(e.target.value)}
                  className="block w-full p-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">-- غير محدد --</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">ملاحظات الملف</label>
                <textarea
                  rows={3}
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="لا توجد ملاحظات مسجلة لهذا العضو بعد..."
                />
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={updating}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all active:scale-98 cursor-pointer"
              >
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>

        {/* Left Columns (RTL context) / Right Columns (visual): Membership details & Billing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Membership Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  تفاصيل الاشتراك النشط
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                  تفاصيل الخطة الصالحة وجدول الفترات الزمنية.
                </p>
              </div>

              <div className="flex gap-2">
                {member.status === 'active' && (
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-150 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-bold text-xs transition-all cursor-pointer"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    <span>انسحاب</span>
                  </button>
                )}
                <button
                  onClick={() => setIsRenewOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-150 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-bold text-xs transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>تجديد الاشتراك</span>
                </button>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-150 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold text-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>تسجيل دفعة</span>
                </button>
              </div>
            </div>

            {/* Plan Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
                <span className="block text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">الخطة الحالية</span>
                <span className="block text-sm font-black text-slate-800 dark:text-slate-100 mt-1.5">{activePlan?.name || '—'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
                <span className="block text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">تكلفة الاشتراك</span>
                <span className="block text-sm font-black text-slate-800 dark:text-slate-100 mt-1.5">{activePlan?.price || '0.00'} شيكل</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
                <span className="block text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">تاريخ البدء</span>
                <span className="block text-sm font-black text-slate-800 dark:text-slate-100 mt-1.5">{member.startDate}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
                <span className="block text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">تاريخ الانتهاء</span>
                <span className="block text-sm font-black text-slate-850 dark:text-slate-100 mt-1.5">{member.endDate}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <h3 className="text-xs font-bold text-slate-805 dark:text-slate-100 uppercase tracking-wider">
                سجل الفواتير والمدفوعات
              </h3>
            </div>

            {memberPayments.length === 0 ? (
              <EmptyState
                title="لا توجد مدفوعات مسجلة"
                description="لم يتم تسجيل أي فواتير أو إيصالات دفع لهذا العضو بعد."
                icon={<CreditCard className="h-5 w-5" />}
              />
            ) : (
              <div className="p-4">
                <ResponsiveTable
                  columns={paymentColumns}
                  data={memberPayments}
                  renderMobileCard={renderPaymentMobileCard}
                  rowKey={(p) => p.id}
                />
              </div>
            )}
          </div>

          {/* Membership History Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>سجل الاشتراكات</span>
            </h3>

            {/* Simple timeline adjusted for RTL */}
            <div className="relative border-r border-slate-100 dark:border-slate-800 pr-4 space-y-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="relative">
                <div className="absolute -right-[22.5px] top-1 bg-emerald-500 border border-white dark:border-slate-900 rounded-full w-3 h-3 shadow-sm" />
                <p className="font-bold text-slate-850 dark:text-slate-200">تم الاشتراك في {activePlan?.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">تاريخ البدء: {member.startDate} • تاريخ الانتهاء: {member.endDate}</p>
              </div>
              <div className="relative">
                <div className="absolute -right-[22.5px] top-1 bg-indigo-400 border border-white dark:border-slate-900 rounded-full w-3 h-3 shadow-sm" />
                <p className="font-bold text-slate-800 dark:text-slate-200">تم تسجيل الملف الشخصي في الدليل</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">تم تهيئة ملف العميل في قاعدة البيانات</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Renew Modal */}
      <Modal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        title={`تجديد اشتراك العضو ${member.name}`}
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
                  {p.name} ({p.price} شيكل / {p.durationMonths} أشهر)
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
              اختر تاريخ بدء برنامج التجديد. القيمة الافتراضية هي اليوم.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="renew-pay-method" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
                طريقة الدفع
              </label>
              <select
                id="renew-pay-method"
                aria-label="طريقة الدفع"
                value={renewPayMethod}
                onChange={(e) => setRenewPayMethod(e.target.value as any)}
                className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Cash">نقدًا</option>
                <option value="Credit Card">بطاقة ائتمانية</option>
                <option value="Bank Transfer">تحويل بنكي</option>
                <option value="Mobile Payment">الدفع عبر الهاتف</option>
              </select>
            </div>

            <div>
              <label htmlFor="renew-pay-status" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
                حالة الدفع
              </label>
              <select
                id="renew-pay-status"
                aria-label="حالة الدفع"
                value={renewPayStatus}
                onChange={(e) => setRenewPayStatus(e.target.value as any)}
                className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="paid">تم الدفع (Paid)</option>
                <option value="pending">قيد الانتظار (Pending)</option>
                <option value="failed">فشلت العملية (Failed)</option>
              </select>
            </div>
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

      {/* Log Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={`تسجيل عملية دفع للعضو ${member.name}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label htmlFor="pay-amount" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              قيمة الفاتورة (شيكل)
            </label>
            <input
              id="pay-amount"
              aria-label="قيمة الفاتورة"
              type="number"
              step="0.01"
              required
              placeholder="مثال: 49.99"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="pay-method" className="block text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider mb-2">
              طريقة الدفع
            </label>
            <select
              id="pay-method"
              aria-label="طريقة الدفع"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Credit Card">بطاقة ائتمانية</option>
              <option value="Cash">نقدًا</option>
              <option value="Bank Transfer">تحويل بنكي</option>
              <option value="Mobile Payment">الدفع عبر الهاتف</option>
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
                  onClick={() => setPayStatus(opt)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    payStatus === opt
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-600 dark:border-emerald-600'
                      : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt === 'paid' ? 'مدفوع' : 'معلق'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPaymentOpen(false)}
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
              تسجيل إيصال الدفع
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title={`تأكيد الانسحاب للعضو ${member.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            هل أنت متأكد من رغبتك في سحب اشتراك هذا العضو؟
            <br />
            سيتم حساب المبلغ المسترد تلقائياً وإضافته كمرتجع.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={async () => {
                try {
                  await withdrawMembership(member.id);
                  addToast('success', 'تم تسجيل الانسحاب بنجاح');
                  setIsWithdrawOpen(false);
                } catch (err: any) {
                  addToast('error', err.message || 'حدث خطأ أثناء تسجيل الانسحاب');
                }
              }}
              disabled={withdrawing}
              className="px-4 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
            >
              {withdrawing && <Loader2 className="h-3 w-3 animate-spin" />}
              تأكيد الانسحاب
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
