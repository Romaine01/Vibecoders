-- ONE Community Services: production schema foundation.
-- Run this migration in Supabase before enabling production mode.
create extension if not exists pgcrypto;

create type public.user_role as enum ('resident', 'admin');
create type public.concern_status as enum ('submitted', 'received', 'assigned', 'in_progress', 'resolved', 'rejected');
create type public.concern_urgency as enum ('normal', 'urgent');
create type public.document_status as enum ('submitted', 'under_review', 'processing', 'ready', 'released', 'rejected');

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  full_name text not null,
  email text not null,
  role public.user_role not null default 'resident',
  created_at timestamptz not null default now()
);

create table if not exists public.concerns (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  resident_id uuid not null references public.profiles(id),
  category text not null,
  title text not null,
  description text not null,
  location_text text not null,
  latitude numeric,
  longitude numeric,
  urgency public.concern_urgency not null default 'normal',
  status public.concern_status not null default 'submitted',
  assigned_to uuid references public.profiles(id),
  action_taken text,
  resolution_notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.concern_updates (
  id uuid primary key default gen_random_uuid(),
  concern_id uuid not null references public.concerns(id) on delete cascade,
  status public.concern_status not null,
  note text not null,
  actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.concern_attachments (
  id uuid primary key default gen_random_uuid(),
  concern_id uuid not null references public.concerns(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  name text not null,
  active boolean not null default true
);

create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  resident_id uuid not null references public.profiles(id),
  document_type_id uuid references public.document_types(id),
  purpose text not null,
  status public.document_status not null default 'submitted',
  issue_date timestamptz,
  issuing_organization text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.document_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.document_requests(id) on delete cascade,
  status public.document_status not null,
  note text not null,
  actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id),
  priority text not null default 'standard', title text not null, excerpt text not null,
  published_at timestamptz not null default now()
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id),
  label text not null, number text not null, description text not null, active boolean not null default true
);

create table if not exists public.sdg_goals (
  code text primary key, name text not null
);

create table if not exists public.sdg_mappings (
  category text not null, sdg_code text not null references public.sdg_goals(code), primary key (category, sdg_code)
);

create table if not exists public.impact_records (
  id uuid primary key default gen_random_uuid(), concern_id uuid not null references public.concerns(id),
  sdg_code text not null references public.sdg_goals(code), outcome text not null, recorded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id), action text not null,
  entity_type text not null, entity_id uuid, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

-- New Supabase Auth users start as residents. Promote the controlled admin accounts separately.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.email, 'resident')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.concerns enable row level security;
alter table public.concern_updates enable row level security;
alter table public.concern_attachments enable row level security;
alter table public.document_requests enable row level security;
alter table public.document_updates enable row level security;
alter table public.impact_records enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "residents read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "residents read own concerns" on public.concerns for select using (resident_id = auth.uid() or public.is_admin());
create policy "residents create own concerns" on public.concerns for insert with check (resident_id = auth.uid());
create policy "admins update concerns" on public.concerns for update using (public.is_admin()) with check (public.is_admin());
create policy "concern updates visible to owners" on public.concern_updates for select using (exists(select 1 from public.concerns c where c.id = concern_id and (c.resident_id = auth.uid() or public.is_admin())));
create policy "admins create concern updates" on public.concern_updates for insert with check (public.is_admin() or exists(select 1 from public.concerns c where c.id = concern_id and c.resident_id = auth.uid()));
create policy "residents read own document requests" on public.document_requests for select using (resident_id = auth.uid() or public.is_admin());
create policy "residents create own document requests" on public.document_requests for insert with check (resident_id = auth.uid());
create policy "admins update documents" on public.document_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());
create policy "admins create audit logs" on public.audit_logs for insert with check (public.is_admin());
create policy "admins read impact records" on public.impact_records for select using (public.is_admin());
create policy "admins create impact records" on public.impact_records for insert with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('concern-evidence', 'concern-evidence', false) on conflict (id) do nothing;
create policy "owners and admins read concern evidence" on storage.objects for select using (bucket_id = 'concern-evidence' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));
create policy "residents upload own concern evidence" on storage.objects for insert with check (bucket_id = 'concern-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
