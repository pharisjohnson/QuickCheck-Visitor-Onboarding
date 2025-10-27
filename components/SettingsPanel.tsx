import React, { useState } from 'react';
import ManageUsers from './ManageUsers';
import ManageCustomFields from './ManageCustomFields';
import ManageHosts from './ManageHosts';
import { UsersIcon, SettingsIcon, BuildingOfficeIcon } from './icons';

type SettingsTab = 'users' | 'fields' | 'hosts';

const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  const tabs = [
    { id: 'users', label: 'Manage Staff', icon: UsersIcon, component: <ManageUsers /> },
    { id: 'hosts', label: 'Manage Hosts', icon: BuildingOfficeIcon, component: <ManageHosts /> },
    { id: 'fields', label: 'Custom Fields', icon: SettingsIcon, component: <ManageCustomFields /> },
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Settings</h3>
        <nav className="flex flex-col space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow">
        {activeComponent}
      </div>
    </div>
  );
};

export default SettingsPanel;
