
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Visit } from '../types';
import { puterService } from '../services/puterService';
import { SpinnerIcon, UserCircleIcon, ClockIcon, LogoutIcon } from './icons';

interface ActiveVisitorsProps {
  currentUser: User;
}

const ActiveVisitors: React.FC<ActiveVisitorsProps> = ({ currentUser }) => {
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const fetchActiveVisits = useCallback(async () => {
    // Don't set loading to true on refetch, only initial
    // setIsLoading(true); 
    try {
      const visits = await puterService.getActiveVisits();
      setActiveVisits(visits);
    } catch (error) {
      console.error("Failed to fetch active visits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    fetchActiveVisits();
  }, [fetchActiveVisits]);

  const handleCheckout = async (visitId: string) => {
    setCheckingOut(visitId);
    try {
      const checkedOutVisit = await puterService.checkoutVisit(visitId);
      const guestName = activeVisits.find(v => v.id === checkedOutVisit.id)?.guest?.name || 'Visitor';
      setMessage(`${guestName} has been checked out successfully.`);
      fetchActiveVisits(); // Refresh the list
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error("Failed to checkout visit:", error);
      setMessage("Failed to check out visitor.");
       setTimeout(() => setMessage(null), 4000);
    } finally {
      setCheckingOut(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center pt-10">
        <SpinnerIcon className="w-8 h-8 text-primary" />
        <span className="ml-2 text-slate-600">Loading active visitors...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Active Visitors</h2>
      {message && <div className="p-3 rounded-md mb-4 text-sm bg-green-100 text-green-800">{message}</div>}
      
      {activeVisits.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-slate-500">No active visitors at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeVisits.map(visit => (
            <div key={visit.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <UserCircleIcon className="w-12 h-12 text-slate-400 mr-4" />
                <div>
                  <p className="font-bold text-lg text-slate-800">{visit.guest?.name}</p>
                  <p className="text-sm text-slate-500">ID: {visit.guest?.id_number}</p>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    <span>Checked in at {new Date(visit.check_in_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCheckout(visit.id)}
                disabled={checkingOut === visit.id}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {checkingOut === visit.id ? <SpinnerIcon className="w-5 h-5" /> : <LogoutIcon className="w-5 h-5 mr-2" />}
                <span>Checkout</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveVisitors;