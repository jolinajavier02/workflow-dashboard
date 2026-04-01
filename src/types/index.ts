export type Role = 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'RND_MANAGER' | 'PACKAGING_MANAGER' | 'OWNER' | 'PROJECT_MANAGER';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  lead_code: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  client_whatsapp?: string;
  company_name?: string;
  role_category?: string;
  requirement_details: string;
  formulation_details?: string;
  packaging_details?: string;
  lead_source?: string;
  priority?: 'high' | 'medium' | 'low';
  document_url?: string;
  is_trashed?: boolean;
  current_stage: number;
  assigned_sales_manager?: string;
  assigned_sales_executive?: string;
  status: 'active' | 'closed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export type SLAStatus = 'on_time' | 'at_risk' | 'breached';

export interface StageLog {
  id: string;
  lead_id: string;
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

export interface Brief {
  id: string;
  lead_id: string;
  brief_type: 'formulation' | 'packaging';
  document_url: string;
  deadline: string;
  submitted_by: string;
  approved_by?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface Sample {
  id: string;
  lead_id: string;
  sample_type: 'formulation' | 'packaging';
  dispatched_by: string;
  dispatched_at: string;
  received_confirmed_by?: string;
  received_confirmed_at?: string;
  courier_docket?: string;
  tracking_number?: string;
  tracking_url?: string;
}

export interface ProformaInvoice {
  id: string;
  lead_id: string;
  created_by: string;
  document_url: string;
  status: 'draft' | 'confirmed' | 'sent_to_client';
  created_at: string;
  sent_at?: string;
}

export interface Notification {
  id: string;
  lead_id: string;
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

// Stage definitions
export const STAGES = [
  { number: 0, name: 'Lead Received', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 1, name: 'Catalog Sent to Client', owner: 'SALES_MANAGER', sla_hours: 2 },
  { number: 2, name: 'Formulation Sample Brief Submitted', owner: 'SALES_MANAGER', sla_hours: 8 },
  { number: 2.1, name: 'Formulation Brief Approved', owner: 'RND_MANAGER', sla_hours: 6 },
  { number: 3, name: 'Packaging Sample Brief Submitted', owner: 'SALES_MANAGER', sla_hours: 8 },
  { number: 3.1, name: 'Packaging Brief Approved', owner: 'PACKAGING_MANAGER', sla_hours: 6 },
  { number: 4, name: 'Client Intimated on Timeline', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 5, name: 'R&D Sample Preparation (In Progress)', owner: 'RND_MANAGER', sla_hours: -1 },
  { number: 6, name: 'Packaging Preparation (In Progress)', owner: 'PACKAGING_MANAGER', sla_hours: -1 },
  { number: 7, name: 'R&D Sample Dispatched to Sales Manager', owner: 'RND_MANAGER', sla_hours: -1 },
  { number: 7.1, name: 'Sales Manager Confirms Formulation Sample Received', owner: 'SALES_MANAGER', sla_hours: 2 },
  { number: 8, name: 'Packaging Sample Dispatched to Sales Manager', owner: 'PACKAGING_MANAGER', sla_hours: -1 },
  { number: 8.1, name: 'Sales Manager Confirms Packaging Sample Received', owner: 'SALES_MANAGER', sla_hours: 2 },
  { number: 9, name: 'Sales Manager Instructs Sales Executive to Ship', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 9.1, name: 'Sales Executive Confirms Task Acknowledged', owner: 'SALES_EXECUTIVE', sla_hours: 4 },
  { number: 10, name: 'Sample Labelling Done', owner: 'SALES_EXECUTIVE', sla_hours: 2 },
  { number: 11, name: 'Courier Docket Added', owner: 'SALES_EXECUTIVE', sla_hours: 2 },
  { number: 12, name: 'Sample Handed to Security', owner: 'SALES_EXECUTIVE', sla_hours: 2 },
  { number: 13, name: 'Courier Tracking Sent to Client', owner: 'SALES_EXECUTIVE', sla_hours: 2 },
  { number: 14, name: 'Sales Manager Books Follow-Up Call', owner: 'SALES_MANAGER', sla_hours: 48 },
  { number: 15, name: 'Sales Tracker Updated', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 16, name: 'Follow-Up & Negotiation (Ongoing)', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 17, name: 'Proforma Invoice Created', owner: 'SALES_EXECUTIVE', sla_hours: 8 },
  { number: 18, name: 'PI Confirmed and Sent to Client', owner: 'SALES_MANAGER', sla_hours: 8 },
  { number: 19, name: 'Lead Closed (PO Received)', owner: 'SALES_MANAGER', sla_hours: -1 },
] as const;

export const STAGE_COLUMNS = [
  { id: 'new', name: 'New', stages: [0, 1], color: 'blue' },
  { id: 'briefing', name: 'Briefing', stages: [2, 2.1, 3, 3.1], color: 'purple' },
  { id: 'production', name: 'In Production', stages: [4, 5, 6, 7, 7.1, 8, 8.1], color: 'amber' },
  { id: 'dispatch', name: 'Dispatch', stages: [9, 9.1, 10, 11, 12, 13], color: 'teal' },
  { id: 'follow-up', name: 'Follow-Up', stages: [14, 15, 16], color: 'rose' },
  { id: 'closing', name: 'Closing', stages: [17, 18, 19], color: 'emerald' },
];
