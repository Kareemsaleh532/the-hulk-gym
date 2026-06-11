import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useGym();
  const [password, setPassword] = useState('examplepassword');
  const [email, setEmail] = useState('example@hulkgym.com');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-slate-950 p-4 sm:p-6 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8 sm:p-10 relative z-10">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-24 w-24 rounded-2xl p-1 mb-3 animate-bounce">
            <img
              src="/hulk-logo.png"
              alt="شعار ذا هالك جيم"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-emerald-400">ذا هالك جيم</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">بوابة إدارة الموظفين</p>
        </div>

        {/* Info Tip */}
        {/* <div className="mb-6 p-3 rounded-xl bg-gray-200/40 dark:bg-slate-800/40 border border-gray-300 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
            بيانات تجريبية: <code className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">admin@hulkgym.com</code> / <code className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">admin</code>
          </p>
        </div> */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pr-10 pl-3 py-3 rounded-xl bg-gray-200 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              placeholder="role@hulkgym.com"
            />
          </div>
          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">كلمة المرور</label>
              <button
                type="button"
                onClick={() => alert('بيانات تجريبية: admin@hulkgym.com / admin')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline focus:outline-none"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-10 pl-10 py-3 rounded-xl bg-gray-200 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="remember-me" className="mr-2 block text-sm font-semibold text-slate-400 select-none cursor-pointer">
              تذكر هذا الجهاز
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-98 disabled:opacity-50 disabled:scale-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                <span>جاري المصادقة...</span>
              </span>
            ) : (
              'دخول نظام الإدارة'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

