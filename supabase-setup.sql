-- ============================================================
--  ตารางสำหรับเว็บพอร์ตโฟลิโอ
--  วิธีใช้: Supabase Dashboard → SQL Editor → New query
--  วางทั้งไฟล์นี้ แล้วกด Run (รันซ้ำได้)
--  อีเมลเจ้าของต้องตรงกับ ADMIN_EMAIL ใน js/config.js
-- ============================================================

-- ข้อมูลเรซูเม่ เก็บเป็น JSON ก้อนเดียว (แถว id = 'resume')
create table if not exists public.site_content (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ข้อความจากฟอร์ม "ฝากข้อความถึงฉัน"
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  contact    text check (char_length(contact) <= 200),
  message    text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.messages     enable row level security;

drop policy if exists "resume public read"  on public.site_content;
drop policy if exists "resume owner insert" on public.site_content;
drop policy if exists "resume owner update" on public.site_content;
drop policy if exists "messages public insert" on public.messages;
drop policy if exists "messages owner read"    on public.messages;
drop policy if exists "messages owner delete"  on public.messages;

-- เรซูเม่: ทุกคนอ่านได้ แก้ได้เฉพาะเจ้าของ
create policy "resume public read"  on public.site_content for select using (true);
create policy "resume owner insert" on public.site_content for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'kannigal.la@gmail.com');
create policy "resume owner update" on public.site_content for update to authenticated
  using ((auth.jwt() ->> 'email') = 'kannigal.la@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'kannigal.la@gmail.com');

-- ข้อความ: ใครก็ส่งได้ (ตรวจความยาวด้วย check ด้านบน) อ่าน/ลบได้เฉพาะเจ้าของ แก้ไม่ได้
create policy "messages public insert" on public.messages for insert with check (true);
create policy "messages owner read"    on public.messages for select to authenticated
  using ((auth.jwt() ->> 'email') = 'kannigal.la@gmail.com');
create policy "messages owner delete"  on public.messages for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'kannigal.la@gmail.com');
