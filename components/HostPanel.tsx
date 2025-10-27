import React, { useState, useEffect, useCallback } from 'react';
import type { User, Appointment, Visit } from '../types';
import { puterService } from '../services/puterService';
import { SpinnerIcon, ClipboardListIcon, UsersIcon } from './icons';

interface HostPanelProps {
    currentUser: User;
}

type HostTab = 'appointments' | 'approvals';

const HostPanel: React.FC<HostPanelProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<HostTab>('appointments');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAppointment, setNewAppointment] = useState({ guest_name: '', guest_id_number: '' });

    const fetchAppointments = useCallback(() => {
        setIsLoading(true);
        puterService.getAppointmentsForHost(currentUser.id)
            .then(setAppointments)
            .finally(() => setIsLoading(false));
    }, [currentUser.id]);

    const fetchVisitsForApproval = useCallback(() => {
        setIsLoading(true);
        puterService.getVisitsForHost(currentUser.name)
            .then(setVisits)
            .finally(() => setIsLoading(false));
    }, [currentUser.name]);

    useEffect(() => {
        if (activeTab === 'appointments') {
            fetchAppointments();
        } else {
            fetchVisitsForApproval();
        }
    }, [activeTab, fetchAppointments, fetchVisitsForApproval]);

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppointment.guest_name || !newAppointment.guest_id_number) return;
        setIsSubmitting(true);
        try {
            await puterService.createAppointment({ ...newAppointment, host_id: currentUser.id });
            setNewAppointment({ guest_name: '', guest_id_number: '' });
            fetchAppointments();
        } catch (error) {
            console.error("Failed to add appointment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveVisit = async (visitId: string) => {
        try {
            await puterService.approveVisit(visitId);
            // Refresh the list to show the change
            fetchVisitsForApproval();
        } catch (error) {
            console.error("Failed to approve visit", error);
        }
    };
    
    const renderAppointments = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Scheduled Appointments</h3>
                {isLoading ? <SpinnerIcon className="w-8 h-8 text-primary" /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guest Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guest ID</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {appointments.map(appt => (
                                    <tr key={appt.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{appt.guest_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{appt.guest_id_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {appointments.length === 0 && <p className="text-slate-500 text-center py-4">No appointments found.</p>}
                    </div>
                )}
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Appointment</h3>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                     <div>
                        <label htmlFor="guest_name" className="block text-sm font-medium text-slate-700">Guest Name</label>
                        <input type="text" id="guest_name" value={newAppointment.guest_name} onChange={e => setNewAppointment({...newAppointment, guest_name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="guest_id_number" className="block text-sm font-medium text-slate-700">Guest ID/Passport</label>
                        <input type="text" id="guest_id_number" value={newAppointment.guest_id_number} onChange={e => setNewAppointment({...newAppointment, guest_id_number: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 disabled:bg-slate-300">
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Add Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
    
    const renderApprovals = () => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Visitor Approvals</h3>
             {isLoading ? <SpinnerIcon className="w-8 h-8 text-primary" /> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Visitor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check-out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {visits.map(visit => (
                                <tr key={visit.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{visit.guest?.name}</div>
                                        <div className="text-sm text-slate-500">{visit.reason}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(visit.check_in_ts).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{visit.check_out_ts ? new Date(visit.check_out_ts).toLocaleString() : ''}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {visit.approval_status === 'approved' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                                        ) : (
                                            <button onClick={() => handleApproveVisit(visit.id)} className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600">
                                                Approve Visit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visits.length === 0 && <p className="text-slate-500 text-center py-4">No completed visits awaiting approval.</p>}
                </div>
            )}
        </div>
    );

    const tabs = [
      { id: 'appointments', label: 'Appointments', icon: ClipboardListIcon },
      { id: 'approvals', label: 'Visitor Approvals', icon: UsersIcon },
    ];

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Host Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage your appointments and approve visitor meetings.</p>
        </div>

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as HostTab)}
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
            {activeTab === 'appointments' ? renderAppointments() : renderApprovals()}
        </div>
      </div>
    );
};

export default HostPanel;