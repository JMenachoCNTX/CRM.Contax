// ============================================================
//  CONTAX CRM — Panel de administración (web)
//  Presencia · Reportes · Crear usuarios (correo+PIN) · Clave de IA
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

if (!window.APP_CONFIG || !window.APP_CONFIG.firebase) {
  document.body.innerHTML = '<div style="color:#fff;font-family:sans-serif;padding:40px">⚠️ Falta config.js con los datos de Firebase.</div>';
  throw new Error("config.js");
}
const app = initializeApp(window.APP_CONFIG.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
// App secundaria para crear usuarios sin cerrar la sesión del admin
const app2 = initializeApp(window.APP_CONFIG.firebase, "secondary");
const auth2 = getAuth(app2);

const el = (id) => document.getElementById(id);
let ME = null, USERS = [], CHATS = [];

// ---------- Tema ----------
if (localStorage.getItem("cx-theme") === "light") { document.documentElement.classList.add("light"); }
function initTheme() { const b = el("themeBtn"); if (!b) return; b.textContent = document.documentElement.classList.contains("light") ? "☀️" : "🌙"; b.onclick = () => { const light = !document.documentElement.classList.contains("light"); document.documentElement.classList.toggle("light", light); localStorage.setItem("cx-theme", light ? "light" : "dark"); b.textContent = light ? "☀️" : "🌙"; }; }

// ---------- Login ----------
el("loginBtn").onclick = async () => {
  const email = el("email").value.trim(), pass = el("password").value, msg = el("loginMsg");
  msg.className = "msg"; msg.textContent = "";
  if (!email || !pass) { msg.className = "msg err"; msg.textContent = "Completa correo y contraseña."; return; }
  el("loginBtn").disabled = true;
  try { await signInWithEmailAndPassword(auth, email, pass); }
  catch (e) { msg.className = "msg err"; msg.textContent = traducir(e.code); }
  finally { el("loginBtn").disabled = false; }
};
function traducir(c) { return ({ "auth/invalid-credential": "Correo o contraseña incorrectos.", "auth/user-not-found": "No existe esa cuenta.", "auth/wrong-password": "Contraseña incorrecta.", "auth/invalid-email": "Correo no válido." })[c] || ("Error: " + c); }
el("logoutBtn").onclick = () => signOut(auth);
el("agentLogout").onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (!user) { el("login").classList.remove("hidden"); el("app").classList.add("hidden"); el("agentOnly").classList.add("hidden"); return; }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) { el("loginMsg").className = "msg err"; el("loginMsg").textContent = "Sin perfil."; await signOut(auth); return; }
  ME = { uid: user.uid, ...snap.data() };
  const isAdmin = ME.role === "admin" || ME.role === "supervisor";
  el("login").classList.add("hidden");
  if (!isAdmin || ME.active !== true) { el("agentOnly").classList.remove("hidden"); el("app").classList.add("hidden"); return; }
  el("agentOnly").classList.add("hidden"); el("app").classList.remove("hidden");
  el("who").textContent = `${ME.name || ME.email} · ${ME.role}`;
  initTheme();
  document.querySelectorAll('nav.tabs button').forEach(b => b.onclick = () => switchView(b.dataset.v, b));
  await loadAll(); renderPresence();
});

async function loadAll() {
  USERS = []; CHATS = [];
  try { (await getDocs(collection(db, "users"))).forEach(d => USERS.push({ uid: d.id, ...d.data() })); } catch (e) {}
  try { (await getDocs(collection(db, "waChats"))).forEach(d => CHATS.push(d.data())); } catch (e) {}
}

function switchView(v, btn) {
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  el("v-" + v).classList.add("active");
  if (v === "presence") renderPresence();
  if (v === "historial") renderHistorial();
  if (v === "bandeja") renderBandeja();
  if (v === "respuestas") renderRespuestas();
  if (v === "reports") renderReports();
  if (v === "users") renderUsers();
  if (v === "config") renderConfig();
}

