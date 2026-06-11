// AddMember page with dark mode support and no email field
import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { useCreateMember } from '../hooks/useMembers';
import type { GenderType, Payment } from '../types';
import { Save, X, Info, Loader2 } from 'lucide-react';

export const AddMember: React.FC = () => {
  const { plans, setTab, addToast } = useGym();
  const { createMember, loading } = useCreateMember();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [dob, setDob] = useState('1995-01-01');
  const [planId, setPlanId] = useState(plans[0]?.id || 'plan-basic');
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Default to today
  });
  const [notes, setNotes] = useState('');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<Payment['status']>('paid');

  const genderLabels: Record<string, string> = {
    Male: 'ذكر',
    Female: 'أنثى',
    Other: 'أخرى',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('error', 'الاسم الكامل مطلوب.');
      return;
    }

    try {
      await createMember({
        name: name.trim(),
        phone: phone.trim(),
        gender,
        dob,
        planId,
        startDate,
        notes: notes.trim(),
      }, {
        method: paymentMethod,
        status: paymentStatus
      });

      addToast('success', `تم إضافة العضو ${name} بنجاح!`);
      // Navigate back to members tab
      setTab('members');
  } catch (err) {
  console.error('Create member error:', err);
  addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ العضو');
}
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          تسجيل عضو جديد
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          أدخل البيانات الشخصية واختر خطة العضوية للعضو الجديد.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-600 pb-3 mb-4">
              المعلومات الشخصية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="full-name" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  id="full-name"
                  aria-label="الاسم الكامل"
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  aria-label="رقم الهاتف"
                  type="tel"
                  placeholder="+966 5XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Gender selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  الجنس
                </label>
                <div className="flex gap-2">
                  {(['Male', 'Female', 'Other'] as GenderType[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGender(opt)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        gender === opt
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {genderLabels[opt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  تاريخ الميلاد
                </label>
                <input
                  id="dob"
                  aria-label="تاريخ الميلاد"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Membership Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-600 pb-3 mb-4">
              اختيار برنامج العضوية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Plan Select */}
              <div>
                <label htmlFor="plan-id" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  خطة العضوية
                </label>
                <select
                  id="plan-id"
                  aria-label="خطة العضوية"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (${plan.price} / {plan.durationMonths} شهر)
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start-date" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  تاريخ البدء
                </label>
                <input
                  id="start-date"
                  aria-label="تاريخ البدء"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm font-semibold cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-600 pb-3 mb-4">
              تفاصيل الدفع
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Payment Method */}
              <div>
                <label htmlFor="payment-method" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  طريقة الدفع
                </label>
                <select
                  id="payment-method"
                  aria-label="طريقة الدفع"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['method'])}
                  className="block w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="Cash">نقدي (Cash)</option>
                  <option value="Credit Card">بطاقة ائتمان (Credit Card)</option>
                  <option value="Bank Transfer">حوالة بنكية (Bank Transfer)</option>
                  <option value="Mobile Payment">دفع عبر الجوال (Mobile Payment)</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label htmlFor="payment-status" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  حالة الدفع
                </label>
                <select
                  id="payment-status"
                  aria-label="حالة الدفع"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as Payment['status'])}
                  className="block w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="paid">تم الدفع (Paid)</option>
                  <option value="pending">قيد الانتظار (Pending)</option>
                  <option value="failed">فشلت العملية (Failed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              ملاحظات الموظفين / المتطلبات البدنية
            </label>
            <textarea
              id="notes"
              aria-label="ملاحظات الموظفين"
              rows={3}
              placeholder="أضف تعيينات المدرب الشخصي، القيود البدنية، أو جداول الفوترة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-250 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold resize-none"
            />
          </div>

          {/* Alert Tip */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs">
            <Info className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">
              عند الحفظ، سيتم تعيين حالة العضو كـ <span className="font-extrabold text-emerald-950 dark:text-emerald-100">نشط</span>.
              سيتم إنشاء معاملة بقيمة الخطة تلقائياً في سجل الفوترة الخاص بالعضو.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTab('members')}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm transition-all focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span>إلغاء</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/10 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>تسجيل الملف</span>
          </button>
        </div>
      </form>
    </div>
  );
};
