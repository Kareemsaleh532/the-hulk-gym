import React, { useState, useEffect, useCallback } from 'react';
import { useGym } from '../context/GymContext';
import { accountingService, type AccountingStats } from '../services/accountingService';
import { type DbTransaction } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  TrendingUp, TrendingDown, Plus, Minus,
  Loader2, Wallet, Calendar, Tag, User, Save, X, Trash2
} from 'lucide-react';

export const Accounting: React.FC = () => {
  const { currentAdmin, addToast } = useGym();
  
  const [stats, setStats] = useState<AccountingStats | null>(null);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<DbTransaction['category']>('other');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const statsData = await accountingService.getStats();
      setStats(statsData);
      
      const filter = filterType === 'all' ? undefined : { type: filterType };
      const txData = await accountingService.getTransactions(filter);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setAmount('');
    setCategory(type === 'income' ? 'product_sale' : 'utilities');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      addToast('error', 'الرجاء إدخال مبلغ صحيح');
      return;
    }
    setSaving(true);
    try {
      await accountingService.addTransaction({
        type: modalType,
        category,
        amount: Number(amount),
        date,
        description,
        created_by: currentAdmin?.name || 'System'
      });
      addToast('success', 'تم تسجيل الحركة المالية بنجاح');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast('error', 'حدث خطأ أثناء حفظ الحركة المالية');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) return;
    try {
      await accountingService.deleteTransaction(id);
      addToast('success', 'تم الحذف بنجاح');
      loadData();
    } catch (err) {
      addToast('error', 'فشل في حذف السجل');
    }
  };

  const formatCurrency = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">نظام المحاسبة المالية</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            مراقبة الإيرادات والمصروفات وصافي الأرباح وإدارة السجلات المالية.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>إيراد يدوي</span>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-md shadow-rose-500/10"
          >
            <Minus className="h-4 w-4" />
            <span>تسجيل مصروف</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Income Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-950/30 rounded-full blur-2xl opacity-50"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">إيرادات الشهر</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats?.totalIncome || 0)} <span className="text-sm text-slate-400 dark:text-slate-500">شيكل</span></h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-500">الشهر السابق:</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(stats?.lastMonthIncome || 0)}</span>
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-950/30 rounded-full blur-2xl opacity-50"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">مصروفات الشهر</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats?.totalExpense || 0)} <span className="text-sm text-slate-400 dark:text-slate-500">شيكل</span></h3>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-500">الشهر السابق:</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(stats?.lastMonthExpense || 0)}</span>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs relative overflow-hidden ${(stats?.netProfit || 0) >= 0 ? 'border-emerald-100 dark:border-emerald-900/50' : 'border-rose-100 dark:border-rose-900/50'}`}>
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-50 ${(stats?.netProfit || 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'}`}></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">صافي الربح</p>
                  <h3 className={`text-3xl font-black ${(stats?.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(stats?.netProfit || 0)} <span className="text-sm opacity-60">شيكل</span>
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${(stats?.netProfit || 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'}`}>
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-500">الشهر السابق:</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(stats?.lastMonthProfit || 0)}</span>
              </div>
            </div>
          </div>

          {/* Ledger / Transactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden mt-8">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-950/30">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">سجل الحركات المالية</h3>
              <div className="flex gap-2">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                      filterType === f ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f === 'all' ? 'الكل' : f === 'income' ? 'الإيرادات فقط' : 'المصروفات فقط'}
                  </button>
                ))}
              </div>
            </div>

            {transactions.length === 0 ? (
              <EmptyState title="لا توجد سجلات" description="لم يتم تسجيل أي حركات مالية بعد." icon={<Wallet className="h-6 w-6" />} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-4">التاريخ</th>
                      <th className="px-6 py-4">البيان</th>
                      <th className="px-6 py-4">التصنيف</th>
                      <th className="px-6 py-4">المبلغ</th>
                      <th className="px-6 py-4">الموظف</th>
                      <th className="px-6 py-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {tx.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{tx.description || 'بدون بيان'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                            <Tag className="h-3 w-3" />
                            {tx.category === 'membership' ? 'اشتراكات' :
                             tx.category === 'product_sale' ? 'مبيعات' :
                             tx.category === 'salary' ? 'رواتب' :
                             tx.category === 'utilities' ? 'فواتير' :
                             tx.category === 'maintenance' ? 'صيانة' : 'أخرى'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-black flex items-center gap-1 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {tx.created_by}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-100 dark:hover:border-rose-800 transition-all focus:outline-none cursor-pointer"
                            title="حذف السجل"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Manual Entry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'income' ? 'تسجيل إيراد يدوي' : 'تسجيل مصروف'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">المبلغ (شيكل)</label>
            <input required type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">التصنيف</label>
            <select required value={category} onChange={e => setCategory(e.target.value as any)}
              className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {modalType === 'income' ? (
                <>
                  <option value="product_sale">مبيعات (منتجات، بروتين، ماء)</option>
                  <option value="other">إيرادات أخرى</option>
                </>
              ) : (
                <>
                  <option value="salary">رواتب / عمولات مدربين</option>
                  <option value="utilities">فواتير / إيجار / كهرباء</option>
                  <option value="maintenance">صيانة / معدات</option>
                  <option value="other">مصروفات أخرى</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">التاريخ</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">البيان / الوصف</label>
            <textarea required rows={2} value={description} onChange={e => setDescription(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder={modalType === 'income' ? 'مثال: مبيعات كافتيريا يوم الأحد' : 'مثال: سداد فاتورة الكهرباء لشهر ٦'} />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"><X className="h-3.5 w-3.5" />إلغاء</button>
            <button type="submit" disabled={saving} className={`px-4 py-2 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer ${modalType === 'income' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              تأكيد التسجيل
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