// ---------- Respuestas rápidas (CRUD + Google Sheets) ----------
let QR = [], qrEditId = null, qrFilter = "", qrCatFilter = "";
function catHue(s) { s = String(s || "General"); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
function catChip(cat) { const h = catHue(cat); return `<span style="background:hsl(${h},60%,90%);color:hsl(${h},70%,30%);padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">${escape(cat || "General")}</span>`; }
async function loadConfigDoc() { try { const s = await getDoc(doc(db, "config", "app")); return s.exists() ? s.data() : {}; } catch (e) { return {}; } }
async function sheetPush(action, item) {
  const cfg = await loadConfigDoc(); const url = (cfg.sheetUrl || "").trim(); if (!url) return;
  const payload = { action, item: { categoria: item.category || "", nombre: item.title || "", nro: item.nro || "", titulo: item.description || "", respuesta: item.text || "" } };
  try { await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }); } catch (e) {}
}
async function renderRespuestas() {
  const snap = await getDocs(collection(db, "quickReplies"));
  QR = []; snap.forEach(d => QR.push({ id: d.id, ...d.data() }));
  QR.sort((a, b) => (a.category || "General").localeCompare(b.category || "General") || (Number(a.nro) || 9999) - (Number(b.nro) || 9999) || (a.title || "").localeCompare(b.title || ""));
  const cats = [...new Set(QR.map(q => q.category || "General"))];
  const term = qrFilter.toLowerCase();
  const list = QR.filter(q => {
    if (qrCatFilter && (q.category || "General") !== qrCatFilter) return false;
    if (term && !`${q.title} ${q.text} ${q.category || ""} ${q.description || ""}`.toLowerCase().includes(term)) return false;
    return true;
  });
  const chips = `<span class="chip ${qrCatFilter === "" ? "on" : ""}" data-c="" style="cursor:pointer;padding:5px 12px;border-radius:20px;font-size:12px;border:1px solid var(--line);${qrCatFilter === "" ? "background:var(--accent);color:#04231c;font-weight:600" : "color:var(--muted)"}">Todas</span>` +
    cats.map(c => { const h = catHue(c); const on = qrCatFilter === c; return `<span class="chip" data-c="${escape(c)}" style="cursor:pointer;padding:5px 12px;border-radius:20px;font-size:12px;border:1px solid hsl(${h},50%,60%);background:${on ? `hsl(${h},60%,45%)` : `hsl(${h},60%,92%)`};color:${on ? "#fff" : `hsl(${h},70%,28%)`};font-weight:600">${escape(c)}</span>`; }).join("");
  const rows = list.map(q => {
    const h = catHue(q.category || "General");
    return `<tr style="border-left:4px solid hsl(${h},60%,50%)">
    <td>${escape(q.nro || "")}</td>
    <td>${catChip(q.category)}</td>
    <td><b>${escape(q.title || "")}</b>${q.description ? `<div style="color:var(--muted);font-size:12px">${escape(q.description)}</div>` : ""}</td>
    <td style="color:var(--muted)">${escape((q.text || "").slice(0, 60))}${(q.text || "").length > 60 ? "…" : ""}</td>
    <td style="white-space:nowrap"><button class="mini" data-edit="${q.id}">Editar</button> <button class="mini" data-del="${q.id}">Borrar</button></td></tr>`;
  }).join("");
  el("v-respuestas").innerHTML = `<h1>Respuestas rápidas</h1><p class="lead">Créalas y edítalas aquí; se comparten con todo el equipo (y con el Google Sheet, si está conectado).</p>
    <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <input id="qr_search" class="mini" style="padding:8px;min-width:220px" placeholder="🔎 Buscar por nombre o texto…" value="${escape(qrFilter)}">
      <button class="btn" id="qr_new">＋ Nueva respuesta</button>
      <button class="btn sec" id="qr_import" style="border:1px solid var(--line)">⬇️ Importar de Google Sheets</button>
      <span class="msg" id="qr_msg" style="align-self:center"></span>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${chips}</div>
    <p class="note" style="margin:-6px 0 12px">Los filtros son solo para tu vista; no modifican el Google Sheet.</p>
    <table><thead><tr><th>Nro</th><th>Categoría</th><th>Nombre</th><th>Respuesta</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="color:var(--muted)">Sin respuestas con estos filtros.</td></tr>'}</tbody></table>`;
  el("qr_search").oninput = () => { qrFilter = el("qr_search").value; renderRespuestas(); };
  el("v-respuestas").querySelectorAll(".chip").forEach(c => c.onclick = () => { qrCatFilter = c.dataset.c; renderRespuestas(); });
  el("qr_new").onclick = () => openQrModal(null);
  el("qr_import").onclick = importFromSheet;
  el("v-respuestas").querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openQrModal(QR.find(x => x.id === b.dataset.edit)));
  el("v-respuestas").querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
    const q = QR.find(x => x.id === b.dataset.del); if (!q) return;
    await deleteDoc(doc(db, "quickReplies", q.id)); await sheetPush("delete", q); renderRespuestas();
  });
}
function openQrModal(q) {
  qrEditId = q ? q.id : null;
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px;width:640px;max-width:96vw;max-height:92vh;overflow-y:auto">
    <h3 style="margin:0 0 16px">${q ? "Editar" : "Nueva"} respuesta</h3>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:100px"><label>Nro</label><input id="f_nro" value="${escape(q ? q.nro || "" : "")}"></div>
      <div style="flex:2;min-width:160px"><label>Categoría</label><input id="f_cat" value="${escape(q ? q.category || "" : "")}" placeholder="Ventas" list="f_catlist"><datalist id="f_catlist">${[...new Set(QR.map(x => x.category || "General"))].map(c => `<option value="${escape(c)}">`).join("")}</datalist></div>
    </div>
    <label>Nombre de la respuesta</label><input id="f_title" value="${escape(q ? q.title || "" : "")}" placeholder="Saludo">
    <label>Descripción breve</label><input id="f_desc" value="${escape(q ? q.description || "" : "")}" placeholder="De qué trata">
    <label>Respuesta</label><textarea id="f_text" style="min-height:220px;font-size:14px;line-height:1.5">${escape(q ? q.text || "" : "")}</textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn sec" id="f_cancel" style="border:1px solid var(--line)">Cancelar</button><button class="btn" id="f_save">Guardar</button></div>
    <div class="msg" id="f_msg"></div>
  </div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = (e) => { if (e.target === bg) close(); };
  bg.querySelector("#f_cancel").onclick = close;
  bg.querySelector("#f_save").onclick = async () => {
    const item = { nro: bg.querySelector("#f_nro").value.trim(), category: bg.querySelector("#f_cat").value.trim() || "General", title: bg.querySelector("#f_title").value.trim(), description: bg.querySelector("#f_desc").value.trim(), text: bg.querySelector("#f_text").value.trim() };
    if (!item.title || !item.text) { bg.querySelector("#f_msg").className = "msg err"; bg.querySelector("#f_msg").textContent = "Completa nombre y respuesta."; return; }
    if (qrEditId) await updateDoc(doc(db, "quickReplies", qrEditId), item);
    else await setDoc(doc(collection(db, "quickReplies")), item);
    await sheetPush("upsert", item);
    close(); renderRespuestas();
  };
}
function importFromSheet() {
  const msg = el("qr_msg"); msg.className = "msg";
  loadConfigDoc().then(cfg => {
    const url = (cfg.sheetUrl || "").trim();
    if (!url) { msg.className = "msg err"; msg.textContent = "Primero pon la URL del puente en ⚙️ Configuración."; return; }
    msg.textContent = "Importando…";
    const cb = "cxcb_" + Math.abs(url.length);
    const sep = url.indexOf("?") >= 0 ? "&" : "?";
    const s = document.createElement("script");
    window[cb] = async (data) => {
      try {
        const rows = (data && data.rows) || [];
        let n = 0;
        for (const r of rows) {
          const title = (r.nombre || "").toString().trim(); const text = (r.respuesta || "").toString().trim();
          if (!title && !text) continue;
          const item = { nro: (r.nro || "").toString(), category: (r.categoria || "General").toString().trim() || "General", title, description: (r.titulo || "").toString().trim(), text };
          const existing = QR.find(x => (x.title || "").trim() === title && (x.category || "") === item.category);
          if (existing) await updateDoc(doc(db, "quickReplies", existing.id), item);
          else await setDoc(doc(collection(db, "quickReplies")), item);
          n++;
        }
        msg.className = "msg ok"; msg.textContent = `✓ ${n} respuestas importadas.`;
        renderRespuestas();
      } catch (e) { msg.className = "msg err"; msg.textContent = "Error al importar: " + (e.message || e); }
      finally { delete window[cb]; s.remove(); }
    };
    s.src = url + sep + "callback=" + cb;
    s.onerror = () => { msg.className = "msg err"; msg.textContent = "No se pudo leer el Sheet. Revisa la URL del puente."; s.remove(); };
    document.body.appendChild(s);
  });
}

