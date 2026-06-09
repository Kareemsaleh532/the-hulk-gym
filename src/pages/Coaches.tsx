import React from 'react';
import { useGym } from '../context/GymContext';
import { Mail, Phone, Award, Users } from 'lucide-react';

export const Coaches: React.FC = () => {
  const { coaches } = useGym();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">دليل المدربين</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          عرض وإدارة ملفات فريق المدربين الشخصيين وتخصصاتهم وعدد العملاء المسندين إليهم.
        </p>
      </div>

      {/* Grid of Coaches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Header info / Avatar */}
            <div>
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={coach.avatar}
                  alt={coach.name}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-extrabold text-emerald-400 border border-slate-800">
                    <Award className="h-3 w-3" />
                    <span>مدرب</span>
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">{coach.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {coach.specialty}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>{coach.assignedMembersCount} عميل مسند</span>
                </div>
              </div>
            </div>

            {/* Contact Information Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-50 space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                {/* Email removed per design */}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span>{coach.phone}</span>
              </div>

              {/* Action trigger button */}
              <button
                onClick={() => alert(`بدء محادثة مع المدرب ${coach.name}.`)}
                className="w-full mt-3 py-2 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-650 hover:text-slate-900 font-bold text-center transition-all cursor-pointer bg-white"
              >
                إرسال رسالة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
