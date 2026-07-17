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
  if (v === "bandeja") renderBandeja();
  if (v === "reports") renderReports();
  if (v === "users") renderUsers();
  if (v === "config") renderConfig();
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
async function renderPresence() {
  await loadAll();
  const conn = USERS.filter(online).length;
  const rows = USERS.map(u => `<tr><td><span class="dot ${online(u) ? "on" : ""}"></span>${escape(u.name || "—")}<div style="color:var(--muted);font-size:12px">${escape(u.email || "")}</div></td>
    <td><span class="pill ${u.role}">${u.role}</span></td>
    <td>${online(u) ? '<span style="color:var(--green)">En línea</span>' : 'Desconectado'}</td>
    <td>${timeAgo(u.lastSeen)}</td></tr>`).join("");
  el("v-presence").innerHTML = `<h1>Presencia del equipo</h1><p class="lead">Quién está conectado ahora y su última conexión. Se actualiza al recargar.</p>
    <div class="kpis"><div class="kpi"><div class="n" style="color:var(--green)">${conn}</div><div class="l">En línea ahora</div></div>
    <div class="kpi"><div class="n">${USERS.length}</div><div class="l">Usuarios totales</div></div></div>
    <table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Última conexión</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="note" style="margin-top:12px">Recarga la página para ver el estado más reciente.</p>`;
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
}

function escape(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