// ---------- Bandeja de pendientes ----------
let bandejaFilter = { status: "", agent: "", label: "" };
function statusLabel(s) { return ({ nuevo: "🟢 Nuevo", proceso: "🟡 En proceso", cerrado: "⚪ Cerrado" })[s] || "— sin estado —"; }
async function renderBandeja() {
  await loadAll();
  const agents = USERS.filter(u => u.active);
  const allLabels = [...new Set(CHATS.flatMap(c => c.labels || []))].sort();
  const chats = CHATS.map(c => c).filter(c => {
    if (bandejaFilter.status === "pendiente") { if (c.status !== "nuevo" && c.status !== "proceso") return false; }
    else if (bandejaFilter.status && c.status !== bandejaFilter.status) return false;
    if (bandejaFilter.agent === "__none" && c.assignedTo) return false;
    else if (bandejaFilter.agent && bandejaFilter.agent !== "__none" && c.assignedTo !== bandejaFilter.agent) return false;
    if (bandejaFilter.label && !(c.labels || []).includes(bandejaFilter.label)) return false;
    return true;
  }).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const rows = chats.map(c => `<tr>
    <td>${escape(c.title || "—")}</td>
    <td>${statusLabel(c.status)}</td>
    <td>${c.assignedToName ? escape(c.assignedToName) : '<span style="color:var(--muted)">sin asignar</span>'}</td>
    <td>${(c.labels || []).map(t => `<span class="pill" style="background:rgba(127,191,224,.14);color:#8fc4e8">${escape(t)}</span>`).join(" ")}</td>
    <td>${c.updatedAt ? new Date(Date.parse(c.updatedAt)).toLocaleString("es") : "—"}</td></tr>`).join("");
  const agentOpts = agents.map(u => `<option value="${u.uid}">${escape(u.name || u.email)}</option>`).join("");
  el("v-bandeja").innerHTML = `<h1>Bandeja de chats</h1><p class="lead">Todos los chats que el equipo ha marcado, para que nada quede sin responder.</p>
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <select id="b_status" class="mini" style="padding:8px">
        <option value="">Todos los estados</option>
        <option value="pendiente">Solo pendientes</option>
        <option value="nuevo">Nuevo</option><option value="proceso">En proceso</option><option value="cerrado">Cerrado</option>
      </select>
      <select id="b_agent" class="mini" style="padding:8px">
        <option value="">Todos los agentes</option><option value="__none">Sin asignar</option>${agentOpts}
      </select>
      <select id="b_label" class="mini" style="padding:8px">
        <option value="">Todas las etiquetas</option>${allLabels.map(l => `<option value="${escape(l)}">${escape(l)}</option>`).join("")}
      </select>
    </div>
    <table><thead><tr><th>Chat</th><th>Estado</th><th>Atiende</th><th>Etiquetas</th><th>Última actualización</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="color:var(--muted)">Sin chats con estos filtros.</td></tr>'}</tbody></table>`;
  el("b_status").value = bandejaFilter.status; el("b_agent").value = bandejaFilter.agent; el("b_label").value = bandejaFilter.label;
  el("b_status").onchange = () => { bandejaFilter.status = el("b_status").value; renderBandeja(); };
  el("b_agent").onchange = () => { bandejaFilter.agent = el("b_agent").value; renderBandeja(); };
  el("b_label").onchange = () => { bandejaFilter.label = el("b_label").value; renderBandeja(); };
}

