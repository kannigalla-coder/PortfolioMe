import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config.js";

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client = null;

// โหลด supabase-js เฉพาะเมื่อตั้งค่าแล้ว คืนค่า null ถ้ายังไม่ได้ตั้งค่า
export async function getClient() {
  if (!isConfigured) return null;
  if (!client) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

// อ่านเรซูเม่จากตาราง site_content (id = 'resume') ถ้าไม่มีหรือผิดพลาด ใช้ไฟล์ data/resume.json
export async function loadResume() {
  try {
    const sb = await getClient();
    if (sb) {
      const { data, error } = await sb.from("site_content").select("data").eq("id", "resume").maybeSingle();
      if (error) throw error;
      if (data?.data) return data.data;
    }
  } catch (err) {
    console.warn("อ่านข้อมูลจาก Supabase ไม่ได้ ใช้ไฟล์ในเครื่องแทน", err);
  }
  return loadDefaultResume();
}

export async function loadDefaultResume() {
  const res = await fetch("data/resume.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`โหลด data/resume.json ไม่ได้ (${res.status})`);
  return res.json();
}
