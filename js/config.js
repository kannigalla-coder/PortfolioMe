// ====== ตั้งค่า Supabase — ใส่ 2 ค่านี้ให้เป็นของโปรเจกต์คุณ ======
// หาได้ที่ Supabase Dashboard → Project Settings → Data API / API Keys
// ใช้ publishable key (sb_publishable_...) เท่านั้น ห้ามใส่ secret/service_role key
// publishable key เปิดเผยได้ ความปลอดภัยของข้อมูลคุมด้วย RLS ใน supabase-setup.sql
// ถ้าเว้นว่าง เว็บจะอ่านข้อมูลจาก data/resume.json แทน และซ่อนฟอร์มฝากข้อความ
export const SUPABASE_URL = "https://iuxwitzkenowbpjwuqvy.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_FIIco7X9efe5q1vMFy7bQw_ugMz_XE4";

// อีเมลเจ้าของเว็บที่เข้าหน้า admin ได้ (ต้องตรงกับใน supabase-setup.sql)
export const ADMIN_EMAIL = "kannigal.la@gmail.com";
