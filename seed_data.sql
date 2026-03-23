-- Seed Users (Passwords: Password123!)
-- You might need to manually create these in the Supabase Dashboard, but here is the profile mapping
-- UUIDs here are placeholders, in a real scenario you get them from auth.users

-- 1. Create Profiles (Assuming Auth Users created)
-- Note: Replace these UUIDs with actual ones from your Supabase Auth table if needed

INSERT INTO profiles (id, role, full_name) VALUES 
('00000000-0000-0000-0000-000000000001', 'ADMIN', 'System Admin'),
('00000000-0000-0000-0000-000000000002', 'SALES_MANAGER', 'John Sales Manager'),
('00000000-0000-0000-0000-000000000003', 'SALES_EXECUTIVE', 'Alice Sales Executive'),
('00000000-0000-0000-0000-000000000004', 'RND_MANAGER', 'Dr. Bob R&D'),
('00000000-0000-0000-0000-000000000005', 'PACKAGING_MANAGER', 'Mary Packaging');

-- 2. Create Sample Leads
INSERT INTO leads (lead_code, client_name, client_phone, client_email, requirement_details, current_stage, assigned_sales_manager, assigned_sales_executive) VALUES
('LEAD-2026-001', 'Global Cosmetics Ltd', '+1 555-0101', 'contact@globalcosmo.com', 'Initial sample request for Herbal Face Wash formulation and sustainable packaging.', 2, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
('LEAD-2026-002', 'Nexus Pharma', '+1 555-0102', 'info@nexuspharma.com', 'Request for premium sunscreen SPF 50 formulation.', 0, '00000000-0000-0000-0000-000000000002', NULL),
('LEAD-2026-003', 'EcoSkin Care', '+1 555-0103', 'hello@ecoskin.com', 'Retinol serum samples for upcoming product line.', 7.1, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
('LEAD-2026-004', 'Pure Beauty', '+1 555-0104', 'sales@purebeauty.com', 'Body lotion formulation with almond oil.', 13, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- 3. Create Stage Logs for first lead
INSERT INTO stage_logs (lead_id, stage_number, stage_name, assigned_to_role, started_at, deadline_at) 
SELECT id, 0, 'Lead Received', 'SALES_MANAGER', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day' FROM leads WHERE lead_code = 'LEAD-2026-001';

INSERT INTO stage_logs (lead_id, stage_number, stage_name, assigned_to_role, started_at, deadline_at, completed_at, sla_status) 
SELECT id, 1, 'Catalog Sent to Client', 'SALES_MANAGER', NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '23 hours', 'on_time' FROM leads WHERE lead_code = 'LEAD-2026-001';

-- 4. Sample Inquiries
INSERT INTO inquiries (name, phone, message) VALUES
('Abhijeet Anand', '9876543210', 'Interested in private labeling for serum.'),
('Priya Sharma', '9123456789', 'Need bulk pricing for face wash.');