// ---------- Presencia ----------
function online(u) { if (u.online !== true || !u.lastSeen) return false; const t = Date.parse(u.lastSeen); return !isNaN(t) && (Date.now() - t) < 180000; }
function timeAgo(iso) { if (!iso) return "nunca"; const t = Date.parse(iso); if (isNaN(t)) return "—"; const s = Math.floor((Date.now() - t) / 1000); if (s < 60) return "hace " + s + "s"; if (s < 3600) return "hace " + Math.floor(s / 60) + " min"; if (s < 86400) return "hace " + Math.floor(s / 3600) + " h"; return new Date(t).toLocaleString("es"); }
function fmtMin(m) { m = Number(m) || 0; const h = Math.floor(m / 60), mm = m % 60; return h ? (h + "h " + mm + "m") : (mm + "m"); }
async function renderPresence() {
  await loadAll();
  const today = new Date().toISOString().slice(0, 10);
  const conn = USERS.filter(online).length;
  const totalToday = USERS.reduce((s, u) => s + (Number((u.dailyMinutes || {})[today]) || 0), 0);
  const rows = USERS.map(u => {
    const mins = Number((u.dailyMinutes || {})[today]) || 0;
    return `<tr><td><span class="dot ${online(u) ? "on" : ""}"></span>${escape(u.name || "—")}<div style="color:var(--muted);font-size:12px">${escape(u.email || "")}</div></td>
    <td><span class="pill ${u.role}">${u.role}</span></td>
    <td>${online(u) ? '<span style="color:var(--green)">En línea</span>' : 'Desconectado'}</td>
    <td><b>${fmtMin(mins)}</b></td>
    <td>${timeAgo(u.lastSeen)}</td></tr>`;
  }).join("");
  el("v-presence").innerHTML = `<h1>Presencia del equipo</h1><p class="lead">Quién está conectado, cuánto tiempo lleva conectado hoy y su última conexión. Recarga para actualizar.</p>
    <div class="kpis"><div class="kpi"><div class="n" style="color:var(--green)">${conn}</div><div class="l">En línea ahora</div></div>
    <div class="kpi"><div class="n">${USERS.length}</div><div class="l">Usuarios totales</div></div>
    <div class="kpi"><div class="n">${fmtMin(totalToday)}</div><div class="l">Tiempo total hoy</div></div></div>
    <table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Conectado hoy</th><th>Última conexión</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="note" style="margin-top:12px">El "conectado hoy" se cuenta mientras tienen WhatsApp Web abierto con sesión iniciada en la extensión (aprox., en minutos).</p>`;
}

