import React, { useState, useEffect, useCallback } from 'react';
import type { Visit } from '../types';
import { puterService } from '../services/puterService';
import { SpinnerIcon, UserCircleIcon, ClockIcon } from './icons';

const CheckedOutVisitors: React.FC = () => {
  const [checkedOutVisits, setCheckedOutVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCheckedOutVisits = useCallback(async () => {
    try {
      const visits = await puterService.getRecentlyCheckedOutVisits();
      setCheckedOutVisits(visits);
    } catch (error) {
      console.error("Failed to fetch checked out visits:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchCheckedOutVisits();
    
    // Set up an interval to refresh the list periodically
    const interval = setInterval(fetchCheckedOutVisits, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchCheckedOutVisits]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center pt-10">
        <SpinnerIcon className="w-8 h-8 text-primary" />
        <span className="ml-2 text-slate-600">Loading checked-out visitors...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Recently Checked Out & Approved</h2>
      
      {checkedOutVisits.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-slate-500">No recently approved check-outs in the last 24 hours.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checkedOutVisits.map(visit => (
            <div key={visit.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center">
              <UserCircleIcon className="w-12 h-12 text-slate-400 mr-4" />
              <div>
                <p className="font-bold text-lg text-slate-800">{visit.guest?.name}</p>
                <p className="text-sm text-slate-500">ID: {visit.guest?.id_number}</p>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <ClockIcon className="w-4 h-4 mr-1.5" />
                  <span>Checked out at {new Date(visit.check_out_ts!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckedOutVisitors;
