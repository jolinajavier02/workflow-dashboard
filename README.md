# Sales & Operations Workflow Dashboard

A premium, functional dashboard for managing manufacturing sampling processes with 5 levels of RBAC.

## Tech Stack
- **Framework**: Next.js 14/15 (App Router)
- **Styling**: Tailwind CSS 4
- **Database/Auth**: Supabase (PostgreSQL + RLS)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Types**: TypeScript

## Key Features
- **Role-Based Access Control (RBAC)**: Admin, Sales Manager, Sales Executive, R&D Manager, Packaging Manager.
- **Data Protection**: Client PII is masked for Operations roles (R&D/Packaging) via Supabase Views and RLS.
- **Kanban Pipeline**: 20 workflow stages with SLA timers and role-oership.
- **Inquiry System**: Public-facing inquiry form with file uploads, feeding directly into the dashboard.
- **Task Management**: Filtered view of pending actions per role.
- **Sales Tracker**: Audit logs and KPI tracking for managers.

## Setup Instructions

### 1. Supabase Setup
- Create a new Supabase project.
- Run the provided `supabase_schema.sql` in the SQL Editor to create tables, enums, policies, and views.
- (Optional) Run `seed_data.sql` to populate sample leads and inquiries.
- Enable STORAGE bucket named `inquiries` (public or restricted as per needs).

### 2. Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Sample Credentials
- **Admin**: `admin@workflow.com` / `Password123!`
- **Manager**: `manager@workflow.com` / `Password123!`
*(Note: Create these users in Supabase Auth and map their IDs in the `profiles` table)*

## Workflow Stages
Stages 0-19 are implemented as per specification, moving from Lead intake to PO Received.

## Security
Enforced via:
1. **Middleware**: Prevents unauthenticated access to `/dashboard/*`.
2. **Supabase RLS**: Table-level security for INSERT/UPDATE/DELETE.
3. **Database Views**: Column-level masking for `client_name`, `email`, etc., based on auth user role.
