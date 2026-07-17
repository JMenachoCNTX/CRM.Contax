// ============================================================
//  CRM de atención — versión SIN TERMINAL (GitHub Pages + Firebase)
//  Auth + Firestore desde el navegador. La IA (opcional) llama a
//  Gemini directamente. La IA solo asiste; tú siempre envías.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDocs, getDoc, onSnapshot, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- Verifica configuración ----
if (!window.APP_CONFIG || !window.APP_CONFIG.firebase || String(window.APP_CONFIG.firebase.apiKey).includes("PEGA_AQUI")) {
  document.body.innerHTML =
    '<div style="color:#fff;font-family:sans-serif;padding:40px;line-height:1.6">' +
    '⚠️ <b>Falta configurar Firebase.</b><br>Abre el archivo <b>config.js</b> y pega ahí los datos ' +
    'de tu proyecto de Firebase (la GUIA.md te dice cómo). Luego recarga esta página.</div>';
  throw new Error("config.js sin completar");
}

const app = initializeApp(window.APP_CONFIG.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Estado ----------
let ME = null, USERS = [], CONTACTS = [], CURRENT = null;
let unsubContacts = null, unsubNotes = null, QUICK = [];
const el = (id) => document.getElementById(id);

function toast(msg) {
  const t = el("toast"); t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, m => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// ============================================================
//  IA (opcional) — llamada directa a Gemini
// ============================================================
async function callGemini(system, user) {
  const key = (window.APP_CONFIG.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("La IA aún no está configurada. (Es opcional — mira la Fase 5 de la guía.)");
  const model = window.APP_CONFIG.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("La IA no respondió (código " + res.status + "). Revisa tu clave.");
  const data = await res.json();
  return (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "").trim();
}

// ============================================================
//  AUTENTICACIÓN
// ============================================================
let mode = "login";
el("toggleMode").onclick = () => {
  mode = mode === "login" ? "register" : "login";
  el("name").classList.toggle("hidden", mode === "login");
  el("loginBtn").textContent = mode === "login" ? "Entrar" : "Crear cuenta";
  el("toggleMode").textContent = mode === "login" ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta · Iniciar sesión";
  el("loginSub").textContent = mode === "login" ? "Inicia sesión con la cuenta de tu equipo" : "El primer registro será el administrador";
  el("loginMsg").textContent = "";
};

el("loginBtn").onclick = async () => {
  const email = el("email").value.trim(), pass = el("password").value, msg = el("loginMsg");
  msg.className = "msg"; msg.textContent = "";
  if (!email || !pass) { msg.className = "msg err"; msg.textContent = "Completa correo y contraseña."; return; }
  el("loginBtn").disabled = true;
  try {
    if (mode === "register") {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const name = el("name").value.trim();
      if (name) await updateProfile(cred.user, { displayName: name });
      // Crea su perfil como agente pendiente (el admin lo activa después)
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name || "", email, role: "agent", active: false, createdAt: serverTimestamp(),
      });
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  } catch (e) {
    msg.className = "msg err"; msg.textContent = traducirError(e.code || e.message);
  } finally { el("loginBtn").disabled = false; }
};

function traducirError(code) {
  const map = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/invalid-email": "Correo no válido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/operation-not-allowed": "Activa Correo/contraseña en Firebase → Authentication.",
  };
  return map[code] || ("Error: " + code);
}

el("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (unsubContacts) unsubContacts();
    el("login").classList.remove("hidden"); el("app").classList.add("hidden"); ME = null; return;
  }
  // Asegura que exista su perfil
  let meSnap = await getDoc(doc(db, "users", user.uid));
  if (!meSnap.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "", email: user.email || "", role: "agent", active: false, createdAt: serverTimestamp(),
    });
    meSnap = await getDoc(doc(db, "users", user.uid));
  }
  ME = { uid: user.uid, ...meSnap.data() };

  if (ME.active !== true) {
    el("loginMsg").className = "msg err";
    el("loginMsg").textContent = "Tu cuenta está registrada pero pendiente de activación por un administrador.";
    await signOut(auth); return;
  }

  el("login").classList.add("hidden"); el("app").classList.remove("hidden");
  el("myAvatar").textContent = (ME.name || ME.email || "?").slice(0, 1).toUpperCase();
  el("myAvatar").title = `${ME.name || ME.email} · ${ME.role}`;
  const isSup = ME.role === "admin" || ME.role === "supervisor";
  el("navReports").classList.toggle("hidden", !isSup);
  el("navTeam").classList.toggle("hidden", ME.role !== "admin");

  await loadUsers(); buildAssignSelectors(); subscribeContacts(); loadQuickReplies();
});

