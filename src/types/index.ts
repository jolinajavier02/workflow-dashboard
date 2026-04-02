export type Role = 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'RND_MANAGER' | 'PACKAGING_MANAGER' | 'OWNER' | 'PROJECT_MANAGER';

export interface Profile {
  user_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role: Role;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  last_login?: string;
  profile_picture?: string;
}

export interface Lead {
  lead_id: number;
  client_name: string;
  phone_number: string;
  email_address: string;
  whatsapp_number?: string;
  company_name: string;
  contact_role_category: string;
  lead_source: string;
  priority: 'high' | 'medium' | 'low';
  formulation_details?: string;
  packaging_details?: string;
  requirement_details: string;
  requirement_brief?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Frontend UI states (not in DB schema but needed for dashboard)
  id: string; // Used for UI keying/mock compat
  current_stage: number;
  status: 'active' | 'closed' | 'on_hold';
  is_trashed?: boolean;
  assigned_account_role?: Role; // Logic compatibility
}

export interface LeadApproval {
  approval_id: number;
  lead_id: number;
  approval_type: string;
  reviewed_by: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  reviewed_at: string;
}

export type SLAStatus = 'on_time' | 'at_risk' | 'breached';

export interface StageLog {
  id: string;
  lead_id: number;
  stage_number: number;
  stage_name: string;
  assigned_to_role: Role;
  assigned_to_user?: string;
  started_at: string;
  deadline_at?: string;
  completed_at?: string;
  sla_status: SLAStatus;
  notes?: string;
}

export interface Notification {
  id: string;
  lead_id: number;
  target_role: Role;
  target_user?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  file_url?: string;
  created_at: string;
}

export * from '@/data';

