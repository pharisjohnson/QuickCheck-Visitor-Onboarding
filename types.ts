export type Role = 'admin' | 'guard' | 'host';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Host {
  id: string;
  name: string;
  department: string;
}

export interface Guest {
  id: string;
  name: string;
  id_number: string;
  phone: string;
  email: string;
  consent: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  guest_name: string;
  guest_id_number: string;
  host_id: string; // User ID of the host
  created_at: string;
  status: 'scheduled' | 'arrived';
}

export interface Visit {
  id: string;
  guest_id: string;
  guest?: Guest; // populated for display
  check_in_ts: string;
  check_out_ts: string | null;
  host: string;
  reason: string;
  device_info: string;
  custom_fields: Record<string, any>;
  checked_in_by: string; // User ID
  checked_in_by_user?: User; // populated for display
  approval_status: 'pending' | 'approved';
  review_request_sent: boolean;
}

export type CustomFieldType = 'text' | 'number' | 'checkbox';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
}

export interface Review {
  visit_id: string;
  rating: number;
  comment: string;
}

export interface OcrData {
  name: string;
  id_number: string;
}

export interface NotificationSettings {
  auto_send_on_checkout: boolean;
  email_template: string;
  sms_template: string;
}

export interface ReviewRequest {
  id: string;
  visit_id: string;
  guest_name: string;
  channel: 'email' | 'sms';
  sent_at: string;
}
