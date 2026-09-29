import { getFirebase, isConfigured, loadResume } from "./firebase.js";

// สร้าง element พร้อม class และข้อความ (ใช้ textContent เสมอ กันการแทรก HTML)
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null && text !== "") node.textContent = text;
  return node;
}

function secHead(title, label) {
  const head = el("div", "sec-head");
  head.append(el("h2", null, title), el("span", "label", label));
  return head;
}

function timeline(items = []) {
  const ul = el("ul", "timeline");
  for (const it of items) {
    const li = el("li");
    li.append(el("div", "when", it.period), el("h3", null, it.title), el("div", "org", it.org));
    if (it.detail) li.append(el("p", null, it.detail));
    ul.append(li);
  }
  return ul;
}

function grid(items = []) {
  const wrap = el("div", "skills");
  for (const it of items) {
    const d = el("div");
    d.append(el("h4", null, it.title), el("p", null, it.text));
    wrap.append(d);
  }
  return wrap;
}

function project(p) {
  const art = el("article", `project ${p.theme || ""}`);

  const top = el("div", "p-top");
  const left = el("div");
  left.append(el("span", "tag", p.tag), el("h3", null, p.title), el("p", null, p.summary));
  top.append(left);
  if (p.stats?.length) {
    const stats = el("div", "stats");
    stats.style.gridTemplateColumns = `repeat(${p.stats.length}, auto)`;
    for (const s of p.stats) {
      const d = el("div");
      d.append(el("b", null, s.value), el("small", null, s.label));
      stats.append(d);
    }
    top.append(stats);
  }
  art.append(top);

  if (p.stack?.length) {
    const chips = el("div", "chips");
    p.stack.forEach((t) => chips.append(el("span", null, t)));
    art.append(chips);
  }

  if (p.modules?.length) {
    const mods = el("div", "mods");
    for (const m of p.modules) {
      const d = el("div", "mod");
      d.append(el("h4", null, m.title), el("p", null, m.text));
      mods.append(d);
    }
    art.append(mods);
  }

  if (p.flow?.steps?.length) {
    const flow = el("div", "flow");
    const ol = el("ol");
    for (const s of p.flow.steps) {
      const li = el("li");
      li.append(el("b", null, s.title), el("span", null, s.text));
      ol.append(li);
    }
    flow.append(el("div", "label", p.flow.title), ol);
    art.append(flow);
  }

  if (p.highlights?.length) {
    const hl = el("div", "hl");
    const ul = el("ul");
    p.highlights.forEach((h) => ul.append(el("li", null, h)));
    hl.append(el("div", "label", "จุดเด่นทางเทคนิค"), ul);
    art.append(hl);
  }
  return art;
}

function render(d) {
  document.title = `${d.name} · Portfolio`;
  document.getElementById("name").textContent = d.name;
  document.getElementById("role").textContent = d.role;
  document.getElementById("intro").textContent = d.intro;

  const c = d.contact || {};
  const contact = document.getElementById("contact");
  contact.replaceChildren(el("div", "label", "ติดต่อ"));
  if (c.email) {
    const a = el("a", null, c.email);
    a.href = `mailto:${c.email}`;
    contact.append(a);
  }
  if (c.phone) {
    const a = el("a", null, c.phone);
    a.href = `tel:${c.phone.replace(/[^\d+]/g, "")}`;
    contact.append(a);
  }
  if (c.line) contact.append(el("span", null, `LINE: ${c.line}`));
  if (c.github) {
    const a = el("a", null, c.github.replace(/^https?:\/\//, ""));
    a.href = c.github;
    a.target = "_blank";
    a.rel = "noopener";
    contact.append(a);
  }
  if (c.location) contact.append(el("small", null, c.location));

  const cv = document.getElementById("cv");
  const exp = el("div");
  exp.append(secHead("ประวัติการทำงาน", "Experience"), timeline(d.experience));
  const edu = el("div");
  edu.append(secHead("การศึกษา", "Education"), timeline(d.education));
  cv.replaceChildren(exp, edu);

  document.getElementById("projects").replaceChildren(...(d.projects || []).map(project));
  document.getElementById("skills").replaceChildren(grid(d.skills));
  document.getElementById("looking").replaceChildren(grid(d.lookingFor));

  document.getElementById("loading").hidden = true;
  document.getElementById("content").hidden = false;
}

function setupContactForm() {
  const section = document.getElementById("message-section");
  if (!isConfigured) return;
  section.hidden = false;

  const form = document.getElementById("message-form");
  const status = document.getElementById("message-status");
  const button = form.querySelector("button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const $ = (id) => document.getElementById(id).value.trim();
    if ($("msg-website")) return; // ช่องดักบอท
    const name = $("msg-name");
    const email = $("msg-email");
    const message = $("msg-text");
    if (!name || !message) {
      status.className = "status err";
      status.textContent = "กรุณากรอกชื่อและข้อความ";
      return;
    }
    button.disabled = true;
    status.className = "status";
    status.textContent = "กำลังส่ง…";
    try {
      const { db, fs } = await getFirebase();
      await fs.addDoc(fs.collection(db, "messages"), {
        name,
        email,
        message,
        createdAt: fs.serverTimestamp(),
      });
      form.reset();
      status.className = "status ok";
      status.textContent = "ส่งข้อความแล้ว ขอบคุณค่ะ จะติดต่อกลับโดยเร็ว";
    } catch (err) {
      console.error(err);
      status.className = "status err";
      status.textContent = "ส่งไม่สำเร็จ ลองใหม่อีกครั้ง หรือติดต่อทางอีเมล/โทรศัพท์ด้านบน";
    } finally {
      button.disabled = false;
    }
  });
}

loadResume()
  .then(render)
  .catch((err) => {
    console.error(err);
    document.getElementById("loading").textContent =
      "โหลดข้อมูลไม่สำเร็จ ถ้าเปิดไฟล์ตรงจากเครื่อง ให้รันผ่าน local server (ดู README)";
  });
setupContactForm();
