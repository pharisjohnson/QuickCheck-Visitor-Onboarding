
import React, { useState, useEffect } from 'react';
import { puterService } from '../services/puterService';
import type { CustomField, CustomFieldType } from '../types';
import { SpinnerIcon } from './icons';

const ManageCustomFields: React.FC = () => {
    const [fields, setFields] = useState<CustomField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newField, setNewField] = useState({ label: '', name: '', type: 'text' as CustomFieldType });

    const fetchFields = () => {
        setIsLoading(true);
        puterService.getCustomFields()
            .then(setFields)
            .finally(() => setIsLoading(false));
    };

    useEffect(fetchFields, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        // Auto-generate name from label for simplicity
        const fieldNameToSubmit = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');
        setIsSubmitting(true);
        try {
            await puterService.addCustomField({ ...newField, name: fieldNameToSubmit });
            setNewField({ label: '', name: '', type: 'text' });
            fetchFields(); // Refresh list
        } catch (error) {
            console.error("Failed to add custom field:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Check-in Form Custom Fields</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <SpinnerIcon className="w-8 h-8 text-primary" />
                    </div>
                ) : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Field Label</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Field Name (ID)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {fields.map(field => (
                                    <tr key={field.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{field.label}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{field.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{field.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Field</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-slate-700">Field Label</label>
                        <input
                            type="text"
                            id="label"
                            value={newField.label}
                            onChange={e => setNewField({ ...newField, label: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="e.g. Vehicle Number"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Field Type</label>
                        <select
                            id="type"
                            value={newField.type}
                            onChange={e => setNewField({ ...newField, type: e.target.value as CustomFieldType })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="checkbox">Checkbox</option>
                        </select>
                    </div>
                    <p className="text-xs text-slate-500">The Field Name (ID) will be automatically generated from the label (e.g., 'vehicle_number').</p>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-300"
                    >
                        {isSubmitting ? <SpinnerIcon className="w-5 h-5"/> : 'Add Field'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManageCustomFields;
