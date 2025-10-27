// This service simulates the Puter.js backend.
// In a real application, you would replace these mock functions
// with actual calls to the Puter.js SDK.
import type { User, Guest, Visit, CustomField, Review, Role, CustomFieldType, OcrData, Host, Appointment, NotificationSettings, ReviewRequest } from '../types';

// --- MOCK DATABASE ---
const DB = {
  users: [
    { id: 'user_admin_01', name: 'Admin User', role: 'admin' as Role },
    { id: 'user_guard_01', name: 'Guard User', role: 'guard' as Role },
    { id: 'user_host_01', name: 'Host User', role: 'host' as Role },
  ],
  guests: [
    { id: 'guest_01', name: 'John Doe', id_number: 'G1234567X', phone: '91234567', email: 'john.doe@example.com', consent: true, created_at: new Date().toISOString() },
  ],
  visits: [
    { id: 'visit_01', guest_id: 'guest_01', check_in_ts: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), check_out_ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), host: 'Alice', reason: 'Meeting', device_info: 'MacBook Pro', custom_fields: {}, checked_in_by: 'user_guard_01', approval_status: 'approved', review_request_sent: true },
    { id: 'visit_02', guest_id: 'guest_01', check_in_ts: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), check_out_ts: null, host: 'Bob', reason: 'Interview', device_info: '', custom_fields: {}, checked_in_by: 'user_guard_01', approval_status: 'pending', review_request_sent: false },
    { id: 'visit_03', guest_id: 'guest_01', check_in_ts: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), check_out_ts: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), host: 'Host User', reason: 'Demo', device_info: 'iPad', custom_fields: {}, checked_in_by: 'user_guard_01', approval_status: 'pending', review_request_sent: false },
  ] as Visit[],
  customFields: [
    { id: 'cf_01', name: 'company', label: 'Company Name', type: 'text' as CustomFieldType },
    { id: 'cf_02', name: 'has_appointment', label: 'Has Appointment', type: 'checkbox' as CustomFieldType },
  ],
  hosts: [
    { id: 'host_01', name: 'Alice', department: 'Engineering' },
    { id: 'host_02', name: 'Bob', department: 'Marketing' },
    { id: 'host_03', name: 'Host User', department: 'Product' },
    { id: 'host_reception', name: 'Reception', department: 'Front Desk' },
  ] as Host[],
  appointments: [
    { id: 'appt_01', guest_name: 'Scheduled Guest', guest_id_number: 'S1234567A', host_id: 'user_host_01', created_at: new Date().toISOString(), status: 'scheduled' }
  ] as Appointment[],
  reviews: [] as Review[],
  notificationSettings: {
    auto_send_on_checkout: false,
    email_template: `Hi {{GUEST_NAME}},\n\nThanks for visiting us! We'd love to get your feedback.\n\nPlease complete our short survey here: {{REVIEW_LINK}}\n\nBest,\nThe Team`,
    sms_template: `Hi {{GUEST_NAME}}, thanks for visiting! Please give us your feedback here: {{REVIEW_LINK}}`,
  } as NotificationSettings,
  reviewRequests: [
     { id: 'rr_01', visit_id: 'visit_01', guest_name: 'John Doe', channel: 'email', sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
  ] as ReviewRequest[],
};

let MOCK_AUTH_USER: User = DB.users[1]; // Default to Guard

