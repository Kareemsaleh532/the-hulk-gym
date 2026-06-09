import React from 'react';
import { useGym } from '../context/GymContext';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments';
import {
  Users,
  UserCheck,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Award,
  CreditCard,
  UserPlus,
  Activity,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { logs, setTab, currentAdmin } = useGym();
  const { members } = useMembers();
  const { payments } = usePayments();

  // Stats calculations
  const totalMembers = members.length;
  const activeMemberships = members.filter((m) => m.status === 'active').length;
  const expiringMemberships = members.filter((m) => m.status === 'expiring').length;
  const expiredMemberships = members.filter((m) => m.status === 'expired').length;

  // Monthly revenue (sum of paid payments in June 2026)
  const june2026PaidRevenue = payments
    .filter((p) => p.status === 'paid' && p.date.startsWith('2026-06'))
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: 'إجمالي الأعضاء',
      value: totalMembers,
      change: '+٤٪ هذا الشهر',
      isPositive: true,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'العضويات النشطة',
      value: activeMemberships,
      change: `${Math.round((activeMemberships / (totalMembers || 1)) * 100)}٪ من الإجمالي`,
      isPositive: true,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'قاربت الانتهاء',
      value: expiringMemberships,
      change: 'يتطلب تجديد',
      isPositive: false,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'إيرادات يونيو',
      value: `$${june2026PaidRevenue.toFixed(2)}`,
      change: 'الهدف: $١,٥٠٠.٠٠',
      isPositive: true,
      icon: DollarSign,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  // Membership status calculations for visual bar
  const activePercent = Math.round((activeMemberships / (totalMembers || 1)) * 100);
  const expiringPercent = Math.round((expiringMemberships / (totalMembers || 1)) * 100);
  const expiredPercent = Math.round((expiredMemberships / (totalMembers || 1)) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-850 p-6 rounded-3xl border border-slate-800 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-950/45 p-1 border border-slate-800 flex-shrink-0">
            <img
              src="/hulk-logo.png"
              alt="شعار ذا هالك جيم"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              مرحباً بعودتك، {currentAdmin?.name || 'الموظف'}!
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              تم فحص نظام البوابة بنجاح. ذا هالك جيم يعمل بكامل طاقته.
            </p>
          </div>
        </div>
        <button
          onClick={() => setTab('add-member')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-98 cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>تسجيل عضو</span>
        </button>
      </div>

      {/* Grid of 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">{stat.change}</span>
                <span className="flex items-center gap-0.5 font-bold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>مباشر</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Status Distribution & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Membership Status breakdown */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              حالة صحة العضويات
            </h3>
            
            <div className="space-y-4">
              {/* Custom segmented progress bar */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${activePercent}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`نشط: ${activePercent}%`}
                />
                <div
                  style={{ width: `${expiringPercent}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`قارب الانتهاء: ${expiringPercent}%`}
                />
                <div
                  style={{ width: `${expiredPercent}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`منتهي: ${expiredPercent}%`}
                />
              </div>

              {/* Legend with percentages */}
              <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="block text-xs font-semibold text-emerald-700">نشط</span>
                  <span className="block text-lg font-black text-emerald-800 mt-1">{activePercent}%</span>
                  <span className="text-[10px] text-emerald-600 font-medium">{activeMemberships} عضو</span>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <span className="block text-xs font-semibold text-amber-700">قارب الانتهاء</span>
                  <span className="block text-lg font-black text-amber-800 mt-1">{expiringPercent}%</span>
                  <span className="text-[10px] text-amber-600 font-medium">{expiringMemberships} عضو</span>
                </div>
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <span className="block text-xs font-semibold text-rose-700">منتهي</span>
                  <span className="block text-lg font-black text-rose-800 mt-1">{expiredPercent}%</span>
                  <span className="text-[10px] text-rose-600 font-medium">{expiredMemberships} عضو</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              إجراءات سريعة
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setTab('add-member')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                  <UserPlus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">تسجيل عميل</span>
              </button>

              <button
                onClick={() => setTab('payments')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">تسجيل دفعة</span>
              </button>

              <button
                onClick={() => setTab('memberships')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">تجديد خطة</span>
              </button>

              <button
                onClick={() => setTab('settings')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/10 text-center transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">الماليات</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Recent Activity Logs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>سجل نشاط النظام</span>
            </h3>
            <button
              onClick={() => setTab('settings')}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5"
            >
              <span>عرض السجلات</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {logs.slice(0, 5).map((log) => {
              let badgeColor = 'bg-slate-100 text-slate-500';
              if (log.type === 'member_add') badgeColor = 'bg-emerald-50 text-emerald-500 border border-emerald-100';
              if (log.type === 'payment_add') badgeColor = 'bg-blue-50 text-blue-500 border border-blue-100';
              if (log.type === 'membership_renew') badgeColor = 'bg-purple-50 text-purple-500 border border-purple-100';

              return (
                <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${badgeColor}`}>
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 break-words">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-semibold">{log.operatorName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
