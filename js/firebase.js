import { firebaseConfig } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

export const isConfigured = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_")
);

let cached = null;

// โหลด Firebase เฉพาะเมื่อตั้งค่าแล้ว คืนค่า null ถ้ายังไม่ได้ตั้งค่า
export async function getFirebase() {
  if (!isConfigured) return null;
  if (cached) return cached;
  const [{ initializeApp }, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  cached = { app, db: fs.getFirestore(app), fs };
  return cached;
}

export async function getAuth(app) {
  const mod = await import(`${SDK}/firebase-auth.js`);
  return { auth: mod.getAuth(app), mod };
}

// อ่านเรซูเม่จาก Firestore (site/resume) ถ้าไม่มีหรือผิดพลาด ใช้ไฟล์ data/resume.json
export async function loadResume() {
  try {
    const fb = await getFirebase();
    if (fb) {
      const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "site", "resume"));
      if (snap.exists()) return snap.data();
    }
  } catch (err) {
    console.warn("อ่านข้อมูลจาก Firestore ไม่ได้ ใช้ไฟล์ในเครื่องแทน", err);
  }
  return loadDefaultResume();
}

export async function loadDefaultResume() {
  const res = await fetch("data/resume.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`โหลด data/resume.json ไม่ได้ (${res.status})`);
  return res.json();
}