// ---------- Historial de presencia (día/semana/mes) ----------
let histPeriod = 7;
async function renderHistorial() {
  await loadAll();
  const days = [];
  for (let i = 0; i < histPeriod; i++) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
  const monthKey = new Date().toISOString().slice(0, 7);
  const rows = USERS.map(u => {
    const dm = u.dailyMinutes || {};
    const week7 = Object.keys(dm).filter(k => days.includes(k)).reduce((s, k) => s + (Number(dm[k]) || 0), 0);
    const month = Object.keys(dm).filter(k => k.startsWith(monthKey)).reduce((s, k) => s + (Number(dm[k]) || 0), 0);
    const cells = days.map(d => `<td style="text-align:center">${dm[d] ? fmtMin(dm[d]) : "·"}</td>`).join("");
    return `<tr><td>${escape(u.name || u.email)}</td>${cells}<td><b>${fmtMin(week7)}</b></td><td><b>${fmtMin(month)}</b></td></tr>`;
  }).join("");
  const dayHeaders = days.map(d => { const dt = new Date(d + "T00:00:00"); return `<th style="text-align:center">${dt.getDate()}/${dt.getMonth() + 1}</th>`; }).join("");
  el("v-historial").innerHTML = `<h1>Historial de conexión</h1><p class="lead">Tiempo conectado por día para analizar el trabajo del equipo (remoto). Recarga para actualizar.</p>
    <div style="margin-bottom:14px"><label style="color:var(--muted);font-size:13px;margin-right:8px">Periodo:</label>
      <select id="h_period" class="mini" style="padding:8px"><option value="7">Últimos 7 días</option><option value="14">Últimos 14 días</option><option value="30">Últimos 30 días</option></select></div>
    <div style="overflow-x:auto"><table><thead><tr><th>Agente</th>${dayHeaders}<th>Periodo</th><th>Este mes</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="color:var(--muted)">Sin datos aún.</td></tr>'}</tbody></table></div>
    <p class="note" style="margin-top:12px">Los días se muestran del más reciente al más antiguo. El historial guarda hasta ~2 meses.</p>`;
  el("h_period").value = String(histPeriod);
  el("h_period").onchange = () => { histPeriod = Number(el("h_period").value); renderHistorial(); };
}

