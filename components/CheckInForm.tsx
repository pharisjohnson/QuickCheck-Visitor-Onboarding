import React, { useState, useEffect } from 'react';
import type { User, CustomField, Host } from '../types';
import { puterService } from '../services/puterService';
import { SearchIcon, CameraIcon, SpinnerIcon } from './icons';

interface CheckInFormProps {
  currentUser: User;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ currentUser }) => {
  const [idNumber, setIdNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    host: '',
    reason: '',
    device_info: '',
    consent: false,
    custom_fields: {} as Record<string, any>,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    puterService.getCustomFields().then(setCustomFields);
    puterService.getHosts().then(setHosts);
  }, []);

  const handleIdSearch = async () => {
    if (!idNumber) return;
    setIsSearching(true);
    setMessage(null);
    handleClear(false);

    try {
      const guest = await puterService.searchGuestById(idNumber);
      if (guest) {
        setFormState(prevState => ({
          ...prevState,
          name: guest.name,
          phone: guest.phone,
          email: guest.email,
          consent: guest.consent,
        }));
        setMessage({ type: 'success', text: 'Returning visitor found. Details auto-filled.' });
        return;
      }

      const appointment = await puterService.getAppointmentByIdNumber(idNumber);
      if (appointment) {
        setFormState(prevState => ({
          ...prevState,
          name: appointment.guest_name,
        }));
        setMessage({ type: 'info', text: 'Visitor has an appointment. Name has been auto-filled.' });
        return;
      }

      setMessage({ type: 'error', text: 'No past records or appointments found for this ID.' });

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to search for visitor.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsOcrLoading(true);
    setMessage(null);
    try {
      const ocrData = await puterService.performOcr(file);
      setIdNumber(ocrData.id_number);
      setFormState(prevState => ({ ...prevState, name: ocrData.name }));
      setMessage({ type: 'success', text: 'ID scanned successfully. Please verify the details.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'OCR failed. Please enter details manually.' });
    } finally {
      setIsOcrLoading(false);
    }
    e.target.value = ''; // Reset file input
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const checked = e.target.checked;
    setFormState(prevState => ({ ...prevState, [name]: isCheckbox ? checked : value }));
  };
  
  const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      custom_fields: {
        ...prevState.custom_fields,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Find or create guest
      let guest = await puterService.searchGuestById(idNumber);
      if (!guest) {
        guest = await puterService.createGuest({
          name: formState.name,
          id_number: idNumber,
          phone: formState.phone,
          email: formState.email,
          consent: formState.consent,
        });
      }

      // Create visit record
      await puterService.createVisit({
        guest_id: guest.id,
        host: formState.host || 'Reception', // Default to Reception if no host is selected
        reason: formState.reason,
        device_info: formState.device_info,
        custom_fields: formState.custom_fields,
        checked_in_by: currentUser.id,
      });

      setMessage({ type: 'success', text: `Visitor ${formState.name} checked in successfully!` });
      handleClear(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check in visitor. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = (clearAll: boolean) => {
    if (clearAll) setIdNumber('');
    setFormState({
        name: '', phone: '', email: '', host: '', reason: '', device_info: '', consent: false,
        custom_fields: customFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    });
  };

  const messageColor = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Visitor Check-In</h2>

      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${messageColor[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <label htmlFor="id_number" className="block text-sm font-medium text-slate-700 mb-1">ID/Passport Number</label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="id_number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter ID number"
              className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={handleIdSearch}
              disabled={isSearching || !idNumber}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center"
            >
              {isSearching ? <SpinnerIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold text-slate-800">Visitor Details</h3>
             <label htmlFor="ocr-upload" className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-primary text-sm font-semibold rounded-md cursor-pointer hover:bg-blue-200 disabled:opacity-50">
                {isOcrLoading ? <SpinnerIcon className="w-5 h-5" /> : <CameraIcon className="w-5 h-5" />}
                <span>Scan ID</span>
             </label>
             <input id="ocr-upload" type="file" accept="image/*" className="hidden" onChange={handleOcr} disabled={isOcrLoading} />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input type="tel" name="phone" id="phone" value={formState.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" name="email" id="email" value={formState.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Visit Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="host" className="block text-sm font-medium text-slate-700">Who to see (Host)</label>
                <select name="host" id="host" value={formState.host} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" required>
                    <option value="" disabled>Select a host</option>
                    {hosts.map(host => (
                        <option key={host.id} value={host.name}>{host.name} ({host.department})</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Visit</label>
                <input type="text" name="reason" id="reason" value={formState.reason} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
          </div>
          <div>
            <label htmlFor="device_info" className="block text-sm font-medium text-slate-700">Device Details (e.g. Laptop Model/Serial)</label>
            <textarea name="device_info" id="device_info" value={formState.device_info} onChange={handleInputChange} rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>
          
          {customFields.map(field => (
            <div key={field.id}>
              <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">{field.label}</label>
              {field.type === 'checkbox' ? (
                <input type="checkbox" name={field.name} id={field.name} checked={!!formState.custom_fields[field.name]} onChange={handleCustomFieldChange} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              ) : (
                <input type={field.type} name={field.name} id={field.name} value={formState.custom_fields[field.name] || ''} onChange={handleCustomFieldChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              )}
            </div>
          ))}

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="consent" name="consent" type="checkbox" checked={formState.consent} onChange={handleInputChange} className="focus:ring-primary h-4 w-4 text-primary border-slate-300 rounded" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consent" className="font-medium text-slate-700">Consent to receive marketing updates.</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-300">
              {isSubmitting ? <SpinnerIcon className="w-6 h-6" /> : 'Check In Visitor'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CheckInForm;
