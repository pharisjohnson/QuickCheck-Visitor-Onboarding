import React, { useState, useEffect } from 'react';
import type { User, Role } from './types';
import { puterService } from './services/puterService';
import Header from './components/Header';
import CheckInForm from './components/CheckInForm';
import ActiveVisitors from './components/ActiveVisitors';
import AdminPanel from './components/AdminPanel';
import HostPanel from './components/HostPanel';
import CheckedOutVisitors from './components/CheckedOutVisitors';
import { CheckInIcon, UsersIcon, ClipboardCheckIcon } from './components/icons';

type GuardView = 'check-in' | 'active' | 'checked-out';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guardView, setGuardView] = useState<GuardView>('check-in');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    puterService.getCurrentUser().then(user => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  const handleRoleChange = async (role: Role) => {
    setIsLoading(true);
    const user = await puterService.login(role);
    setCurrentUser(user);
    // Reset to default view on role change
    if (role === 'guard') {
      setGuardView('check-in');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-primary text-xl font-semibold">Loading QuickCheck...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-red-500 text-xl font-semibold">Authentication failed. Please refresh.</div>
      </div>
    );
  }

  const renderGuardView = () => (
    <>
      <main className="flex-grow p-4 pb-20">
        {guardView === 'check-in' && <CheckInForm currentUser={currentUser} />}
        {guardView === 'active' && <ActiveVisitors currentUser={currentUser} />}
        {guardView === 'checked-out' && <CheckedOutVisitors />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-md">
        <div className="flex justify-around max-w-lg mx-auto">
          <button
            onClick={() => setGuardView('check-in')}
            className={`flex flex-col items-center justify-center w-full py-3 text-sm transition-colors duration-200 ${guardView === 'check-in' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
          >
            <CheckInIcon className="w-6 h-6 mb-1" />
            <span>Check In</span>
          </button>
          <button
            onClick={() => setGuardView('active')}
            className={`flex flex-col items-center justify-center w-full py-3 text-sm transition-colors duration-200 ${guardView === 'active' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
          >
            <UsersIcon className="w-6 h-6 mb-1" />
            <span>Active</span>
          </button>
           <button
            onClick={() => setGuardView('checked-out')}
            className={`flex flex-col items-center justify-center w-full py-3 text-sm transition-colors duration-200 ${guardView === 'checked-out' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
          >
            <ClipboardCheckIcon className="w-6 h-6 mb-1" />
            <span>Checked Out</span>
          </button>
        </div>
      </nav>
    </>
  );

  const renderAdminView = () => (
    <main className="flex-grow p-4">
      <AdminPanel currentUser={currentUser} />
    </main>
  );

  const renderHostView = () => (
    <main className="flex-grow p-4">
      <HostPanel currentUser={currentUser} />
    </main>
  );

  const renderContent = () => {
    switch(currentUser.role) {
      case 'admin':
        return renderAdminView();
      case 'guard':
        return renderGuardView();
      case 'host':
        return renderHostView();
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
      />
      {renderContent()}
    </div>
  );
};

export default App;