// ---------- Reportes ----------
async function renderReports() {
  await loadAll();
  const total = CHATS.length;
  const cerrados = CHATS.filter(c => c.status === "cerrado").length;
  const pendientes = CHATS.filter(c => c.status === "nuevo" || c.status === "proceso").length;
  const sinAsignar = CHATS.filter(c => !c.assignedTo).length;
  const by = {};
  USERS.forEach(u => by[u.uid] = { name: u.name || u.email, role: u.role, asignados: 0, cerrados: 0, pendientes: 0 });
  CHATS.forEach(c => { if (c.assignedTo && by[c.assignedTo]) { by[c.assignedTo].asignados++; if (c.status === "cerrado") by[c.assignedTo].cerrados++; else if (c.status === "nuevo" || c.status === "proceso") by[c.assignedTo].pendientes++; } });
  const rows = Object.values(by).map(a => `<tr><td>${escape(a.name)}</td><td><span class="pill ${a.role}">${a.role}</span></td><td>${a.asignados}</td><td>${a.pendientes}</td><td>${a.cerrados}</td></tr>`).join("");
  el("v-reports").innerHTML = `<h1>Reportes</h1><p class="lead">Chats atendidos por el equipo (según lo marcado en la extensión).</p>
    <div class="kpis">
      <div class="kpi"><div class="n">${total}</div><div class="l">Chats registrados</div></div>
      <div class="kpi"><div class="n" style="color:var(--warn)">${pendientes}</div><div class="l">Pendientes</div></div>
      <div class="kpi"><div class="n" style="color:var(--green)">${cerrados}</div><div class="l">Cerrados</div></div>
      <div class="kpi"><div class="n" style="color:var(--muted)">${sinAsignar}</div><div class="l">Sin asignar</div></div>
    </div>
    <table><thead><tr><th>Agente</th><th>Rol</th><th>Asignados</th><th>Pendientes</th><th>Cerrados</th></tr></thead><tbody>${rows || '<tr><td colspan="5" style="color:var(--muted)">Sin datos aún.</td></tr>'}</tbody></table>`;
}

