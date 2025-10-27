import React, { useState } from 'react';
import type { User } from '../types';
import Dashboard from './Dashboard';
import Reports from './Reports';
import SettingsPanel from './SettingsPanel';
import CommunicationPanel from './CommunicationPanel';
import { DashboardIcon, DocumentReportIcon, SettingsIcon, MailIcon } from './icons';

interface AdminPanelProps {
  currentUser: User;
}

type AdminTab = 'dashboard' | 'reports' | 'settings' | 'communication';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'reports', label: 'Visits Log', icon: DocumentReportIcon },
    { id: 'communication', label: 'Communication', icon: MailIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <Reports />;
      case 'communication':
        return <CommunicationPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Admin Panel</h2>
        <p className="text-slate-500 mt-1">Manage visitors, staff, and system settings.</p>
      </div>
      
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;