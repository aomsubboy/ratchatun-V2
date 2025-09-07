# Rachatant (Codespace Starter)

## ใช้งานเร็วใน Codespaces
1) เปิด Codespace ของ repo นี้
2) คัดลอกไฟล์ `.env.local.example` เป็น `.env.local` แล้วใส่ค่า Supabase (URL, anon key, service_role)
3) ไปที่ Supabase → SQL Editor → วางสคริปต์ด้านล่าง → Run (สร้างตารางและ seed ผู้ใช้ตัวอย่าง)
4) กลับมา Codespace → ติดตั้งและรัน
   ```bash
   npm install
   npm run set-pin   # ตั้ง PIN 123456 ให้ INM-1001
   npm run dev
   ```
5) เปิดเว็บ (พอร์ต 3000) → Login ด้วย
   - รหัสภายใน: INM-1001
   - PIN: 123456

## SQL ตั้งตาราง/นโยบายครั้งแรก (คัดลอกไปวางใน Supabase SQL Editor)
```sql
create type user_role as enum ('inmate','staff','admin');

create table if not exists facility (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  created_at timestamptz not null default now()
);
create table if not exists unit (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facility(id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  unique (facility_id, code)
);

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique,
  role user_role not null,
  internal_code text unique not null,
  pin_hash text,
  first_name text, last_name text,
  facility_id uuid references facility(id),
  unit_id uuid references unit(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists mood_entry (
  id uuid primary key default gen_random_uuid(),
  inmate_id uuid not null references app_user(id) on delete restrict,
  mood int not null check (mood between 1 and 6),
  for_date date not null,
  created_at timestamptz not null default now(),
  unique (inmate_id, for_date)
);

create or replace function current_app_user_id()
returns uuid language sql stable as $$
  select u.id from app_user u where u.auth_uid = auth.uid() limit 1;
$$;
create or replace function current_role()
returns user_role language sql stable as $$
  select u.role from app_user u where u.auth_uid = auth.uid() limit 1;
$$;

alter table app_user enable row level security;
alter table mood_entry enable row level security;

create policy app_user_self_read on app_user
for select using ( current_role()='admin' or id = current_app_user_id() );

create policy mood_entry_rw on mood_entry
for all using ( current_role()='admin' or (current_role()='inmate' and inmate_id=current_app_user_id()) );

-- seed
insert into facility (name, code) values ('เรือนจำกลางทดสอบ','FAC-A')
on conflict (code) do nothing;

insert into unit (facility_id, name, code)
values ((select id from facility where code='FAC-A'),'แดน 1','U-1')
on conflict do nothing;

insert into app_user (role, internal_code, first_name, last_name, facility_id, unit_id, pin_hash)
values ('inmate','INM-1001','นาย','ก',(select id from facility where code='FAC-A'),(select id from unit where code='U-1'), null)
on conflict (internal_code) do nothing;
```
