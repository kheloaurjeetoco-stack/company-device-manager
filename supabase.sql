create extension if not exists pgcrypto;

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  employee_label text not null default '',
  model text not null default '',
  manufacturer text not null default '',
  android_version text not null default '',
  battery integer not null default 0 check (battery between 0 and 100),
  online boolean not null default false,
  sim_count integer,
  carrier text not null default '',
  sms_consent boolean not null default false,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.selected_sms_share (
  id bigint generated always as identity primary key,
  device_id text not null references public.devices(device_id) on delete cascade,
  employee_label text not null default '',
  message_text text not null,
  shared_at timestamptz not null default now()
);

alter table public.devices enable row level security;
alter table public.selected_sms_share enable row level security;

drop policy if exists "authenticated read devices" on public.devices;
create policy "authenticated read devices" on public.devices for select to authenticated using (true);
drop policy if exists "authenticated read sms shares" on public.selected_sms_share;
create policy "authenticated read sms shares" on public.selected_sms_share for select to authenticated using (true);

create index if not exists devices_updated_at_idx on public.devices(updated_at desc);
create index if not exists sms_shared_at_idx on public.selected_sms_share(shared_at desc);
