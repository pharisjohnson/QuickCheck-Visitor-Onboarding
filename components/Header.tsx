import React from 'react';
import type { User, Role } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: Role) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onRoleChange }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <LogoIcon className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-slate-800">QuickCheck</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600 hidden sm:block">
            Signed in as <span className="font-semibold">{currentUser.name}</span>
          </span>
          <select
            value={currentUser.role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="bg-slate-100 border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="guard">Guard</option>
            <option value="admin">Admin</option>
            <option value="host">Host</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
