import React, { useState } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { AddMember } from './pages/AddMember';
import { MemberDetails } from './pages/MemberDetails';
import { Memberships } from './pages/Memberships';
import { Payments } from './pages/Payments';
import { Coaches } from './pages/Coaches';

import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { currentAdmin, activeTab } = useGym();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated or on login, render login page
  if (!currentAdmin || activeTab === 'login') {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  // Render main dashboard layout for logged-in staff
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Right Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable page main container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/30 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'members' && <Members />}
            {activeTab === 'add-member' && <AddMember />}
            {activeTab === 'member-details' && <MemberDetails />}
            {activeTab === 'memberships' && <Memberships />}
            {activeTab === 'payments' && <Payments />}
            {activeTab === 'coaches' && <Coaches />}

            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      {/* Dynamic system notifications toast container */}
      <ToastContainer />
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
