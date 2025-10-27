
import React, { useState, useEffect, useCallback } from 'react';
import { puterService } from '../services/puterService';
import type { Visit } from '../types';
import { SpinnerIcon, DownloadIcon, MailIcon } from './icons';

const Reports: React.FC = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);

    const fetchVisits = useCallback(() => {
        setIsLoading(true);
        puterService.getVisitsLog()
            .then(setVisits)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    const handleSendRequest = async (visitId: string) => {
        setSendingRequestId(visitId);
        try {
            await puterService.sendReviewRequest(visitId);
            // Refresh data to show updated status
            const updatedVisits = await puterService.getVisitsLog();
            setVisits(updatedVisits);
        } catch (error) {
            console.error("Failed to send review request", error);
            // Optionally show an error message to the user
        } finally {
            setSendingRequestId(null);
        }
    };

    const exportToCSV = () => {
        // This is a simple CSV export function.
        const headers = ["Visitor Name", "ID Number", "Check-in Time", "Check-out Time", "Host", "Reason", "Checked In By", "Review Request Sent"];
        const rows = visits.map(v => [
            v.guest?.name,
            v.guest?.id_number,
            new Date(v.check_in_ts).toLocaleString(),
            v.check_out_ts ? new Date(v.check_out_ts).toLocaleString() : 'Active',
            v.host,
            v.reason,
            v.checked_in_by_user?.name,
            v.review_request_sent ? 'Yes' : 'No'
        ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "visitor_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">All Visitor Logs</h3>
                <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md shadow-sm hover:bg-primary-600">
                    <DownloadIcon className="w-5 h-5"/>
                    <span>Export CSV</span>
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <SpinnerIcon className="w-8 h-8 text-primary" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Visitor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-in</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-out</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Host</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Guard</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {visits.map(visit => (
                                <tr key={visit.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{visit.guest?.name}</div>
                                        <div className="text-sm text-slate-500">{visit.guest?.id_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(visit.check_in_ts).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {visit.check_out_ts ? new Date(visit.check_out_ts).toLocaleString() : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Active</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{visit.host}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{visit.checked_in_by_user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {visit.check_out_ts && (
                                            visit.review_request_sent ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Request Sent</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSendRequest(visit.id)}
                                                    disabled={sendingRequestId === visit.id}
                                                    className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                                                >
                                                    {sendingRequestId === visit.id ? <SpinnerIcon className="w-4 h-4" /> : <MailIcon className="w-4 h-4" />}
                                                    <span>Send Request</span>
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Reports;