// --- MOCK SERVICE IMPLEMENTATION ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class PuterService {
  // --- Auth ---
  async login(role: Role): Promise<User> {
    await delay(100);
    const user = DB.users.find(u => u.role === role);
    if (!user) throw new Error('User for role not found');
    MOCK_AUTH_USER = user;
    return user;
  }

  async getCurrentUser(): Promise<User> {
    await delay(100);
    return MOCK_AUTH_USER;
  }
  
  // --- OCR ---
  async performOcr(file: File): Promise<OcrData> {
    console.log(`Simulating OCR for file: ${file.name}`);
    await delay(1500); // Simulate network and processing time
    // In a real app, this would call Puter's OCR API.
    // Here, we return mock data.
    return { name: 'Jane Doe OCR', id_number: 'S9876543Z' };
  }

  // --- Guests ---
  async searchGuestById(idNumber: string): Promise<Guest | null> {
    await delay(500);
    const guest = DB.guests.find(g => g.id_number.toLowerCase() === idNumber.toLowerCase());
    return guest || null;
  }

  async createGuest(data: Omit<Guest, 'id' | 'created_at'>): Promise<Guest> {
    await delay(300);
    const newGuest: Guest = {
      ...data,
      id: `guest_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    DB.guests.push(newGuest);
    return newGuest;
  }

  // --- Visits ---
  async createVisit(data: Omit<Visit, 'id' | 'check_in_ts' | 'check_out_ts' | 'approval_status' | 'review_request_sent'>): Promise<Visit> {
    await delay(300);
    const newVisit: Visit = {
      ...data,
      id: `visit_${Date.now()}`,
      check_in_ts: new Date().toISOString(),
      check_out_ts: null,
      approval_status: 'pending',
      review_request_sent: false,
    };
    DB.visits.push(newVisit);
    this.sendNotification({ type: 'check-in', visitId: newVisit.id });
    return newVisit;
  }

  async getActiveVisits(): Promise<Visit[]> {
    await delay(500);
    const active = DB.visits.filter(v => v.check_out_ts === null);
    // Populate guest and user data for display
    return active.map(v => ({
      ...v,
      guest: DB.guests.find(g => g.id === v.guest_id),
      checked_in_by_user: DB.users.find(u => u.id === v.checked_in_by)
    })).sort((a, b) => new Date(b.check_in_ts).getTime() - new Date(a.check_in_ts).getTime());
  }

  async checkoutVisit(visitId: string): Promise<Visit> {
    await delay(400);
    const visit = DB.visits.find(v => v.id === visitId);
    if (!visit) throw new Error('Visit not found');
    visit.check_out_ts = new Date().toISOString();

    if (DB.notificationSettings.auto_send_on_checkout) {
        await this.sendReviewRequest(visitId);
    }
    return visit;
  }

  async getVisitsLog(): Promise<Visit[]> {
    await delay(800);
    // Populate guest and user data for display
    return DB.visits.map(v => ({
        ...v,
        guest: DB.guests.find(g => g.id === v.guest_id),
        checked_in_by_user: DB.users.find(u => u.id === v.checked_in_by)
    })).sort((a, b) => new Date(b.check_in_ts).getTime() - new Date(a.check_in_ts).getTime());
  }

  async getRecentlyCheckedOutVisits(): Promise<Visit[]> {
    await delay(500);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const recent = DB.visits.filter(v => 
        v.check_out_ts !== null && 
        v.approval_status === 'approved' &&
        v.check_out_ts >= twentyFourHoursAgo
    );
    
    // Populate guest and user data for display
    return recent.map(v => ({
      ...v,
      guest: DB.guests.find(g => g.id === v.guest_id),
      checked_in_by_user: DB.users.find(u => u.id === v.checked_in_by)
    })).sort((a, b) => new Date(b.check_out_ts!).getTime() - new Date(a.check_out_ts!).getTime());
  }
  
  // --- Reviews ---
  async createReview(data: Review): Promise<Review> {
    await delay(200);
    DB.reviews.push(data);
    console.log('New review submitted:', data);
    return data;
  }

  async sendReviewRequest(visitId: string): Promise<Visit> {
    await delay(700);
    const visit = DB.visits.find(v => v.id === visitId);
    if (!visit || visit.review_request_sent) {
        throw new Error("Visit not found or request already sent");
    }
    const guest = DB.guests.find(g => g.id === visit.guest_id);
    if (!guest) {
        throw new Error("Guest not found for visit");
    }

    const channel = guest.email ? 'email' : 'sms';
    const template = channel === 'email' ? DB.notificationSettings.email_template : DB.notificationSettings.sms_template;
    const message = template
        .replace('{{GUEST_NAME}}', guest.name)
        .replace('{{REVIEW_LINK}}', `https://example.com/review/${visit.id}`);

    console.log(`--- WORKER: SENDING REVIEW REQUEST ---`);
    console.log(`To: ${guest.name} via ${channel} (${channel === 'email' ? guest.email : guest.phone})`);
    console.log(`Message: ${message}`);
    console.log(`------------------------------------`);
    
    const newRequest: ReviewRequest = {
        id: `rr_${Date.now()}`,
        visit_id: visit.id,
        guest_name: guest.name,
        channel,
        sent_at: new Date().toISOString(),
    };
    DB.reviewRequests.push(newRequest);
    visit.review_request_sent = true;
    return visit;
  }


  // --- Admin ---
  async getUsers(): Promise<User[]> {
    await delay(300);
    return [...DB.users];
  }

  async addUser(data: Omit<User, 'id'>): Promise<User> {
    await delay(300);
    const newUser: User = { ...data, id: `user_${Date.now()}` };
    DB.users.push(newUser);
    return newUser;
  }
  
  async getHosts(): Promise<Host[]> {
    await delay(300);
    return [...DB.hosts];
  }

  async addHost(data: Omit<Host, 'id'>): Promise<Host> {
    await delay(300);
    const newHost: Host = { ...data, id: `host_${Date.now()}` };
    DB.hosts.push(newHost);
    return newHost;
  }

  async getCustomFields(): Promise<CustomField[]> {
    await delay(200);
    return [...DB.customFields];
  }

  async addCustomField(data: Omit<CustomField, 'id'>): Promise<CustomField> {
    await delay(300);
    const newField: CustomField = { ...data, id: `cf_${Date.now()}` };
    DB.customFields.push(newField);
    return newField;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    await delay(200);
    return { ...DB.notificationSettings };
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    await delay(400);
    DB.notificationSettings = { ...settings };
    return { ...DB.notificationSettings };
  }

  async getReviewRequests(): Promise<ReviewRequest[]> {
      await delay(500);
      return [...DB.reviewRequests].sort((a,b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  // --- Host Specific ---
  async createAppointment(data: Omit<Appointment, 'id' | 'created_at' | 'status'>): Promise<Appointment> {
    await delay(300);
    const newAppointment: Appointment = {
      ...data,
      id: `appt_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'scheduled',
    };
    DB.appointments.push(newAppointment);
    return newAppointment;
  }

  async getAppointmentsForHost(hostId: string): Promise<Appointment[]> {
    await delay(400);
    return DB.appointments
      .filter(a => a.host_id === hostId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getAppointmentByIdNumber(idNumber: string): Promise<Appointment | null> {
    await delay(400);
    return DB.appointments.find(a => a.guest_id_number.toLowerCase() === idNumber.toLowerCase()) || null;
  }

  async getVisitsForHost(hostName: string): Promise<Visit[]> {
    await delay(600);
    const visitsForHost = DB.visits.filter(v => v.host === hostName && v.check_out_ts !== null);
    return visitsForHost.map(v => ({
      ...v,
      guest: DB.guests.find(g => g.id === v.guest_id),
    })).sort((a, b) => new Date(b.check_in_ts).getTime() - new Date(a.check_in_ts).getTime());
  }

  async approveVisit(visitId: string): Promise<Visit> {
    await delay(400);
    const visit = DB.visits.find(v => v.id === visitId);
    if (!visit) throw new Error("Visit not found");
    visit.approval_status = 'approved';
    return visit;
  }

  // --- Workers (Notifications) ---
  async sendNotification(details: { type: 'check-in'; visitId: string }) {
    // This would trigger a Puter Worker
    await delay(100);
    const visit = DB.visits.find(v => v.id === details.visitId);
    const guest = DB.guests.find(g => g.id === visit?.guest_id);
    console.log(`--- WORKER SIMULATION ---`);
    console.log(`Sending notification for ${details.type}`);
    console.log(`To Host: ${visit?.host}`);
    console.log(`To Guest: ${guest?.name} (${guest?.email})`);
    console.log(`-------------------------`);
  }
}

export const puterService = new PuterService();