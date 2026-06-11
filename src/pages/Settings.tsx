import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { User as UserIcon, Lock, Bell, Palette, Save } from 'lucide-react';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'theme';

export const Settings: React.FC = () => {
  const { currentAdmin, addToast, theme, toggleTheme } = useGym();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form State
  const [name, setName] = useState(currentAdmin?.name || 'جون هلكرسون');
  const [email, setEmail] = useState(currentAdmin?.email || 'admin@hulkgym.com');
  const [role, setRole] = useState(currentAdmin?.role || 'admin');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications State
  const [notifyExpiring, setNotifyExpiring] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [weeklySummaries, setWeeklySummaries] = useState(false);

  // Theme State
  const [accentColor, setAccentColor] = useState<'emerald' | 'blue' | 'amber'>('emerald');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'تم تحديث الملف الشخصي لمدير البوابة (محفوظ في الذاكرة المؤقتة المحلية).');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('error', 'جميع الحقول مطلوبة لتحديث بيانات البوابة.');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', 'كلمات المرور الجديدة غير متطابقة.');
      return;
    }
    addToast('success', 'تم تحديث مفاتيح الأمان. يرجى حفظ بيانات اعتمادك الجديدة بشكل آمن.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveNotifications = () => {
    addToast('success', 'تم حفظ قواعد توجيه إشعارات البوابة.');
  };

  const handleSaveTheme = () => {
    addToast('success', `تم حفظ لوحة ألوان المظهر إلى: ${accentColor.toUpperCase()}`);
  };

  const tabs = [
    { id: 'profile', name: 'إعدادات الملف الشخصي', icon: UserIcon },
    { id: 'security', name: 'أمان الوصول', icon: Lock },
    { id: 'notifications', name: 'الإشعارات والتنبيهات', icon: Bell },
    { id: 'theme', name: 'المظهر وواجهة المستخدم', icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">تهيئة البوابة</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          تهيئة بيانات الموظفين، وضبط تنبيهات النظام، وإدارة خيارات واجهة المستخدم.
        </p>
      </div>

      <div className="bg-white border border-slate-150 rounded-3xl shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[450px]">
        {/* Right Side (RTL context) / Left Side (visual): Tabs List */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-l border-slate-100 bg-slate-50/50 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-bold rounded-xl transition-all focus:outline-none cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Left Side (RTL context) / Right Side (visual): Tab Panel Content */}
        <div className="flex-1 p-6 sm:p-8">
          
          {/* Profile settings Panel */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">الملف الشخصي للموظف</h3>
                <p className="text-xs text-slate-400 font-semibold">تحديث التفاصيل المعروضة في سجلات نشاط النظام.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    اسم الموظف
                  </label>
                  <input
                    id="settings-name"
                    aria-label="اسم الموظف"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="settings-role" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    الدور في النظام
                  </label>
                  <select
                    id="settings-role"
                    aria-label="الدور في النظام"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'staff' | 'manager')}
                    className="block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-755 focus:outline-none cursor-pointer"
                  >
                    <option value="admin">مسؤول (مستخدم خارق)</option>
                    <option value="manager">مدير</option>
                    <option value="staff">موظف عادي</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="settings-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    البريد الإلكتروني لتسجيل الدخول
                  </label>
                  <input
                    id="settings-email"
                    aria-label="البريد الإلكتروني لتسجيل الدخول"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>تحديث بيانات الملف الشخصي</span>
                </button>
              </div>
            </form>
          )}

          {/* Access Security Panel */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">مفاتيح الأمان</h3>
                <p className="text-xs text-slate-400 font-semibold">تغيير كلمة مرور الدخول لواجهة لوحة التحكم.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="current-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    كلمة المرور الحالية
                  </label>
                  <input
                    id="current-password"
                    aria-label="كلمة المرور الحالية"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    id="new-password"
                    aria-label="كلمة المرور الجديدة"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    id="confirm-password"
                    aria-label="تأكيد كلمة المرور"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>تحديث مفاتيح كلمة المرور</span>
                </button>
              </div>
            </form>
          )}

          {/* Notifications Panel */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">توجيه الإشعارات</h3>
                <p className="text-xs text-slate-400 font-semibold">تعديل شروط التنبيهات والملخصات التحذيرية للنظام.</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyExpiring}
                    onChange={(e) => setNotifyExpiring(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-350 bg-slate-50 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-700">تحديد الاشتراكات التي أوشكت على الانتهاء</span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                      إظهار تنبيهات باللون البرتقالي عندما تنتهي صلاحية الحسابات في أقل من 14 يومًا.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyPayments}
                    onChange={(e) => setNotifyPayments(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-355 bg-slate-50 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-700">تحديد عمليات الدفع الفاشلة</span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                      إرسال إشعارات عندما ترفض بطاقات الائتمان أو تعود برموز فشل.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={weeklySummaries}
                    onChange={(e) => setWeeklySummaries(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-355 bg-slate-50 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-700">الملخصات التنفيذية الأسبوعية</span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                      إعداد وتسجيل جداول تقارير الأداء الأسبوعية تلقائيًا.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>حفظ إعدادات الإشعارات</span>
                </button>
              </div>
            </div>
          )}

          {/* Theme Settings Panel */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">مظهر الواجهة</h3>
                <p className="text-xs text-slate-400 font-semibold">تخصيص تصميم لوحة التحكم واللون المميز.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    اللون المميز للمظهر
                  </label>
                  <div className="flex gap-4">
                    {[
                      { id: 'emerald', name: 'النادي الزمردي', color: 'bg-emerald-500 ring-emerald-500/20' },
                      { id: 'blue', name: 'الأزرق المحيطي', color: 'bg-blue-500 ring-blue-500/20' },
                      { id: 'amber', name: 'الكهرماني النشط', color: 'bg-amber-400 ring-amber-400/20' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAccentColor(opt.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                          accentColor === opt.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full block border border-white/10 ${opt.color}`} />
                        <span>{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    تجاوز الوضع الفاتح
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="dark-mode-toggle"
                      checked={theme === 'dark'}
                      onChange={() => toggleTheme()}
                      className="h-4.5 w-4.5 rounded border-slate-300 bg-slate-50 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="dark-mode-toggle" className="text-xs font-bold text-slate-650 cursor-pointer select-none">
                      تمكين المظهر الداكن للوحة التحكم
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveTheme}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>تطبيق متغيرات المظهر</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
