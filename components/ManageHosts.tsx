import React, { useState, useEffect } from 'react';
import { puterService } from '../services/puterService';
import type { Host } from '../types';
import { SpinnerIcon } from './icons';

const ManageHosts: React.FC = () => {
    const [hosts, setHosts] = useState<Host[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newHost, setNewHost] = useState({ name: '', department: '' });

    const fetchHosts = () => {
        setIsLoading(true);
        puterService.getHosts()
            .then(setHosts)
            .finally(() => setIsLoading(false));
    };

    useEffect(fetchHosts, []);

    const handleAddHost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await puterService.addHost(newHost);
            setNewHost({ name: '', department: '' });
            fetchHosts(); // Refresh list
        } catch (error) {
            console.error("Failed to add host:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Host List</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <SpinnerIcon className="w-8 h-8 text-primary" />
                    </div>
                ) : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {hosts.map(host => (
                                    <tr key={host.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{host.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{host.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Host</h3>
                <form onSubmit={handleAddHost} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={newHost.name}
                            onChange={e => setNewHost({ ...newHost, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
                        <input
                            type="text"
                            id="department"
                            value={newHost.department}
                            onChange={e => setNewHost({ ...newHost, department: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-300"
                    >
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Add Host'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManageHosts;
