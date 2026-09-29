// ค่าตั้งค่า Firebase ของเว็บ — คัดลอกจาก Firebase Console > Project settings > Your apps > Web app
// ค่าเหล่านี้เปิดเผยได้ (ไม่ใช่รหัสลับ) ความปลอดภัยของข้อมูลคุมด้วย firestore.rules
// ถ้ายังเป็น YOUR_... อยู่ เว็บจะอ่านข้อมูลจาก data/resume.json แทน และซ่อนฟอร์มติดต่อ
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// อีเมลบัญชี Google ที่มีสิทธิ์เข้าหน้า admin (ต้องตรงกับใน firestore.rules)
export const ADMIN_EMAIL = "kannigal.la@gmail.com";
