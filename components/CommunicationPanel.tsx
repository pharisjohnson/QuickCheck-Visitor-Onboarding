import React, { useState, useEffect } from 'react';
import { puterService } from '../services/puterService';
import type { NotificationSettings, ReviewRequest } from '../types';
import { SpinnerIcon } from './icons';

const CommunicationPanel: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [requests, setRequests] = useState<ReviewRequest[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        puterService.getNotificationSettings()
            .then(setSettings)
            .finally(() => setIsLoadingSettings(false));
        
        puterService.getReviewRequests()
            .then(setRequests)
            .finally(() => setIsLoadingRequests(false));
    }, []);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setSettings({
            ...settings,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await puterService.updateNotificationSettings(settings);
            setMessage("Settings saved successfully!");
        } catch (error) {
            setMessage("Failed to save settings.");
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Notification Settings</h3>
                {isLoadingSettings || !settings ? <SpinnerIcon className="w-8 h-8 text-primary" /> : (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="auto_send_on_checkout"
                                    name="auto_send_on_checkout"
                                    type="checkbox"
                                    checked={settings.auto_send_on_checkout}
                                    onChange={handleSettingsChange}
                                    className="focus:ring-primary h-4 w-4 text-primary border-slate-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="auto_send_on_checkout" className="font-medium text-slate-700">
                                    Automatically send review request on checkout
                                </label>
                                <p className="text-slate-500">When enabled, a thank you message with a review link will be sent to the guest upon checkout.</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email_template" className="block text-sm font-medium text-slate-700">
                                Email Template
                            </label>
                            <textarea
                                id="email_template"
                                name="email_template"
                                value={settings.email_template}
                                onChange={handleSettingsChange}
                                rows={5}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <p className="mt-2 text-xs text-slate-500">Use {'{{GUEST_NAME}}'} and {'{{REVIEW_LINK}}'} as placeholders.</p>
                        </div>
                         <div>
                            <label htmlFor="sms_template" className="block text-sm font-medium text-slate-700">
                                SMS Template
                            </label>
                            <textarea
                                id="sms_template"
                                name="sms_template"
                                value={settings.sms_template}
                                onChange={handleSettingsChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                             <p className="mt-2 text-xs text-slate-500">Use {'{{GUEST_NAME}}'} and {'{{REVIEW_LINK}}'} as placeholders.</p>
                        </div>
                        <div className="flex justify-end items-center space-x-4">
                           {message && <span className="text-sm text-green-600">{message}</span>}
                           <button type="submit" disabled={isSaving} className="px-4 py-2 flex items-center bg-primary text-white text-sm font-semibold rounded-md shadow-sm hover:bg-primary-600 disabled:bg-slate-300">
                                {isSaving && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Save Settings
                           </button>
                        </div>
                    </form>
                )}
            </div>

             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Sent Requests Log</h3>
                {isLoadingRequests ? <SpinnerIcon className="w-8 h-8 text-primary" /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guest</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Channel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sent At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{req.guest_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 capitalize">{req.channel}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.sent_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {requests.length === 0 && <p className="text-center py-4 text-slate-500">No review requests sent yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationPanel;
