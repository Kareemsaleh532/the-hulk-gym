import React, { useState, Suspense } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { Skeleton } from './components/feedback/Skeleton';
import { NotificationPopup } from './components/common/NotificationPopup';

// Page skeleton loading states
const PageLoader: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 mt-8">
      <Skeleton variant="row" />
      <Skeleton variant="row" />
      <Skeleton variant="row" />
    </div>
  </div>
);

// Lazy Loaded Pages
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Members = React.lazy(() => import('./pages/Members').then(m => ({ default: m.Members })));
const AddMember = React.lazy(() => import('./pages/AddMember').then(m => ({ default: m.AddMember })));
const MemberDetails = React.lazy(() => import('./pages/MemberDetails').then(m => ({ default: m.MemberDetails })));
const Memberships = React.lazy(() => import('./pages/Memberships').then(m => ({ default: m.Memberships })));
const Payments = React.lazy(() => import('./pages/Payments').then(m => ({ default: m.Payments })));
const Coaches = React.lazy(() => import('./pages/Coaches').then(m => ({ default: m.Coaches })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Accounting = React.lazy(() => import('./pages/Accounting').then(m => ({ default: m.Accounting })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));

const AppContent: React.FC = () => {
  const { currentAdmin, activeTab } = useGym();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated or on login, render login page
  if (!currentAdmin || activeTab === 'login') {
    return (
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      }>
        <Login />
        <ToastContainer />
      </Suspense>
    );
  }

  // Render main dashboard layout for logged-in staff
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Right Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable page main container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/30 dark:bg-slate-950 custom-scrollbar transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'members' && <Members />}
              {activeTab === 'add-member' && <AddMember />}
              {activeTab === 'member-details' && <MemberDetails />}
              {activeTab === 'memberships' && <Memberships />}
              {activeTab === 'payments' && <Payments />}
              {activeTab === 'coaches' && <Coaches />}
              {activeTab === 'accounting' && <Accounting />}
              {activeTab === 'admin' && <AdminPanel />}
              {activeTab === 'settings' && <Settings />}
              {activeTab === 'notifications' && <Notifications />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Dynamic system notifications toast container */}
      <ToastContainer />
      <NotificationPopup />
    </div>
  );
};

function App() {
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}

export default App;
