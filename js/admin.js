import { ADMIN_EMAIL } from "./config.js";
import { getClient, loadDefaultResume } from "./supabase.js";

const $ = (id) => document.getElementById(id);

function setStatus(id, text, kind = "") {
  $(id).className = `status ${kind}`;
  $(id).textContent = text;
}

async function main() {
  const sb = await getClient();
  if (!sb) {
    $("who").textContent = "ยังไม่ได้ตั้งค่า Supabase — ใส่ค่าใน js/config.js ก่อน (ดู README)";
    return;
  }

  $("login-email").value = ADMIN_EMAIL;
  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("login-email").value.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      setStatus("login-status", `อีเมลนี้ไม่มีสิทธิ์ ใช้ ${ADMIN_EMAIL}`, "err");
      return;
    }
    setStatus("login-status", "กำลังส่ง…");
    const redirect = location.href.split("#")[0].split("?")[0];
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
    if (error) setStatus("login-status", `ส่งไม่สำเร็จ: ${error.message}`, "err");
    else setStatus("login-status", "ส่งลิงก์แล้ว เปิดอีเมลแล้วกดลิงก์เพื่อเข้าสู่ระบบ", "ok");
  });

  $("logout").addEventListener("click", () => sb.auth.signOut());

  let shownFor = null;
  async function show(session) {
    const user = session?.user;
    $("logout").hidden = !user;
    $("login-section").hidden = !!user;
    if (!user) {
      shownFor = null;
      $("panel").hidden = true;
      $("who").textContent = "เข้าสู่ระบบด้วยลิงก์ที่ส่งไปทางอีเมลของเจ้าของเว็บ";
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      $("panel").hidden = true;
      $("who").textContent = `บัญชี ${user.email} ไม่มีสิทธิ์แก้ไข กรุณาออกจากระบบ`;
      return;
    }
    $("who").textContent = `เข้าสู่ระบบเป็น ${user.email}`;
    $("panel").hidden = false;
    if (shownFor === user.id) return;
    shownFor = user.id;
    await Promise.all([loadEditor(), loadMessages()]);
  }
  // callback ของ onAuthStateChanged ห้าม await การเรียก supabase ตรงๆ (จะค้าง) จึงเลื่อนไปทำทีหลัง
  sb.auth.onAuthStateChange((_event, session) => setTimeout(() => show(session), 0));

  async function loadEditor() {
    const { data, error } = await sb.from("site_content").select("data").eq("id", "resume").maybeSingle();
    if (error) {
      setStatus("save-status", `อ่านข้อมูลไม่ได้: ${error.message}`, "err");
      return;
    }
    $("editor").value = JSON.stringify(data?.data ?? (await loadDefaultResume()), null, 2);
    setStatus("save-status", data ? "" : "ยังไม่มีข้อมูลใน Supabase แสดงค่าจากไฟล์ กดบันทึกเพื่อเริ่มใช้งาน");
  }

  $("reset").addEventListener("click", async () => {
    $("editor").value = JSON.stringify(await loadDefaultResume(), null, 2);
    setStatus("save-status", "โหลดค่าจากไฟล์แล้ว ยังไม่ได้บันทึก");
  });

  $("save").addEventListener("click", async () => {
    let data;
    try {
      data = JSON.parse($("editor").value);
    } catch (err) {
      setStatus("save-status", `JSON ไม่ถูกต้อง: ${err.message}`, "err");
      return;
    }
    if (!data.name || !Array.isArray(data.projects)) {
      setStatus("save-status", "ต้องมีอย่างน้อย name และ projects (เป็นรายการ)", "err");
      return;
    }
    $("save").disabled = true;
    const { error } = await sb
      .from("site_content")
      .upsert({ id: "resume", data, updated_at: new Date().toISOString() });
    $("save").disabled = false;
    if (error) setStatus("save-status", `บันทึกไม่สำเร็จ: ${error.message}`, "err");
    else setStatus("save-status", "บันทึกแล้ว", "ok");
  });

  async function loadMessages() {
    const { data: rows, error } = await sb
      .from("messages")
      .select("id, name, contact, message, created_at")
      .order("created_at", { ascending: false });
    const list = $("msgs");
    list.replaceChildren();
    if (error) {
      $("msg-empty").hidden = false;
      $("msg-empty").textContent = `อ่านข้อความไม่ได้: ${error.message}`;
      return;
    }
    $("msg-empty").hidden = rows.length > 0;
    for (const m of rows) {
      const li = document.createElement("li");
      const meta = document.createElement("div");
      meta.className = "meta";
      const when = new Date(m.created_at).toLocaleString("th-TH");
      meta.textContent = [m.name, m.contact, when].filter(Boolean).join(" · ");
      const body = document.createElement("p");
      body.textContent = m.message;
      const del = document.createElement("button");
      del.className = "btn ghost";
      del.type = "button";
      del.textContent = "ลบ";
      del.addEventListener("click", async () => {
        if (del.dataset.armed !== "1") {
          del.dataset.armed = "1";
          del.textContent = "กดอีกครั้งเพื่อยืนยันการลบ";
          return;
        }
        const { error: delErr } = await sb.from("messages").delete().eq("id", m.id);
        if (delErr) {
          del.textContent = `ลบไม่สำเร็จ: ${delErr.message}`;
          return;
        }
        li.remove();
        $("msg-empty").hidden = list.children.length > 0;
      });
      li.append(meta, body, del);
      list.append(li);
    }
  }
}

main().catch((err) => {
  console.error(err);
  $("who").textContent = `เกิดข้อผิดพลาด: ${err.message}`;
});
