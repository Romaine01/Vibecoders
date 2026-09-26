-- Migration: RLS Hardening, Seed Data, and Schema Alignment
-- Fills the empty 20260924061009 migration file.

-- 1. Default organization
insert into public.organizations (id, name, region)
values ('00000000-0000-0000-0000-000000000001', 'ONE Community Services', 'Your community')
on conflict (id) do update set name = excluded.name, region = excluded.region;

-- 2. Seed Document Types
insert into public.document_types (id, organization_id, name, active)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Certificate of Residency', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Certificate of Indigency', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Community Clearance', true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Business Clearance', true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Good Moral Certificate', true),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Barangay Clearance', true),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Other', true)
on conflict (id) do update set name = excluded.name, active = excluded.active;

-- 3. Seed SDG Goals
insert into public.sdg_goals (code, name)
values
  ('SDG 3', 'Good health and well-being'),
  ('SDG 6', 'Clean water and sanitation'),
  ('SDG 9', 'Industry, innovation and infrastructure'),
  ('SDG 11', 'Sustainable cities and communities'),
  ('SDG 12', 'Responsible consumption and production'),
  ('SDG 13', 'Climate action'),
  ('SDG 16', 'Peace, justice and strong institutions'),
  ('SDG 17', 'Partnerships for the goals')
on conflict (code) do update set name = excluded.name;

-- 4. Seed SDG Mappings
insert into public.sdg_mappings (category, sdg_code)
values
  ('roads_infrastructure', 'SDG 9'),
  ('roads_infrastructure', 'SDG 11'),
  ('waste_management', 'SDG 11'),
  ('waste_management', 'SDG 12'),
  ('water_sanitation', 'SDG 6'),
  ('water_sanitation', 'SDG 11'),
  ('environment', 'SDG 11'),
  ('environment', 'SDG 13'),
  ('public_safety', 'SDG 11'),
  ('public_safety', 'SDG 16'),
  ('health_sanitation', 'SDG 3'),
  ('health_sanitation', 'SDG 6'),
  ('disaster_emergency', 'SDG 11'),
  ('disaster_emergency', 'SDG 13'),
  ('other', 'SDG 16')
on conflict (category, sdg_code) do nothing;

-- 5. Flexibility improvements: relax foreign key constraint on assigned_to to allow team names or UUIDs
do $$
begin
  alter table public.concerns drop constraint if exists concerns_assigned_to_fkey;
  alter table public.concerns alter column assigned_to type text;
exception
  when others then null;
end $$;

-- Allow entity_id in audit_logs to be text (reference string or uuid)
do $$
begin
  alter table public.audit_logs alter column entity_id type text;
exception
  when others then null;
end $$;

-- 6. Additional RLS Policies
-- Allow public verification of issued/released document requests
do $$
begin
  create policy "public verify ready and released documents"
    on public.document_requests for select
    using (status in ('ready', 'released'));
exception
  when duplicate_object then null;
end $$;

-- Document types read access
alter table public.document_types enable row level security;
do $$
begin
  create policy "anyone read document types"
    on public.document_types for select
    using (true);
exception
  when duplicate_object then null;
end $$;

-- Announcements RLS
alter table public.announcements enable row level security;
do $$
begin
  create policy "anyone read published announcements"
    on public.announcements for select
    using (status = 'published' or public.is_admin());
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "admins manage announcements"
    on public.announcements for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then null;
end $$;

-- Emergency Contacts RLS
alter table public.emergency_contacts enable row level security;
do $$
begin
  create policy "anyone read active emergency contacts"
    on public.emergency_contacts for select
    using (active = true or public.is_admin());
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "admins manage emergency contacts"
    on public.emergency_contacts for all
    using (public.is_admin())
    with check (public.is_admin());
exception
  when duplicate_object then null;
end $$;

-- SDG goals & mappings read access
alter table public.sdg_goals enable row level security;
do $$
begin
  create policy "anyone read sdg goals"
    on public.sdg_goals for select
    using (true);
exception
  when duplicate_object then null;
end $$;

alter table public.sdg_mappings enable row level security;
do $$
begin
  create policy "anyone read sdg mappings"
    on public.sdg_mappings for select
    using (true);
exception
  when duplicate_object then null;
end $$;

-- Resident profile self update
do $$
begin
  create policy "residents update own profile"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());
exception
  when duplicate_object then null;
end $$;
