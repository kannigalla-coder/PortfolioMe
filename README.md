# Portfolio · กรรณิกา ลาวะกุล

เว็บเรซูเม่/พอร์ตโฟลิโอ HTML + JavaScript ล้วน (ไม่ต้อง build) ใช้ Supabase เก็บข้อมูลเรซูเม่และข้อความจากผู้เยี่ยมชม โฮสต์บน GitHub Pages

```
index.html          หน้าเว็บหลัก (อ่านข้อมูลแล้ววาดหน้า)
admin.html          หน้าแก้ไขข้อมูล + อ่านข้อความ (ล็อกอินด้วยลิงก์ทางอีเมล เฉพาะเจ้าของ)
data/resume.json    ข้อมูลเรซูเม่ตั้งต้น (ใช้เมื่อยังไม่มีข้อมูลใน Supabase)
js/config.js        URL และ publishable key ของ Supabase ← ต้องแก้
supabase-setup.sql  สร้างตาราง + RLS (รันใน SQL Editor)
```

## ทำงานอย่างไร

- หน้าเว็บอ่านเรซูเม่จากตาราง `site_content` (แถว `id = 'resume'`) ถ้าไม่มี หรือยังไม่ได้ตั้งค่า Supabase จะอ่านจาก `data/resume.json`
- ฟอร์ม "ฝากข้อความถึงฉัน" บันทึกลงตาราง `messages` (แสดงเฉพาะเมื่อตั้งค่า Supabase แล้ว)
- `admin.html` ล็อกอินด้วย Magic Link ได้เฉพาะ `kannigal.la@gmail.com` แก้ข้อมูลเป็น JSON แล้วบันทึก และอ่าน/ลบข้อความ
- สิทธิ์ทั้งหมดคุมด้วย Row Level Security: ทุกคนอ่านเรซูเม่และส่งข้อความได้ แต่แก้เรซูเม่และอ่านข้อความได้เฉพาะเจ้าของ

## รันในเครื่อง

เปิดไฟล์ตรงๆ (double-click) ไม่ได้ เพราะเบราว์เซอร์ไม่ยอมโหลด module/JSON จาก `file://` ให้รันผ่าน server:

```bash
npx serve .
# หรือใช้ส่วนเสริม Live Server ใน VS Code
```

## ตั้งค่า Supabase (ครั้งแรก)

ใช้ project เดิมที่มีอยู่ได้ (ตารางใหม่ไม่ชนกับตารางเดิม) หรือสร้าง project ใหม่ที่ https://supabase.com/dashboard

1. **SQL Editor → New query** → วางทั้งไฟล์ `supabase-setup.sql` → **Run**
2. **Project Settings → Data API / API Keys** → คัดลอก Project URL และ **publishable key** (`sb_publishable_...`) มาใส่ใน `js/config.js`
   ห้ามใช้ secret / service_role key เด็ดขาด เพราะไฟล์นี้ทุกคนเห็น
3. **Authentication → URL Configuration**
   - **Site URL:** `https://<ชื่อผู้ใช้ GitHub>.github.io/<ชื่อ repo>/`
   - **Redirect URLs:** เพิ่ม `https://<ชื่อผู้ใช้ GitHub>.github.io/<ชื่อ repo>/admin.html` และ `http://localhost:3000/admin.html` (ไว้ทดสอบในเครื่อง)
   - ถ้า project นี้มีเว็บอื่นใช้ Auth อยู่แล้ว ไม่ต้องเปลี่ยน Site URL เพิ่มแค่ Redirect URLs
4. เปิด `admin.html` → กด **ส่งลิงก์เข้าสู่ระบบทางอีเมล** → กดลิงก์ในอีเมล → กด **บันทึก** เพื่อเอาข้อมูลจากไฟล์ขึ้น Supabase

> ถ้าเปลี่ยนอีเมลเจ้าของ ต้องแก้ทั้ง `ADMIN_EMAIL` ใน `js/config.js` และทุกจุดใน `supabase-setup.sql` แล้วรัน SQL ใหม่

## ขึ้น GitHub Pages

1. สร้าง repo ใหม่ที่ https://github.com/new (Public) เช่น `portfolio`
2. ในโฟลเดอร์นี้:
   ```bash
   git remote add origin https://github.com/<ชื่อผู้ใช้>/portfolio.git
   git push -u origin main
   ```
3. ใน repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save**
4. รอ 1–2 นาที เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/portfolio/`

ถ้าตั้งชื่อ repo เป็น `<ชื่อผู้ใช้>.github.io` เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/` โดยตรง

## แก้ข้อมูลเรซูเม่

- **ทางเว็บ:** เข้า `admin.html` แก้ JSON แล้วกดบันทึก (มีผลทันที ไม่ต้อง push)
- **ทางไฟล์:** แก้ `data/resume.json` แล้ว push (ใช้เมื่อยังไม่มีข้อมูลใน Supabase หรือกด "โหลดค่าจากไฟล์" ใน admin แล้วบันทึก)
