import { ADMIN_EMAIL } from "./firebase-config.js";
import { getAuth, getFirebase, loadDefaultResume } from "./firebase.js";

const $ = (id) => document.getElementById(id);

function setStatus(text, kind = "") {
  $("save-status").className = `status ${kind}`;
  $("save-status").textContent = text;
}

async function main() {
  const fb = await getFirebase();
  if (!fb) {
    $("who").textContent = "ยังไม่ได้ตั้งค่า Firebase — ใส่ค่าใน js/firebase-config.js ก่อน (ดู README)";
    return;
  }
  const { db, fs } = fb;
  const { auth, mod } = await getAuth(fb.app);

  $("login").addEventListener("click", () =>
    mod.signInWithPopup(auth, new mod.GoogleAuthProvider()).catch((err) => {
      $("who").textContent = `เข้าสู่ระบบไม่สำเร็จ: ${err.code || err.message}`;
    })
  );
  $("logout").addEventListener("click", () => mod.signOut(auth));

  mod.onAuthStateChanged(auth, async (user) => {
    $("login").hidden = !!user;
    $("logout").hidden = !user;
    $("panel").hidden = true;
    if (!user) {
      $("who").textContent = "เข้าสู่ระบบด้วยบัญชี Google ของเจ้าของเว็บ";
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      $("who").textContent = `บัญชี ${user.email} ไม่มีสิทธิ์แก้ไข กรุณาออกจากระบบแล้วใช้บัญชี ${ADMIN_EMAIL}`;
      return;
    }
    $("who").textContent = `เข้าสู่ระบบเป็น ${user.email}`;
    $("panel").hidden = false;
    await Promise.all([loadEditor(), loadMessages()]);
  });

  const resumeRef = fs.doc(db, "site", "resume");

  async function loadEditor() {
    const snap = await fs.getDoc(resumeRef);
    const data = snap.exists() ? snap.data() : await loadDefaultResume();
    $("editor").value = JSON.stringify(data, null, 2);
    setStatus(snap.exists() ? "" : "ยังไม่มีข้อมูลใน Firestore แสดงค่าจากไฟล์ กดบันทึกเพื่อเริ่มใช้งาน");
  }

  $("reset").addEventListener("click", async () => {
    $("editor").value = JSON.stringify(await loadDefaultResume(), null, 2);
    setStatus("โหลดค่าจากไฟล์แล้ว ยังไม่ได้บันทึก");
  });

  $("save").addEventListener("click", async () => {
    let data;
    try {
      data = JSON.parse($("editor").value);
    } catch (err) {
      setStatus(`JSON ไม่ถูกต้อง: ${err.message}`, "err");
      return;
    }
    if (!data.name || !Array.isArray(data.projects)) {
      setStatus("ต้องมีอย่างน้อย name และ projects (เป็นรายการ)", "err");
      return;
    }
    $("save").disabled = true;
    try {
      await fs.setDoc(resumeRef, data);
      setStatus("บันทึกแล้ว", "ok");
    } catch (err) {
      setStatus(`บันทึกไม่สำเร็จ: ${err.code || err.message}`, "err");
    } finally {
      $("save").disabled = false;
    }
  });

  async function loadMessages() {
    const q = fs.query(fs.collection(db, "messages"), fs.orderBy("createdAt", "desc"));
    const snap = await fs.getDocs(q);
    const list = $("msgs");
    list.replaceChildren();
    $("msg-empty").hidden = !snap.empty;
    snap.forEach((docSnap) => {
      const m = docSnap.data();
      const li = document.createElement("li");
      const meta = document.createElement("div");
      meta.className = "meta";
      const when = m.createdAt?.toDate?.().toLocaleString("th-TH") ?? "";
      meta.textContent = [m.name, m.email, when].filter(Boolean).join(" · ");
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
        await fs.deleteDoc(docSnap.ref);
        li.remove();
        $("msg-empty").hidden = list.children.length > 0;
      });
      li.append(meta, body, del);
      list.append(li);
    });
  }
}

main().catch((err) => {
  console.error(err);
  $("who").textContent = `เกิดข้อผิดพลาด: ${err.message}`;
});
