# Portfolio · กรรณิกา ลาวะกุล

เว็บเรซูเม่/พอร์ตโฟลิโอ HTML + JavaScript ล้วน (ไม่ต้อง build) ใช้ Firebase Firestore เก็บข้อมูลเรซูเม่และข้อความจากผู้เยี่ยมชม โฮสต์บน GitHub Pages

```
index.html          หน้าเว็บหลัก (อ่านข้อมูลแล้ววาดหน้า)
admin.html          หน้าแก้ไขข้อมูล + อ่านข้อความ (ล็อกอิน Google เฉพาะเจ้าของ)
data/resume.json    ข้อมูลเรซูเม่ตั้งต้น (ใช้เมื่อยังไม่มีข้อมูลใน Firestore)
js/firebase-config.js  ค่าตั้งค่า Firebase ← ต้องแก้
firestore.rules     กฎความปลอดภัยของ Firestore
```

## ทำงานอย่างไร

- หน้าเว็บอ่านเรซูเม่จาก Firestore `site/resume` ถ้าไม่มี หรือยังไม่ได้ตั้งค่า Firebase จะอ่านจาก `data/resume.json`
- ฟอร์ม "ฝากข้อความ" บันทึกลง Firestore `messages` (แสดงเฉพาะเมื่อตั้งค่า Firebase แล้ว)
- `admin.html` ล็อกอินด้วย Google ได้เฉพาะ `kannigal.la@gmail.com` แก้ข้อมูลเป็น JSON แล้วบันทึก และอ่าน/ลบข้อความ

## รันในเครื่อง

เปิดไฟล์ตรงๆ (double-click) ไม่ได้ เพราะเบราว์เซอร์ไม่ยอมโหลด module/JSON จาก `file://` ให้รันผ่าน server:

```bash
npx serve .
# หรือใช้ส่วนเสริม Live Server ใน VS Code
```

## ตั้งค่า Firebase (ครั้งแรก)

1. ไปที่ https://console.firebase.google.com → **Add project**
2. **Build → Firestore Database → Create database** (เลือก production mode, region `asia-southeast1`)
3. แท็บ **Rules** → วางเนื้อหาจาก `firestore.rules` → **Publish**
4. **Build → Authentication → Get started → Sign-in method → Google → Enable**
5. **Authentication → Settings → Authorized domains → Add domain** ใส่ `<ชื่อผู้ใช้ GitHub>.github.io`
6. **Project settings (⚙) → Your apps → Web (`</>`)** สร้างแอป แล้วคัดลอก `firebaseConfig` มาใส่ใน `js/firebase-config.js`
7. เปิด `admin.html` → เข้าสู่ระบบ → กด **บันทึก** เพื่อเอาข้อมูลจากไฟล์ขึ้น Firestore

> ค่าใน `firebaseConfig` (รวม apiKey) เปิดเผยได้ ไม่ใช่รหัสลับ ข้อมูลปลอดภัยด้วย `firestore.rules`
> ถ้าเปลี่ยนอีเมลเจ้าของ ต้องแก้ทั้ง `ADMIN_EMAIL` ใน `js/firebase-config.js` และใน `firestore.rules`

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
- **ทางไฟล์:** แก้ `data/resume.json` แล้ว push (ใช้เมื่อยังไม่มีข้อมูลใน Firestore หรือกด "โหลดค่าจากไฟล์" ใน admin แล้วบันทึก)
