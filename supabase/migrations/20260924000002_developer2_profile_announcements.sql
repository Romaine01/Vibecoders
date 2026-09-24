-- Developer 2 additive migration (NOT applied — run in Supabase Dashboard SQL editor).
-- Adds resident profile fields, announcement type/status, and emergency contact categories
-- on top of 001_one_schema.sql. Safe: only adds columns and sets defaults.

alter table if exists public.profiles
  add column if not exists phone text,
  add column if not exists address text;

alter table if exists public.announcements
  add column if not exists type text not null default 'announcement',
  add column if not exists status text not null default 'published';

alter table if exists public.emergency_contacts
  add column if not exists category text not null default 'other';

do $$
begin
  alter table public.announcements
    add constraint announcements_type_check
    check (type in ('announcement', 'advisory', 'emergency', 'service_notice'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.announcements
    add constraint announcements_status_check
    check (status in ('draft', 'published', 'archived'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.emergency_contacts
    add constraint emergency_contacts_category_check
    check (category in ('medical', 'police', 'fire', 'disaster', 'other'));
exception
  when duplicate_object then null;
end $$;

create index if not exists announcements_status_idx on public.announcements (status, published_at desc);