// ---------- Usuarios ----------
async function renderUsers() {
  await loadAll();
  const rows = USERS.map(u => `<tr>
    <td>${escape(u.name || "—")}<div style="color:var(--muted);font-size:12px">${escape(u.email || "")}</div></td>
    <td><select class="mini role-sel" data-uid="${u.uid}" ${u.uid === ME.uid ? "disabled" : ""}>
      <option value="agent" ${u.role === "agent" ? "selected" : ""}>Agente</option>
      <option value="supervisor" ${u.role === "supervisor" ? "selected" : ""}>Supervisor</option>
      <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option></select></td>
    <td>${u.active ? '<span class="pill agent">Activo</span>' : '<span class="pill" style="background:rgba(240,180,41,.15);color:var(--warn)">Inactivo</span>'}</td>
    <td>${u.uid === ME.uid ? "" : `<button class="mini" data-toggle="${u.uid}" data-s="${u.active}">${u.active ? "Desactivar" : "Activar"}</button>`}</td></tr>`).join("");
  el("v-users").innerHTML = `<h1>Usuarios</h1><p class="lead">Crea las cuentas de tu equipo. Tú les das el correo y el PIN; ellos solo usan la extensión.</p>
    <div class="formcard">
      <h3 style="margin:0 0 14px">Crear usuario</h3>
      <label>Nombre</label><input id="u_name" placeholder="Ej. María López">
      <label>Correo</label><input id="u_email" type="email" placeholder="maria@empresa.com">
      <label>PIN / contraseña (mínimo 6)</label><input id="u_pin" placeholder="Ej. 123456">
      <label>Rol</label><select id="u_role"><option value="agent">Agente</option><option value="supervisor">Supervisor</option><option value="admin">Admin</option></select>
      <button class="btn" id="u_create">Crear usuario</button>
      <div class="msg" id="u_msg"></div>
      <p class="note" style="margin-top:8px">El usuario queda activo al instante. Comparte con esa persona su correo y PIN para que entre a la extensión.</p>
    </div>
    <table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;

  el("u_create").onclick = async () => {
    const name = el("u_name").value.trim(), email = el("u_email").value.trim(), pin = el("u_pin").value, role = el("u_role").value;
    const msg = el("u_msg"); msg.className = "msg";
    if (!name || !email || pin.length < 6) { msg.className = "msg err"; msg.textContent = "Completa nombre, correo y un PIN de 6+ caracteres."; return; }
    el("u_create").disabled = true; msg.textContent = "Creando…";
    try {
      const cred = await createUserWithEmailAndPassword(auth2, email, pin);
      await setDoc(doc(db, "users", cred.user.uid), { name, email, role, active: true, signature: "", createdAt: serverTimestamp() });
      await signOut(auth2);
      msg.className = "msg ok"; msg.textContent = "✓ Usuario creado. Dale su correo y PIN.";
      el("u_name").value = ""; el("u_email").value = ""; el("u_pin").value = "";
      renderUsers();
    } catch (e) {
      msg.className = "msg err";
      msg.textContent = e.code === "auth/email-already-in-use" ? "Ese correo ya está registrado." : ("Error: " + (e.code || e.message));
    } finally { el("u_create").disabled = false; }
  };
  document.querySelectorAll(".role-sel").forEach(s => s.onchange = async () => { await updateDoc(doc(db, "users", s.dataset.uid), { role: s.value }); renderUsers(); });
  document.querySelectorAll("[data-toggle]").forEach(b => b.onclick = async () => { await updateDoc(doc(db, "users", b.dataset.toggle), { active: b.dataset.s !== "true" }); renderUsers(); });
}

// ---------- Configuración IA ----------
const AI_MODELS = {
  deepseek: [["deepseek-chat", "deepseek-chat (recomendado)"], ["deepseek-reasoner", "deepseek-reasoner (razonamiento)"]],
  gemini: [["gemini-2.0-flash", "gemini-2.0-flash (recomendado)"], ["gemini-1.5-flash", "gemini-1.5-flash"], ["gemini-2.5-flash", "gemini-2.5-flash"]]
};
const AI_HELP = {
  deepseek: 'Consigue tu clave en <a href="https://platform.deepseek.com/api_keys" target="_blank" style="color:var(--green)">platform.deepseek.com</a> (crea cuenta, agrega saldo — es muy barato — y crea una API key). Empieza con <code>sk-</code>.',
  gemini: 'Consigue tu clave gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--green)">aistudio.google.com/app/apikey</a>. Empieza con <code>AIza</code>.'
};
async function renderConfig() {
  let cfg = {};
  try { const s = await getDoc(doc(db, "config", "app")); if (s.exists()) cfg = s.data(); } catch (e) {}
  const provider = cfg.provider || (cfg.geminiKey ? "gemini" : "deepseek");
  const curKey = cfg.aiKey || cfg.geminiKey || "";
  const curModel = cfg.aiModel || cfg.geminiModel || "";
  el("v-config").innerHTML = `<h1>Configuración de IA</h1><p class="lead">Elige el proveedor y pon la clave UNA vez aquí. Funciona para TODO el equipo; nadie más configura nada.</p>
    <div class="formcard">
      <label>Proveedor de IA</label>
      <select id="c_provider">
        <option value="deepseek">DeepSeek (barato)</option>
        <option value="gemini">Google Gemini (gratis)</option>
      </select>
      <label>Clave (API key)</label>
      <input id="c_key" type="password" placeholder="Pega aquí tu clave" value="${escape(curKey)}">
      <label>Modelo</label>
      <select id="c_model"></select>
      <button class="btn" id="c_save">Guardar</button>
      <div class="msg" id="c_msg"></div>
      <p class="note" id="c_help" style="margin-top:10px"></p>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Datos de la empresa</h3>
      <p class="note" style="margin:0 0 12px">El nombre se usa en la variable <code>{empresa}</code> de las respuestas rápidas.</p>
      <label>Nombre de la empresa</label>
      <input id="c_company" placeholder="Ej. CONTAX" value="${escape(cfg.company || "")}">
      <button class="btn" id="c_csave">Guardar empresa</button>
      <div class="msg" id="c_cmsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Google Sheets (respuestas)</h3>
      <p class="note" style="margin:0 0 12px">Pega la URL del "puente" (Apps Script) para conectar tus respuestas con tu Google Sheet.
      Sigue la guía <b>GUIA-GOOGLE-SHEETS.md</b>. Con esto: importas tu hoja, y todo lo que se cree/edite se
      guarda también en el Sheet.</p>
      <label>URL del puente de Google Sheets (…/exec)</label>
      <input id="c_sheet" placeholder="https://script.google.com/macros/s/…/exec" value="${escape(cfg.sheetUrl || "")}">
      <button class="btn" id="c_ssave">Guardar URL</button>
      <div class="msg" id="c_smsg"></div>
    </div>`;
  const provSel = el("c_provider"); provSel.value = provider;
  function fillModels() {
    const p = provSel.value;
    el("c_model").innerHTML = AI_MODELS[p].map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
    if (curModel && AI_MODELS[p].some(m => m[0] === curModel)) el("c_model").value = curModel;
    el("c_help").innerHTML = AI_HELP[p];
  }
  fillModels();
  provSel.onchange = fillModels;
  el("c_save").onclick = async () => {
    const msg = el("c_msg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try {
      await setDoc(doc(db, "config", "app"), { provider: provSel.value, aiKey: el("c_key").value.trim(), aiModel: el("c_model").value, updatedAt: serverTimestamp() }, { merge: true });
      msg.className = "msg ok"; msg.textContent = "✓ Guardado. La IA ya funciona para todo el equipo.";
    } catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_csave").onclick = async () => {
    const msg = el("c_cmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { company: el("c_company").value.trim(), updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ Empresa guardada."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_ssave").onclick = async () => {
    const msg = el("c_smsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { sheetUrl: el("c_sheet").value.trim(), updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ URL guardada."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
}

function escape(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
