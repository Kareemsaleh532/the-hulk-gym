import React, { useState, useEffect, useCallback } from 'react';
import { useGym } from '../context/GymContext';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ResponsiveTable } from '../components/common/ResponsiveTable';
import type { TableColumn } from '../components/common/ResponsiveTable';
import { planService } from '../services/planService';
import { coachService } from '../services/coachService';
import { staffService, type StaffMember } from '../services/staffService';
import type { Plan, Coach } from '../types';
import {
  Award, Users, Shield, Plus, Trash2, Edit2, Save, X,
  Loader2, CheckCircle, Phone, Dumbbell, Mail, Lock, UserCheck,
} from 'lucide-react';

type AdminTab = 'plans' | 'coaches' | 'staff';

// ─── Role badge colors ────────────────────────────────────────────────────────
const roleBadge: Record<string, string> = {
  admin:   'bg-rose-50 text-rose-700 border-rose-200',
  manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  staff:   'bg-slate-50 text-slate-600 border-slate-200',
};
const roleLabel: Record<string, string> = {
  admin:   'مسؤول',
  manager: 'مدير',
  staff:   'موظف',
};

export const AdminPanel: React.FC = () => {
  const { currentAdmin, addToast, refetchPlans, refetchCoaches } = useGym();
  const isAdmin = currentAdmin?.role === 'admin';

  const [activeTab, setActiveTab] = useState<AdminTab>('plans');

  // ─── Plans ──────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planMonths, setPlanMonths] = useState(1);
  const [planPrice, setPlanPrice] = useState(0);
  const [planFeatures, setPlanFeatures] = useState('');
  const [planSaving, setPlanSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlans(await planService.getPlans());
    setPlansLoading(false);
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const openPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanMonths(plan.durationMonths);
      setPlanPrice(plan.price);
      setPlanFeatures(plan.features.join('\n'));
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanMonths(1);
      setPlanPrice(0);
      setPlanFeatures('دخول صالة التمارين\nمنطقة الكارديو\naستخدام الخزائن');
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    setPlanSaving(true);
    const features = planFeatures.split('\n').map(f => f.trim()).filter(Boolean);
    try {
      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, { name: planName, durationMonths: planMonths, price: planPrice, features });
        addToast('success', 'تم تحديث الخطة بنجاح');
      } else {
        await planService.createPlan({ name: planName, durationMonths: planMonths, price: planPrice, features });
        addToast('success', 'تم إنشاء الخطة الجديدة بنجاح');
      }
      await loadPlans();
      await refetchPlans();
      setIsPlanModalOpen(false);
    } catch {
      addToast('error', 'حدث خطأ أثناء حفظ الخطة');
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف خطة "${name}"؟`)) return;
    await planService.deletePlan(id);
    addToast('success', 'تم حذف الخطة');
    await loadPlans();
    await refetchPlans();
  };

  // ─── Coaches ─────────────────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [coachName, setCoachName] = useState('');
  const [coachPhone, setCoachPhone] = useState('');
  const [coachSpecialty, setCoachSpecialty] = useState('');
  const [coachSaving, setCoachSaving] = useState(false);

  const loadCoaches = useCallback(async () => {
    setCoachesLoading(true);
    setCoaches(await coachService.getCoaches());
    setCoachesLoading(false);
  }, []);

  useEffect(() => { loadCoaches(); }, [loadCoaches]);

  const openCoachModal = (coach?: Coach) => {
    if (coach) {
      setEditingCoach(coach);
      setCoachName(coach.name);
      setCoachPhone(coach.phone);
      setCoachSpecialty(coach.specialty);
    } else {
      setEditingCoach(null);
      setCoachName('');
      setCoachPhone('');
      setCoachSpecialty('');
    }
    setIsCoachModalOpen(true);
  };

  const handleSaveCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName.trim()) return;
    setCoachSaving(true);
    try {
      if (editingCoach) {
        await coachService.updateCoach(editingCoach.id, { name: coachName, phone: coachPhone, specialty: coachSpecialty });
        addToast('success', 'تم تحديث بيانات المدرب بنجاح');
      } else {
        await coachService.createCoach({ name: coachName, phone: coachPhone, specialty: coachSpecialty, avatar: '' });
        addToast('success', 'تم إضافة المدرب بنجاح');
      }
      await loadCoaches();
      await refetchCoaches();
      setIsCoachModalOpen(false);
    } catch {
      addToast('error', 'حدث خطأ أثناء حفظ بيانات المدرب');
    } finally {
      setCoachSaving(false);
    }
  };

  const handleDeleteCoach = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المدرب "${name}"؟`)) return;
    await coachService.deleteCoach(id);
    addToast('success', 'تم حذف المدرب');
    await loadCoaches();
    await refetchCoaches();
  };

  // ─── Staff ───────────────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'admin' | 'manager' | 'staff'>('staff');
  const [staffSaving, setStaffSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffList(await staffService.getStaff());
    setStaffLoading(false);
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const openStaffModal = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setStaffName(member.name);
      setStaffEmail(member.email);
      setStaffPassword('');
      setStaffRole(member.role);
    } else {
      setEditingStaff(null);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffRole('staff');
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) return;
    if (!editingStaff && !staffPassword.trim()) {
      addToast('error', 'كلمة المرور مطلوبة عند إنشاء حساب جديد');
      return;
    }
    setStaffSaving(true);
    try {
      if (editingStaff) {
        const update: any = { name: staffName, email: staffEmail, role: staffRole };
        if (staffPassword.trim()) update.password = staffPassword;
        await staffService.updateStaff(editingStaff.id, update);
        addToast('success', 'تم تحديث بيانات الموظف بنجاح');
      } else {
        await staffService.createStaff({ name: staffName, email: staffEmail, password: staffPassword, role: staffRole });
        addToast('success', 'تم إضافة الموظف بنجاح');
      }
      await loadStaff();
      setIsStaffModalOpen(false);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ بيانات الموظف');
    } finally {
      setStaffSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب "${name}"؟`)) return;
    try {
      await staffService.deleteStaff(id);
      addToast('success', 'تم حذف الحساب');
      await loadStaff();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  // ─── Staff columns for ResponsiveTable ─────────────────────────────────────────
  const staffColumns: TableColumn<StaffMember>[] = [
    {
      key: 'name',
      header: 'الموظف',
      render: (member) => {
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{member.name}</span>
            {member.id === currentAdmin?.id && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 px-1.5 py-0.5 rounded-md">أنت</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'email',
      header: 'البريد الإلكتروني',
      render: (member) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{member.email}</span>
      )
    },
    {
      key: 'role',
      header: 'الدور',
      render: (member) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${roleBadge[member.role]}`}>
          <UserCheck className="h-3 w-3" />
          {roleLabel[member.role]}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'تاريخ الإضافة',
      render: (member) => (
        <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
          {new Date(member.created_at).toLocaleDateString('ar-SA')}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'left',
      render: (member) => (
        <div className="inline-flex gap-1.5">
          <button
            onClick={() => openStaffModal(member)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all cursor-pointer"
            title="تعديل"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {member.id !== currentAdmin?.id && (
            <button
              onClick={() => handleDeleteStaff(member.id, member.name)}
              className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-100 dark:hover:border-rose-800 transition-all cursor-pointer"
              title="حذف"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const renderStaffMobileCard = (member: StaffMember) => {
    const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{member.name}</span>
              <span className="text-[10px] text-slate-400 block">{member.email}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${roleBadge[member.role]}`}>
            <UserCheck className="h-3 w-3" />
            {roleLabel[member.role]}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-55 dark:border-slate-800/50">
          <span className="text-slate-400">تاريخ الإضافة: {new Date(member.created_at).toLocaleDateString('ar-SA')}</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => openStaffModal(member)}
              className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {member.id !== currentAdmin?.id && (
              <button
                onClick={() => handleDeleteStaff(member.id, member.name)}
                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Tabs config ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'plans' as AdminTab, label: 'خطط العضوية', icon: Award, count: plans.length },
    { id: 'coaches' as AdminTab, label: 'فريق المدربين', icon: Dumbbell, count: coaches.length },
    ...(isAdmin ? [{ id: 'staff' as AdminTab, label: 'إدارة الموظفين', icon: Shield, count: staffList.length }] : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">لوحة الإدارة</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            تحكم كامل بخطط العضوية، فريق المدربين، وحسابات الموظفين.
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'plans') openPlanModal();
            else if (activeTab === 'coaches') openCoachModal();
            else if (activeTab === 'staff' && isAdmin) openStaffModal();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>
            {activeTab === 'plans' ? 'خطة جديدة' : activeTab === 'coaches' ? 'مدرب جديد' : 'موظف جديد'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-xs w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] border ${
                activeTab === tab.id ? 'bg-white/20 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── PLANS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <div>
          {plansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <EmptyState title="لا توجد خطط" description="أضف خطة اشتراك جديدة من الزر أعلاه." icon={<Award className="h-6 w-6" />} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openPlanModal(plan)} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id, plan.name)} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{plan.price}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">شيكل</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mr-1">/ {plan.durationMonths} شهر</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-slate-400 dark:text-slate-500 text-[10px]">+ {plan.features.length - 3} ميزات أخرى</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── COACHES TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'coaches' && (
        <div>
          {coachesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            </div>
          ) : coaches.length === 0 ? (
            <EmptyState title="لا يوجد مدربون" description="أضف مدرباً جديداً من الزر أعلاه." icon={<Dumbbell className="h-6 w-6" />} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coaches.map(coach => {
                const initials = coach.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={coach.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group">
                    <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                      {coach.avatar && !coach.avatar.includes('ui-avatars') ? (
                        <img src={coach.avatar} alt={coach.name} className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-black text-emerald-400">
                          {initials}
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-emerald-400 border border-slate-800">
                          <Award className="h-3 w-3" />مدرب
                        </span>
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openCoachModal(coach)} className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all cursor-pointer">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCoach(coach.id, coach.name)} className="p-1.5 rounded-lg bg-rose-500/80 backdrop-blur-sm text-white hover:bg-rose-500 transition-all cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">{coach.name}</h3>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{coach.specialty || 'تخصص غير محدد'}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{coach.phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── STAFF TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'staff' && isAdmin && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
          {staffLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            </div>
          ) : staffList.length === 0 ? (
            <EmptyState title="لا يوجد موظفون" description="أضف موظفاً جديداً من الزر أعلاه." icon={<Users className="h-6 w-6" />} />
          ) : (
            <ResponsiveTable
              columns={staffColumns}
              data={staffList}
              isLoading={staffLoading}
              renderMobileCard={renderStaffMobileCard}
              rowKey={(member) => member.id}
            />
          )}
        </div>
      )}

      {/* ─── PLAN MODAL ──────────────────────────────────────────────────────── */}
      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={editingPlan ? 'تعديل الخطة' : 'إضافة خطة جديدة'}>
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">اسم الخطة</label>
            <input required value={planName} onChange={e => setPlanName(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: اشتراك شهري" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">المدة (أشهر)</label>
              <input type="number" min={1} max={36} required value={planMonths} onChange={e => setPlanMonths(Number(e.target.value))}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">السعر (شيكل)</label>
              <input type="number" min={0} step={0.01} required value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">المميزات (سطر لكل ميزة)</label>
            <textarea rows={4} value={planFeatures} onChange={e => setPlanFeatures(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder={'دخول صالة التمارين\nمنطقة الكارديو\nاستخدام الخزائن'} />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"><X className="h-3.5 w-3.5" />إلغاء</button>
            <button type="submit" disabled={planSaving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer">
              {planSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {editingPlan ? 'حفظ التعديلات' : 'إنشاء الخطة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── COACH MODAL ─────────────────────────────────────────────────────── */}
      <Modal isOpen={isCoachModalOpen} onClose={() => setIsCoachModalOpen(false)} title={editingCoach ? 'تعديل بيانات المدرب' : 'إضافة مدرب جديد'}>
        <form onSubmit={handleSaveCoach} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">الاسم الكامل</label>
            <input required value={coachName} onChange={e => setCoachName(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: أحمد محمد" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">التخصص</label>
            <input value={coachSpecialty} onChange={e => setCoachSpecialty(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: كمال الأجسام، كارديو، يوغا..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">رقم الهاتف</label>
            <input type="tel" value={coachPhone} onChange={e => setCoachPhone(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="+970 5XX XXX XXXX" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsCoachModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"><X className="h-3.5 w-3.5" />إلغاء</button>
            <button type="submit" disabled={coachSaving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer">
              {coachSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {editingCoach ? 'حفظ التعديلات' : 'إضافة المدرب'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── STAFF MODAL ─────────────────────────────────────────────────────── */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={editingStaff ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}>
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />الاسم الكامل</span></label>
            <input required value={staffName} onChange={e => setStaffName(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="مثال: خالد أحمد" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2"><span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />البريد الإلكتروني (لتسجيل الدخول)</span></label>
            <input type="email" required value={staffEmail} onChange={e => setStaffEmail(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="example@hulkgym.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />كلمة المرور{editingStaff && ' (اتركها فارغة للإبقاء على الحالية)'}</span>
            </label>
            <input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2"><span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />الدور والصلاحية</span></label>
            <div className="flex gap-2">
              {(['staff', 'manager', 'admin'] as const).map(r => (
                <button key={r} type="button" onClick={() => setStaffRole(r)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    staffRole === r ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm border-transparent' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}>
                  {roleLabel[r]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"><X className="h-3.5 w-3.5" />إلغاء</button>
            <button type="submit" disabled={staffSaving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer">
              {staffSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {editingStaff ? 'حفظ التعديلات' : 'إضافة الموظف'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