// ============================================================
//  USUARIOS
// ============================================================
async function loadUsers() {
  USERS = [];
  try { (await getDocs(collection(db, "users"))).forEach(d => USERS.push({ uid: d.id, ...d.data() })); }
  catch (e) { USERS = [ME]; }
}
function userName(uid) { const u = USERS.find(x => x.uid === uid); return u ? (u.name || u.email) : "—"; }
function buildAssignSelectors() {
  const opts = ['<option value="">Sin asignar</option>']
    .concat(USERS.filter(u => u.active).map(u => `<option value="${u.uid}">${escapeHtml(u.name || u.email)}</option>`)).join("");
  el("dAssign").innerHTML = opts;
  const extra = USERS.filter(u => u.active).map(u => `<option value="${u.uid}">${escapeHtml(u.name || u.email)}</option>`).join("");
  el("filterAssign").innerHTML = '<option value="">Todos los agentes</option><option value="__me">Asignados a mí</option><option value="__none">Sin asignar</option>' + extra;
}

// ============================================================
//  CONTACTOS
// ============================================================
function subscribeContacts() {
  if (unsubContacts) unsubContacts();
  const isSup = ME.role === "admin" || ME.role === "supervisor";
  const q = isSup
    ? query(collection(db, "contacts"), orderBy("updatedAt", "desc"))
    : query(collection(db, "contacts"), where("assignedTo", "==", ME.uid), orderBy("updatedAt", "desc"));
  unsubContacts = onSnapshot(q, (snap) => {
    CONTACTS = []; snap.forEach(d => CONTACTS.push({ id: d.id, ...d.data() }));
    if (!isSup) mergeUnassigned();
    renderContacts();
  }, (err) => toast("Error cargando contactos: " + err.message));
}
async function mergeUnassigned() {
  try {
    const snap = await getDocs(query(collection(db, "contacts"), where("assignedTo", "==", null)));
    snap.forEach(d => { if (!CONTACTS.find(c => c.id === d.id)) CONTACTS.push({ id: d.id, ...d.data() }); });
    renderContacts();
  } catch (e) {}
}
function renderContacts() {
  const term = el("search").value.trim().toLowerCase(), fs = el("filterStatus").value, fa = el("filterAssign").value;
  const list = el("contactList");
  const filtered = CONTACTS.filter(c => {
    if (term && !(`${c.name || ""} ${c.phone || ""}`.toLowerCase().includes(term))) return false;
    if (fs && c.status !== fs) return false;
    if (fa === "__me" && c.assignedTo !== ME.uid) return false;
    if (fa === "__none" && c.assignedTo) return false;
    if (fa && fa !== "__me" && fa !== "__none" && c.assignedTo !== fa) return false;
    return true;
  });
  if (!filtered.length) { list.innerHTML = '<div style="padding:24px;color:var(--muted);font-size:13px;text-align:center">Sin contactos. Usa ＋ para agregar.</div>'; return; }
  list.innerHTML = filtered.map(c => {
    const st = c.status || "nuevo";
    const stLabel = { nuevo: "Nuevo", proceso: "En proceso", cerrado: "Cerrado" }[st] || st;
    const tags = (c.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("");
    const assign = c.assignedTo ? `<span class="badge assign">${escapeHtml(userName(c.assignedTo))}</span>` : "";
    return `<div class="item ${CURRENT && CURRENT.id === c.id ? "sel" : ""}" data-id="${c.id}">
      <div class="row1"><span class="name">${escapeHtml(c.name || "Sin nombre")}</span>
      <span class="badge status-${st}">${stLabel}</span></div>
      <div class="phone">${escapeHtml(c.phone || "")}</div>
      <div class="badges">${assign}${tags}</div></div>`;
  }).join("");
  list.querySelectorAll(".item").forEach(it => it.onclick = () => selectContact(it.dataset.id));
}
["search", "filterStatus", "filterAssign"].forEach(id => el(id).oninput = renderContacts);

el("newContact").onclick = () => {
  showModal("Nuevo contacto", `
    <input id="m_name" placeholder="Nombre del contacto" />
    <input id="m_phone" placeholder="Teléfono con código país (ej. 59170000000)" />
    <input id="m_tags" placeholder="Etiquetas separadas por coma (ej. venta, urgente)" />
    <select id="m_status"><option value="nuevo">Nuevo</option><option value="proceso">En proceso</option><option value="cerrado">Cerrado</option></select>
  `, async () => {
    const name = el("m_name").value.trim(), phone = el("m_phone").value.replace(/[^0-9]/g, "");
    if (!name && !phone) { toast("Pon al menos nombre o teléfono"); return false; }
    const tags = el("m_tags").value.split(",").map(t => t.trim()).filter(Boolean);
    await addDoc(collection(db, "contacts"), {
      name, phone, tags, status: el("m_status").value,
      assignedTo: ME.role === "agent" ? ME.uid : null,
      createdBy: ME.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    toast("Contacto agregado"); return true;
  });
};

function selectContact(id) {
  CURRENT = CONTACTS.find(c => c.id === id); if (!CURRENT) return;
  renderContacts();
  el("detailEmpty").classList.add("hidden"); el("detailContent").classList.remove("hidden");
  el("dName").textContent = CURRENT.name || "Sin nombre";
  el("dSub").textContent = (CURRENT.phone || "sin teléfono") + " · creado por " + userName(CURRENT.createdBy);
  el("dStatus").value = CURRENT.status || "nuevo";
  el("dAssign").value = CURRENT.assignedTo || "";
  const phone = (CURRENT.phone || "").replace(/[^0-9]/g, ""), wa = el("dWhats");
  if (phone) { wa.href = `https://wa.me/${phone}`; wa.style.display = "inline-flex"; } else wa.style.display = "none";
  el("aiInput").value = "";
  el("aiOutput").textContent = "Aquí aparecerá la ayuda de la IA. Tú revisas y envías manualmente.";
  subscribeNotes(id);
}
el("dStatus").onchange = async () => {
  await updateDoc(doc(db, "contacts", CURRENT.id), { status: el("dStatus").value, updatedAt: serverTimestamp() });
  await logActivity("status_change", { contact: CURRENT.id, to: el("dStatus").value }); toast("Estado actualizado");
};
el("dAssign").onchange = async () => {
  const to = el("dAssign").value || null;
  await updateDoc(doc(db, "contacts", CURRENT.id), { assignedTo: to, updatedAt: serverTimestamp() });
  await logActivity("assign", { contact: CURRENT.id, to }); toast(to ? "Asignado a " + userName(to) : "Sin asignar");
};

// ---------- NOTAS ----------
function subscribeNotes(contactId) {
  if (unsubNotes) unsubNotes();
  const q = query(collection(db, "contacts", contactId, "notes"), orderBy("createdAt", "desc"));
  unsubNotes = onSnapshot(q, (snap) => {
    const box = el("notesList");
    if (snap.empty) { box.innerHTML = '<div style="color:var(--muted);font-size:12px">Sin notas todavía.</div>'; return; }
    let html = "";
    snap.forEach(d => {
      const n = d.data(), when = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString("es") : "";
      html += `<div class="note">${escapeHtml(n.text)}<div class="meta">— ${escapeHtml(n.authorName || "")} · ${when}</div></div>`;
    });
    box.innerHTML = html;
  });
}
el("addNote").onclick = async () => {
  const text = el("noteInput").value.trim(); if (!text || !CURRENT) return;
  await addDoc(collection(db, "contacts", CURRENT.id, "notes"), {
    text, authorId: ME.uid, authorName: ME.name || ME.email, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "contacts", CURRENT.id), { updatedAt: serverTimestamp() });
  await logActivity("note", { contact: CURRENT.id }); el("noteInput").value = "";
};

// ---------- IA (botones) ----------
document.querySelectorAll(".ai-tools button").forEach(btn => {
  btn.onclick = async () => {
    const action = btn.dataset.ai, text = el("aiInput").value.trim();
    if (!text) { toast("Escribe o pega un texto primero"); return; }
    const out = el("aiOutput"); out.innerHTML = '<span class="spin"></span> Pensando…';
    try {
      const { system, user } = buildPrompt(action, text);
      const result = await callGemini(system, user);
      out.textContent = result || "(sin respuesta)";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy"; copyBtn.textContent = "📋 Copiar";
      copyBtn.onclick = () => { navigator.clipboard.writeText(result); toast("Copiado. Pégalo en WhatsApp y envíalo tú."); };
      out.appendChild(document.createElement("br")); out.appendChild(copyBtn);
      await logActivity("ai_assist", { action });
    } catch (e) { out.textContent = "⚠️ " + e.message; }
  };
});
function buildPrompt(action, text) {
  const tone = el("aiTone").value, lang = el("aiLang").value;
  const ctx = CURRENT ? `${CURRENT.name || ""} · estado ${CURRENT.status || ""}` : "";
  switch (action) {
    case "improve": return {
      system: "Eres un asistente de redacción para atención al cliente por WhatsApp. Mejora el mensaje del agente: corrige ortografía y gramática, hazlo claro, cordial y profesional, SIN cambiar la intención ni inventar datos. Usa un tono " + tone + ". Responde SOLO con el mensaje mejorado.",
      user: `Mensaje del agente:\n"""${text}"""` };
    case "suggest": return {
      system: "Eres un asistente para un agente de atención por WhatsApp. A partir del mensaje del cliente, propón 3 respuestas breves y profesionales que el AGENTE podría enviar (él decide y envía). Numéralas 1, 2, 3. No inventes datos.",
      user: (ctx ? `Contexto: ${ctx}\n\n` : "") + `Mensaje del cliente:\n"""${text}"""` };
    case "summarize": return {
      system: "Resume esta conversación de atención en 3-5 puntos: qué necesita el cliente, estado del caso y próximo paso pendiente. Sé conciso.",
      user: `Conversación:\n"""${text}"""` };
    case "classify": return {
      system: 'Clasifica el mensaje del cliente. Devuelve SOLO texto legible: Categoría (consulta/venta/reclamo/soporte/otro), Urgencia (baja/media/alta), Sentimiento (positivo/neutral/negativo) y un resumen de una línea.',
      user: `Mensaje:\n"""${text}"""` };
    case "translate": return {
      system: `Traduce el mensaje al ${lang} con tono profesional y cordial. Responde solo con la traducción.`,
      user: text };
    default: return { system: "", user: text };
  }
}

// ---------- RESPUESTAS RÁPIDAS ----------
async function loadQuickReplies() {
  try { QUICK = []; (await getDocs(collection(db, "quickReplies"))).forEach(d => QUICK.push({ id: d.id, ...d.data() })); }
  catch (e) { QUICK = []; }
  renderQuickChips();
}
function renderQuickChips() {
  const box = el("quickList");
  if (!QUICK.length) { box.innerHTML = '<span style="color:var(--muted);font-size:12px">Sin respuestas rápidas. Créalas en la sección ⚡.</span>'; return; }
  box.innerHTML = QUICK.map(q => `<button class="quick" data-t="${escapeHtml(q.text)}" title="${escapeHtml(q.title)}">${escapeHtml(q.title)}</button>`).join("");
  box.querySelectorAll(".quick").forEach(b => b.onclick = () => {
    navigator.clipboard.writeText(b.dataset.t); el("aiInput").value = b.dataset.t;
    toast("Copiado al portapapeles y al editor de IA");
  });
}

// ---------- ACTIVIDAD ----------
async function logActivity(action, extra = {}) {
  try { await addDoc(collection(db, "activity"), { userId: ME.uid, userName: ME.name || ME.email, type: action, ...extra, createdAt: serverTimestamp() }); }
  catch (e) {}
}

// ============================================================
//  VISTAS
// ============================================================
document.querySelectorAll(".rail button[data-view]").forEach(b => b.onclick = () => switchView(b.dataset.view, b));
function switchView(view, btn) {
  document.querySelectorAll(".rail button[data-view]").forEach(x => x.classList.remove("active"));
  if (btn) btn.classList.add("active");
  el("view-chats").style.display = view === "chats" ? "contents" : "none";
  ["reports", "team", "quick"].forEach(v => el("view-" + v).classList.add("hidden"));
  if (view === "reports") { el("view-reports").classList.remove("hidden"); renderReports(); }
  if (view === "team") { el("view-team").classList.remove("hidden"); renderTeam(); }
  if (view === "quick") { el("view-quick").classList.remove("hidden"); renderQuickAdmin(); }
}

async function renderReports() {
  const v = el("view-reports"); v.innerHTML = '<h1>Reportes de desempeño</h1><p class="lead">Cargando…</p>';
  let contacts = [], activity = [];
  try { (await getDocs(collection(db, "contacts"))).forEach(d => contacts.push(d.data())); } catch (e) {}
  try { (await getDocs(collection(db, "activity"))).forEach(d => activity.push(d.data())); } catch (e) {}
  const total = contacts.length;
  const nuevos = contacts.filter(c => (c.status || "nuevo") === "nuevo").length;
  const proceso = contacts.filter(c => c.status === "proceso").length;
  const cerrados = contacts.filter(c => c.status === "cerrado").length;
  const byAgent = {};
  USERS.forEach(u => byAgent[u.uid] = { name: u.name || u.email, role: u.role, asignados: 0, cerrados: 0, notas: 0, ia: 0 });
  contacts.forEach(c => { if (c.assignedTo && byAgent[c.assignedTo]) { byAgent[c.assignedTo].asignados++; if (c.status === "cerrado") byAgent[c.assignedTo].cerrados++; } });
  activity.forEach(a => { if (!byAgent[a.userId]) return; if (a.type === "note") byAgent[a.userId].notas++; if (a.type === "ai_assist") byAgent[a.userId].ia++; });
  const rows = Object.values(byAgent).map(a => `<tr><td>${escapeHtml(a.name)}</td><td><span class="pill ${a.role}">${a.role}</span></td><td>${a.asignados}</td><td>${a.cerrados}</td><td>${a.notas}</td><td>${a.ia}</td></tr>`).join("");
  v.innerHTML = `<h1>Reportes de desempeño</h1><p class="lead">Resumen del equipo y actividad por agente.</p>
    <div class="kpi-grid">
      <div class="kpi"><div class="n">${total}</div><div class="l">Contactos totales</div></div>
      <div class="kpi"><div class="n" style="color:var(--green)">${nuevos}</div><div class="l">Nuevos</div></div>
      <div class="kpi"><div class="n" style="color:var(--warn)">${proceso}</div><div class="l">En proceso</div></div>
      <div class="kpi"><div class="n" style="color:var(--muted)">${cerrados}</div><div class="l">Cerrados</div></div>
    </div>
    <table><thead><tr><th>Agente</th><th>Rol</th><th>Asignados</th><th>Cerrados</th><th>Notas</th><th>Usos IA</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="color:var(--muted)">Sin datos aún.</td></tr>'}</tbody></table>`;
}

async function renderTeam() {
  const v = el("view-team"); await loadUsers(); buildAssignSelectors();
  const rows = USERS.map(u => `<tr>
    <td>${escapeHtml(u.name || "—")}<div style="color:var(--muted);font-size:12px">${escapeHtml(u.email || "")}</div></td>
    <td><select class="role-sel" data-uid="${u.uid}" ${u.uid === ME.uid ? "disabled" : ""}>
      <option value="agent" ${u.role === "agent" ? "selected" : ""}>Agente</option>
      <option value="supervisor" ${u.role === "supervisor" ? "selected" : ""}>Supervisor</option>
      <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option></select></td>
    <td>${u.active ? '<span class="pill agent">Activo</span>' : `<button class="mini-btn" data-activate="${u.uid}">Activar</button>`}</td>
    <td>${u.uid === ME.uid ? "" : `<button class="mini-btn" data-toggle="${u.uid}" data-state="${u.active}">${u.active ? "Desactivar" : "—"}</button>`}</td></tr>`).join("");
  v.innerHTML = `<h1>Equipo</h1><p class="lead">Activa cuentas nuevas y asigna roles. El primer usuario es administrador.</p>
    <table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  v.querySelectorAll(".role-sel").forEach(s => s.onchange = async () => { await updateDoc(doc(db, "users", s.dataset.uid), { role: s.value }); toast("Rol actualizado"); renderTeam(); });
  v.querySelectorAll("[data-activate]").forEach(b => b.onclick = async () => { await updateDoc(doc(db, "users", b.dataset.activate), { active: true }); toast("Usuario activado"); renderTeam(); });
  v.querySelectorAll("[data-toggle]").forEach(b => b.onclick = async () => { const ns = b.dataset.state !== "true"; await updateDoc(doc(db, "users", b.dataset.toggle), { active: ns }); toast(ns ? "Activado" : "Desactivado"); renderTeam(); });
}

async function renderQuickAdmin() {
  const v = el("view-quick"); await loadQuickReplies();
  const rows = QUICK.map(q => `<tr><td><b>${escapeHtml(q.title)}</b></td><td style="color:var(--muted)">${escapeHtml(q.text)}</td><td><button class="mini-btn" data-del="${q.id}">Borrar</button></td></tr>`).join("");
  v.innerHTML = `<h1>Respuestas rápidas</h1><p class="lead">Plantillas compartidas del equipo. Se copian con un clic; tú las envías.</p>
    <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">
      <input id="q_title" placeholder="Título (ej. Saludo)" style="padding:10px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt)">
      <input id="q_text" placeholder="Texto de la respuesta" style="flex:1;min-width:200px;padding:10px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt)">
      <button id="q_add" class="mini-btn" style="background:var(--accent);color:#04231c;font-weight:600;padding:10px 16px">Agregar</button></div>
    <table><thead><tr><th>Título</th><th>Texto</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="color:var(--muted)">Sin respuestas rápidas.</td></tr>'}</tbody></table>`;
  el("q_add").onclick = async () => {
    const title = el("q_title").value.trim(), text = el("q_text").value.trim();
    if (!title || !text) { toast("Completa título y texto"); return; }
    await addDoc(collection(db, "quickReplies"), { title, text, createdBy: ME.uid, createdAt: serverTimestamp() });
    toast("Creada"); renderQuickAdmin(); renderQuickChips();
  };
  v.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { await deleteDoc(doc(db, "quickReplies", b.dataset.del)); toast("Borrada"); renderQuickAdmin(); });
}

// ---------- MODAL ----------
function showModal(title, bodyHtml, onOk) {
  const bg = document.createElement("div"); bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal"><h3>${escapeHtml(title)}</h3>${bodyHtml}
    <div class="actions"><button class="cancel">Cancelar</button><button class="ok">Guardar</button></div></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.querySelector(".cancel").onclick = close;
  bg.onclick = (e) => { if (e.target === bg) close(); };
  bg.querySelector(".ok").onclick = async () => { const ok = await onOk(); if (ok !== false) close(); };
}
