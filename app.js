// ============================================================
//  NUMMEROS by CONTAX — Panel de Administración (web)
//  VERSIÓN 1  ·  2026-09-07
//  Presencia · Reportes · Clientes · Base de Datos (Google Sheets) · IA
// ============================================================
const APP_VERSION = "16";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

if (!window.APP_CONFIG || !window.APP_CONFIG.firebase) {
  document.body.innerHTML = '<div style="color:#fff;font-family:sans-serif;padding:40px">Falta config.js con los datos de Firebase.</div>';
  throw new Error("config.js");
}
const app = initializeApp(window.APP_CONFIG.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
// App secundaria para crear usuarios sin cerrar la sesión del admin
const app2 = initializeApp(window.APP_CONFIG.firebase, "secondary");
const auth2 = getAuth(app2);

const el = (id) =>document.getElementById(id);
// Muestra la versión en pantalla (todos los <span class="ver">)
try { document.querySelectorAll(".ver").forEach(e => { e.textContent = "v" + APP_VERSION; e.title = "NUMMEROS · Panel de Administración v" + APP_VERSION; }); document.title = "NUMMEROS · Panel v" + APP_VERSION; } catch (e) {}
const LOGO_BYC = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" zoomAndPan="magnify" viewBox="11 100 132 40" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><g/><clipPath id="c73c86b7c9"><path d="M 42 24 L 88 24 L 88 37.578125 L 42 37.578125 Z M 42 24 " clip-rule="nonzero"/></clipPath><clipPath id="8b639d37ef"><path d="M 0.542969 4 L 8 4 L 8 13 L 0.542969 13 Z M 0.542969 4 " clip-rule="nonzero"/></clipPath><clipPath id="3c14d60791"><path d="M 4 3 L 7.496094 3 L 7.496094 8 L 4 8 Z M 4 3 " clip-rule="nonzero"/></clipPath><clipPath id="b0db276849"><rect x="0" width="8" y="0" height="9"/></clipPath><clipPath id="ec4969832e"><path d="M 39 4 L 45.378906 4 L 45.378906 11 L 39 11 Z M 39 4 " clip-rule="nonzero"/></clipPath><clipPath id="cd5bf04f37"><rect x="0" width="46" y="0" height="14"/></clipPath><clipPath id="f202c15746"><rect x="0" width="132" y="0" height="38"/></clipPath></defs><g transform="matrix(1, 0, 0, 1, 11, 101)"><g clip-path="url(#f202c15746)"><g fill="currentColor" fill-opacity="1"><g transform="translate(0.701317, 19.527358)"><g><path d="M 10.59375 0 L 4.0625 -11.5625 C 4.1875 -10.4375 4.25 -9.53125 4.25 -8.84375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.046875 -15 L 11.6875 -3.359375 C 11.550781 -4.429688 11.484375 -5.40625 11.484375 -6.28125 L 11.484375 -15 L 14.28125 -15 L 14.28125 0 Z M 10.59375 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(16.44427, 19.527358)"><g><path d="M 7.703125 0.21875 C 5.628906 0.21875 4.046875 -0.285156 2.953125 -1.296875 C 1.859375 -2.304688 1.3125 -3.75 1.3125 -5.625 L 1.3125 -15 L 4.453125 -15 L 4.453125 -5.875 C 4.453125 -4.6875 4.734375 -3.785156 5.296875 -3.171875 C 5.859375 -2.554688 6.6875 -2.25 7.78125 -2.25 C 8.90625 -2.25 9.769531 -2.566406 10.375 -3.203125 C 10.976562 -3.847656 11.28125 -4.769531 11.28125 -5.96875 L 11.28125 -15 L 14.421875 -15 L 14.421875 -5.78125 C 14.421875 -3.875 13.832031 -2.394531 12.65625 -1.34375 C 11.476562 -0.300781 9.828125 0.21875 7.703125 0.21875 Z M 7.703125 0.21875 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(32.187223, 19.527358)"><g><path d="M 13.921875 0 L 13.921875 -9.09375 C 13.921875 -9.300781 13.921875 -9.503906 13.921875 -9.703125 C 13.929688 -9.910156 13.96875 -10.796875 14.03125 -12.359375 C 13.519531 -10.453125 13.144531 -9.125 12.90625 -8.375 L 10.203125 0 L 7.96875 0 L 5.265625 -8.375 L 4.125 -12.359375 C 4.207031 -10.710938 4.25 -9.625 4.25 -9.09375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.671875 -15 L 8.34375 -6.609375 L 8.578125 -5.796875 L 9.09375 -3.796875 L 9.765625 -6.203125 L 12.53125 -15 L 16.703125 -15 L 16.703125 0 Z M 13.921875 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(50.346431, 19.527358)"><g><path d="M 13.921875 0 L 13.921875 -9.09375 C 13.921875 -9.300781 13.921875 -9.503906 13.921875 -9.703125 C 13.929688 -9.910156 13.96875 -10.796875 14.03125 -12.359375 C 13.519531 -10.453125 13.144531 -9.125 12.90625 -8.375 L 10.203125 0 L 7.96875 0 L 5.265625 -8.375 L 4.125 -12.359375 C 4.207031 -10.710938 4.25 -9.625 4.25 -9.09375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.671875 -15 L 8.34375 -6.609375 L 8.578125 -5.796875 L 9.09375 -3.796875 L 9.765625 -6.203125 L 12.53125 -15 L 16.703125 -15 L 16.703125 0 Z M 13.921875 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(68.505639, 19.527358)"><g><path d="M 1.453125 0 L 1.453125 -15 L 13.265625 -15 L 13.265625 -12.578125 L 4.59375 -12.578125 L 4.59375 -8.8125 L 12.609375 -8.8125 L 12.609375 -6.375 L 4.59375 -6.375 L 4.59375 -2.421875 L 13.703125 -2.421875 L 13.703125 0 Z M 1.453125 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(83.045778, 19.527358)"><g><path d="M 11.765625 0 L 8.28125 -5.703125 L 4.59375 -5.703125 L 4.59375 0 L 1.453125 0 L 1.453125 -15 L 8.953125 -15 C 10.742188 -15 12.125 -14.613281 13.09375 -13.84375 C 14.070312 -13.082031 14.5625 -11.976562 14.5625 -10.53125 C 14.5625 -9.476562 14.257812 -8.570312 13.65625 -7.8125 C 13.0625 -7.050781 12.257812 -6.550781 11.25 -6.3125 L 15.3125 0 Z M 11.390625 -10.40625 C 11.390625 -11.84375 10.46875 -12.5625 8.625 -12.5625 L 4.59375 -12.5625 L 4.59375 -8.140625 L 8.71875 -8.140625 C 9.59375 -8.140625 10.253906 -8.335938 10.703125 -8.734375 C 11.160156 -9.128906 11.390625 -9.6875 11.390625 -10.40625 Z M 11.390625 -10.40625 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(98.788732, 19.527358)"><g><path d="M 16.046875 -7.578125 C 16.046875 -6.015625 15.738281 -4.640625 15.125 -3.453125 C 14.507812 -2.265625 13.625 -1.351562 12.46875 -0.71875 C 11.320312 -0.09375 9.984375 0.21875 8.453125 0.21875 C 6.085938 0.21875 4.234375 -0.472656 2.890625 -1.859375 C 1.554688 -3.253906 0.890625 -5.160156 0.890625 -7.578125 C 0.890625 -9.984375 1.554688 -11.859375 2.890625 -13.203125 C 4.234375 -14.554688 6.09375 -15.234375 8.46875 -15.234375 C 10.84375 -15.234375 12.695312 -14.550781 14.03125 -13.1875 C 15.375 -11.820312 16.046875 -9.953125 16.046875 -7.578125 Z M 12.84375 -7.578125 C 12.84375 -9.191406 12.457031 -10.457031 11.6875 -11.375 C 10.925781 -12.300781 9.851562 -12.765625 8.46875 -12.765625 C 7.0625 -12.765625 5.972656 -12.304688 5.203125 -11.390625 C 4.441406 -10.472656 4.0625 -9.203125 4.0625 -7.578125 C 4.0625 -5.929688 4.453125 -4.632812 5.234375 -3.6875 C 6.015625 -2.738281 7.085938 -2.265625 8.453125 -2.265625 C 9.859375 -2.265625 10.941406 -2.722656 11.703125 -3.640625 C 12.460938 -4.566406 12.84375 -5.878906 12.84375 -7.578125 Z M 12.84375 -7.578125 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(115.745137, 19.527358)"><g><path d="M 13.703125 -4.328125 C 13.703125 -2.859375 13.15625 -1.734375 12.0625 -0.953125 C 10.96875 -0.171875 9.367188 0.21875 7.265625 0.21875 C 5.335938 0.21875 3.828125 -0.117188 2.734375 -0.796875 C 1.640625 -1.484375 0.9375 -2.519531 0.625 -3.90625 L 3.65625 -4.40625 C 3.863281 -3.613281 4.265625 -3.035156 4.859375 -2.671875 C 5.460938 -2.316406 6.289062 -2.140625 7.34375 -2.140625 C 9.539062 -2.140625 10.640625 -2.804688 10.640625 -4.140625 C 10.640625 -4.566406 10.515625 -4.914062 10.265625 -5.1875 C 10.015625 -5.46875 9.660156 -5.703125 9.203125 -5.890625 C 8.742188 -6.078125 7.863281 -6.300781 6.5625 -6.5625 C 5.4375 -6.820312 4.65625 -7.03125 4.21875 -7.1875 C 3.78125 -7.351562 3.382812 -7.539062 3.03125 -7.75 C 2.675781 -7.96875 2.375 -8.226562 2.125 -8.53125 C 1.875 -8.84375 1.675781 -9.203125 1.53125 -9.609375 C 1.394531 -10.023438 1.328125 -10.5 1.328125 -11.03125 C 1.328125 -12.382812 1.835938 -13.421875 2.859375 -14.140625 C 3.878906 -14.867188 5.363281 -15.234375 7.3125 -15.234375 C 9.164062 -15.234375 10.554688 -14.941406 11.484375 -14.359375 C 12.421875 -13.773438 13.023438 -12.8125 13.296875 -11.46875 L 10.25 -11.0625 C 10.09375 -11.707031 9.773438 -12.191406 9.296875 -12.515625 C 8.816406 -12.835938 8.132812 -13 7.25 -13 C 5.34375 -13 4.390625 -12.40625 4.390625 -11.21875 C 4.390625 -10.820312 4.488281 -10.5 4.6875 -10.25 C 4.894531 -10.007812 5.195312 -9.800781 5.59375 -9.625 C 5.988281 -9.445312 6.796875 -9.226562 8.015625 -8.96875 C 9.453125 -8.664062 10.476562 -8.382812 11.09375 -8.125 C 11.71875 -7.863281 12.210938 -7.5625 12.578125 -7.21875 C 12.941406 -6.875 13.21875 -6.460938 13.40625 -5.984375 C 13.601562 -5.503906 13.703125 -4.953125 13.703125 -4.328125 Z M 13.703125 -4.328125 "/></g></g></g><g clip-path="url(#c73c86b7c9)"><g transform="matrix(1, 0, 0, 1, 42, 24)"><g clip-path="url(#cd5bf04f37)"><g clip-path="url(#8b639d37ef)"><g transform="matrix(1, 0, 0, 1, -0.000000000000021316, 4)"><g clip-path="url(#b0db276849)"><g fill="currentColor" fill-opacity="1"><g transform="translate(0.725152, 6.153239)"><g><path d="M 0.359375 -3.046875 L 0.359375 -4.234375 L 1.328125 -4.234375 L 1.328125 -3.046875 Z M 1.328125 0 L 0.359375 0 L 0.359375 -3.0625 L 1.328125 -3.0625 Z M 3.0625 -1.140625 L 2.078125 -1.140625 L 2.078125 -1.921875 L 3.0625 -1.921875 Z M 2.078125 -1.921875 C 2.078125 -2.078125 2.046875 -2.195312 1.984375 -2.28125 C 1.929688 -2.375 1.847656 -2.421875 1.734375 -2.421875 L 2.03125 -3.15625 C 2.226562 -3.15625 2.40625 -3.097656 2.5625 -2.984375 C 2.71875 -2.878906 2.835938 -2.734375 2.921875 -2.546875 C 3.015625 -2.367188 3.0625 -2.160156 3.0625 -1.921875 Z M 1.0625 -1.859375 C 1.0625 -2.109375 1.101562 -2.332031 1.1875 -2.53125 C 1.269531 -2.726562 1.382812 -2.878906 1.53125 -2.984375 C 1.675781 -3.097656 1.84375 -3.15625 2.03125 -3.15625 L 1.734375 -2.421875 C 1.609375 -2.421875 1.507812 -2.367188 1.4375 -2.265625 C 1.363281 -2.171875 1.328125 -2.035156 1.328125 -1.859375 Z M 2.078125 -1.140625 L 3.0625 -1.140625 C 3.0625 -0.910156 3.015625 -0.703125 2.921875 -0.515625 C 2.835938 -0.328125 2.71875 -0.175781 2.5625 -0.0625 C 2.40625 0.0390625 2.226562 0.09375 2.03125 0.09375 L 1.734375 -0.640625 C 1.847656 -0.640625 1.929688 -0.679688 1.984375 -0.765625 C 2.046875 -0.859375 2.078125 -0.984375 2.078125 -1.140625 Z M 1.0625 -1.203125 L 1.328125 -1.203125 C 1.328125 -1.023438 1.363281 -0.882812 1.4375 -0.78125 C 1.507812 -0.6875 1.609375 -0.640625 1.734375 -0.640625 L 2.03125 0.09375 C 1.84375 0.09375 1.675781 0.0351562 1.53125 -0.078125 C 1.382812 -0.191406 1.269531 -0.34375 1.1875 -0.53125 C 1.101562 -0.726562 1.0625 -0.953125 1.0625 -1.203125 Z M 1.0625 -1.203125 "/></g></g></g><g clip-path="url(#3c14d60791)"><g fill="currentColor" fill-opacity="1"><g transform="translate(4.049206, 6.153239)"><g><path d="M 0.453125 1.0625 L 0.671875 0.3125 C 0.835938 0.351562 0.96875 0.359375 1.0625 0.328125 C 1.15625 0.304688 1.21875 0.242188 1.25 0.140625 L 2.0625 0.140625 C 1.9375 0.566406 1.738281 0.851562 1.46875 1 C 1.207031 1.15625 0.867188 1.175781 0.453125 1.0625 Z M 1.25 0.140625 L 2.03125 -3.0625 L 3.015625 -3.0625 L 2.0625 0.140625 Z M 1.25 0.53125 L 0.171875 -3.0625 L 1.15625 -3.0625 L 1.703125 -0.84375 Z M 1.25 0.53125 "/></g></g></g></g></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(8.028157, 10.61739)"><g><path d="M 3.875 0.15625 C 3.195312 0.15625 2.597656 0.0078125 2.078125 -0.28125 C 1.554688 -0.570312 1.148438 -0.976562 0.859375 -1.5 C 0.566406 -2.019531 0.421875 -2.609375 0.421875 -3.265625 C 0.421875 -3.929688 0.578125 -4.519531 0.890625 -5.03125 C 1.210938 -5.550781 1.632812 -5.953125 2.15625 -6.234375 C 2.6875 -6.523438 3.265625 -6.671875 3.890625 -6.671875 C 4.421875 -6.671875 4.929688 -6.554688 5.421875 -6.328125 C 5.910156 -6.097656 6.332031 -5.773438 6.6875 -5.359375 L 5.8125 -4.53125 C 5.519531 -4.84375 5.210938 -5.078125 4.890625 -5.234375 C 4.566406 -5.398438 4.222656 -5.484375 3.859375 -5.484375 C 3.453125 -5.484375 3.078125 -5.382812 2.734375 -5.1875 C 2.398438 -5 2.132812 -4.734375 1.9375 -4.390625 C 1.738281 -4.054688 1.640625 -3.679688 1.640625 -3.265625 C 1.640625 -2.816406 1.734375 -2.425781 1.921875 -2.09375 C 2.117188 -1.757812 2.390625 -1.5 2.734375 -1.3125 C 3.078125 -1.125 3.460938 -1.03125 3.890625 -1.03125 C 4.273438 -1.03125 4.613281 -1.101562 4.90625 -1.25 C 5.207031 -1.40625 5.523438 -1.644531 5.859375 -1.96875 L 6.703125 -1.09375 C 6.398438 -0.789062 6.109375 -0.550781 5.828125 -0.375 C 5.554688 -0.195312 5.257812 -0.0664062 4.9375 0.015625 C 4.625 0.109375 4.269531 0.15625 3.875 0.15625 Z M 3.875 0.15625 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(14.911591, 10.61739)"><g><path d="M 3.828125 0.15625 C 3.191406 0.15625 2.613281 0.00390625 2.09375 -0.296875 C 1.582031 -0.609375 1.175781 -1.023438 0.875 -1.546875 C 0.570312 -2.066406 0.421875 -2.640625 0.421875 -3.265625 C 0.421875 -3.890625 0.570312 -4.460938 0.875 -4.984375 C 1.1875 -5.503906 1.601562 -5.914062 2.125 -6.21875 C 2.644531 -6.519531 3.207031 -6.671875 3.8125 -6.671875 C 4.414062 -6.671875 4.972656 -6.519531 5.484375 -6.21875 C 6.003906 -5.914062 6.421875 -5.503906 6.734375 -4.984375 C 7.046875 -4.460938 7.203125 -3.878906 7.203125 -3.234375 C 7.203125 -2.609375 7.050781 -2.035156 6.75 -1.515625 C 6.445312 -1.003906 6.039062 -0.597656 5.53125 -0.296875 C 5.019531 0.00390625 4.453125 0.15625 3.828125 0.15625 Z M 3.828125 -1.03125 C 4.210938 -1.03125 4.566406 -1.128906 4.890625 -1.328125 C 5.210938 -1.523438 5.46875 -1.789062 5.65625 -2.125 C 5.84375 -2.46875 5.9375 -2.84375 5.9375 -3.25 C 5.9375 -3.644531 5.84375 -4.007812 5.65625 -4.34375 C 5.476562 -4.6875 5.222656 -4.960938 4.890625 -5.171875 C 4.566406 -5.378906 4.207031 -5.484375 3.8125 -5.484375 C 3.414062 -5.484375 3.054688 -5.382812 2.734375 -5.1875 C 2.410156 -5 2.148438 -4.734375 1.953125 -4.390625 C 1.765625 -4.054688 1.671875 -3.671875 1.671875 -3.234375 C 1.671875 -2.804688 1.769531 -2.425781 1.96875 -2.09375 C 2.164062 -1.757812 2.425781 -1.5 2.75 -1.3125 C 3.082031 -1.125 3.441406 -1.03125 3.828125 -1.03125 Z M 3.828125 -1.03125 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(22.519645, 10.61739)"><g><path d="M 4.71875 -6.5 L 5.96875 -6.5 L 5.96875 0 L 4.765625 0 L 1.984375 -4.265625 L 1.984375 0 L 0.75 0 L 0.75 -6.5 L 1.9375 -6.5 L 4.71875 -2.234375 Z M 4.71875 -6.5 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(29.221978, 10.61739)"><g><path d="M 1.265625 -5.296875 L 0.09375 -5.296875 L 0.09375 -6.5 L 3.703125 -6.5 L 3.703125 -5.296875 L 2.5 -5.296875 L 2.5 0 L 1.265625 0 Z M 1.265625 -5.296875 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(32.935411, 10.61739)"><g><path d="M 4.984375 0 L 4.484375 -1.34375 L 1.78125 -1.34375 L 1.28125 0 L 0 0 L 2.515625 -6.5 L 3.765625 -6.5 L 6.265625 0 Z M 2.25 -2.5625 L 4.03125 -2.5625 L 3.140625 -4.953125 Z M 2.25 -2.5625 "/></g></g></g><g clip-path="url(#ec4969832e)"><g fill="currentColor" fill-opacity="1"><g transform="translate(39.202998, 10.61739)"><g><path d="M 2.390625 -3.359375 L 0.3125 -6.5 L 1.71875 -6.5 L 3.078125 -4.421875 L 4.453125 -6.5 L 5.84375 -6.5 L 3.78125 -3.359375 L 5.96875 0 L 4.578125 0 L 3.078125 -2.296875 L 1.59375 0 L 0.1875 0 Z M 2.390625 -3.359375 "/></g></g></g></g></g></g></g></g></g></svg>`;
let ME = null, USERS = [], CHATS = [];

// ---------- Tema ----------
if (localStorage.getItem("cx-theme") === "dark") { document.documentElement.classList.add("dark"); }
const CX_SUN = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2M19.5 12h2M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"/></svg>';
const CX_MOON = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"/></svg>';
function initTheme() { const b = el("themeBtn"); if (!b) return; const dark = () =>document.documentElement.classList.contains("dark"); b.innerHTML = dark() ? CX_SUN : CX_MOON; b.onclick = () => { const d = !dark(); document.documentElement.classList.toggle("dark", d); localStorage.setItem("cx-theme", d ? "dark" : "light"); b.innerHTML = d ? CX_SUN : CX_MOON; }; }
function initSidebar() {
  const b = el("sbToggle"); const lay = document.querySelector(".layout"); if (!b || !lay) return;
  try { if (localStorage.getItem("cx-sb") === "hide") lay.classList.add("sbhide"); } catch (e) {}
  b.onclick = () => { const h = lay.classList.toggle("sbhide"); try { localStorage.setItem("cx-sb", h ? "hide" : "show"); } catch (e) {} };
}
function initFab() {
  const f = el("cxFab"); if (!f) return;
  f.onclick = () => { const btn = document.querySelector('nav.tabs button[data-v="asistente"]'); if (btn) btn.click(); };
}

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
el("logoutBtn").onclick = () =>signOut(auth);
el("agentLogout").onclick = () =>signOut(auth);

// ---------- Roles y permisos del portal ----------
// groups: 'portal' (Clientes…) · 'crm' (Presencia/Bandeja/Respuestas/Reportes) · 'admin' (Usuarios/Config)
// clientes: 'edit' = crear/editar · 'view' = solo lectura
const ROLE_ACCESS = {
  admin:      { groups: ["portal", "crm", "admin"], clientes: "edit" },
  supervisor: { groups: ["portal", "crm", "admin"], clientes: "edit" },
  editor:     { groups: ["portal"], clientes: "edit" },
  cajero:     { groups: ["portal"], clientes: "edit" },
  lector:     { groups: ["portal"], clientes: "view" }
};
function myAccess() { return ROLE_ACCESS[ME && ME.role] || null; }
function canEditClientes() { const a = myAccess(); return !!a && a.clientes === "edit"; }
function isAdmin() { const a = myAccess(); return !!a && a.groups.includes("admin"); }

onAuthStateChanged(auth, async (user) => {
  if (!user) { el("login").classList.remove("hidden"); el("app").classList.add("hidden"); el("agentOnly").classList.add("hidden"); return; }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) { el("loginMsg").className = "msg err"; el("loginMsg").textContent = "Sin perfil."; await signOut(auth); return; }
  ME = { uid: user.uid, ...snap.data() };
  const access = myAccess();
  el("login").classList.add("hidden");
  // Sin acceso al portal (agente de la extensión, o rol desconocido, o inactivo) → pantalla de agente
  if (!access || ME.active !== true) { el("agentOnly").classList.remove("hidden"); el("app").classList.add("hidden"); return; }
  el("agentOnly").classList.add("hidden"); el("app").classList.remove("hidden");
  el("who").textContent = `${ME.name || ME.email} · ${ME.role}`;
  initTheme();
  initSidebar();
  initFab();
  // Mostrar solo las pestañas que el rol puede ver; elegir la primera visible como activa
  let first = null;
  document.querySelectorAll('nav.tabs button').forEach(b => {
    const ok = access.groups.includes(b.dataset.grp);
    b.classList.toggle("hidden", !ok);
    b.classList.remove("active");
    b.onclick = () =>switchView(b.dataset.v, b);
    if (ok && !first) first = b;
  });
  if (first) switchView(first.dataset.v, first);
});

async function loadAll() {
  USERS = []; CHATS = [];
  try { (await getDocs(collection(db, "users"))).forEach(d =>USERS.push({ uid: d.id, ...d.data() })); } catch (e) {}
  try { (await getDocs(collection(db, "waChats"))).forEach(d =>CHATS.push(d.data())); } catch (e) {}
}

function switchView(v, btn) {
  document.querySelectorAll('nav.tabs button').forEach(b =>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  try { const _t = document.getElementById("pgTitle"); if (_t) { const _s = btn && btn.querySelector("span"); _t.textContent = _s ? _s.textContent : (v.charAt(0).toUpperCase() + v.slice(1)); } } catch (e) {}
  document.querySelectorAll('.view').forEach(s =>s.classList.remove('active'));
  el("v-" + v).classList.add("active");
  if (v === "inicio") renderInicio();
  if (v === "clientes") renderClientes();
  if (v === "basedatos") renderBaseDatos();
  if (v === "tarifas") renderTarifas();
  if (v === "asistente") renderAsistente();
  if (v === "recepcion") renderRecepcion();
  if (v === "dashboard") renderDashboard();
  if (v === "declaraciones") renderLista("declaracion", "v-declaraciones", "Declaraciones");
  if (v === "tramites") renderLista("tramite", "v-tramites", "Trámites");
  if (v === "eeff") renderLista("eeff", "v-eeff", "Estados Financieros (EEFF)");
  if (v === "calendario") renderCalendario();
  if (v === "arqueo") renderArqueo();
  if (v === "egresos") renderEgresos();
  if (v === "presence") renderPresence();
  if (v === "historial") renderHistorial();
  if (v === "bandeja") renderBandeja();
  if (v === "respuestas") renderRespuestas();
  if (v === "reports") renderReports();
  if (v === "users") renderUsers();
  if (v === "importar") renderImportar();
  if (v === "config") renderConfig();
}

// ---------- Inicio (portal home) ----------
async function renderInicio() {
  let nCli = "—", nAct = "—";
  try {
    const snap = await getDocs(collection(db, "clientes"));
    let t = 0, a = 0;
    snap.forEach(d => { t++; if (/^activo/i.test(String((d.data().estadoUsuario) || "").trim())) a++; });
    nCli = t; nAct = a;
  } catch (e) {}
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : (hora < 19 ? "Buenas tardes" : "Buenas noches");
  const nombre = escape((ME.name || ME.email || "").split(" ")[0] || "");
  el("v-inicio").innerHTML = `
    <div style="position:relative;overflow:hidden;border:1px solid var(--line);border-radius:16px;background:var(--panel);padding:48px 28px;min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--txt);opacity:.05;pointer-events:none">
        <div style="width:min(90%,720px)">${LOGO_BYC}</div>
      </div>
      <div style="position:relative;z-index:1;max-width:560px">
        <div style="color:var(--txt);width:min(70%,320px);margin:0 auto 22px">${LOGO_BYC}</div>
        <h1 style="font-size:24px;margin:0 0 6px">${saludo}, ${nombre}.</h1>
        <p class="lead" style="margin:0 0 26px">Bienvenido a tu sistema NUMMEROS by CONTAX. Estás en <b>${escape(ME.role || "")}</b>.</p>
        <div class="kpis" style="max-width:420px;margin:0 auto 26px">
          <div class="kpi"><div class="n">${nCli}</div><div class="l">Clientes</div></div>
          <div class="kpi"><div class="n">${nAct}</div><div class="l">Activos</div></div>
        </div>
        <button class="btn" id="ini_clientes">Ir a Clientes →</button>
      </div>
    </div>`;
  const go = el("ini_clientes");
  if (go) go.onclick = () => { const b = document.querySelector('nav.tabs button[data-v="clientes"]'); if (b && !b.classList.contains("hidden")) switchView("clientes", b); };
}

// ---------- Respuestas rápidas (CRUD + Google Sheets) ----------
let QR = [], qrEditId = null, qrFilter = "", qrCatFilter = "";
function catHue(s) { s = String(s || "General"); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
function catChip(cat) { const l = 82 - (catHue(cat) % 26); return `<span style="background:hsl(0,0%,${l}%);color:#1a1a1a;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">${escape(cat || "General")}</span>`; }
async function loadConfigDoc() { try { const s = await getDoc(doc(db, "config", "app")); return s.exists() ? s.data() : {}; } catch (e) { return {}; } }
async function sheetPush(action, item) {
  const cfg = await loadConfigDoc(); const url = (cfg.sheetUrl || "").trim(); if (!url) return;
  const payload = { action, item: { categoria: item.category || "", nombre: item.title || "", nro: item.nro || "", titulo: item.description || "", respuesta: item.text || "" } };
  try { await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }); } catch (e) {}
}
async function renderRespuestas() {
  const snap = await getDocs(collection(db, "quickReplies"));
  QR = []; snap.forEach(d =>QR.push({ id: d.id, ...d.data() }));
  QR.sort((a, b) => (a.category || "General").localeCompare(b.category || "General") || (Number(a.nro) || 9999) - (Number(b.nro) || 9999) || (a.title || "").localeCompare(b.title || ""));
  const cats = [...new Set(QR.map(q =>q.category || "General"))];
  const term = qrFilter.toLowerCase();
  const list = QR.filter(q => {
    if (qrCatFilter && (q.category || "General") !== qrCatFilter) return false;
    if (term && !`${q.title} ${q.text} ${q.category || ""} ${q.description || ""}`.toLowerCase().includes(term)) return false;
    return true;
  });
  const chips = `<span class="chip ${qrCatFilter === "" ? "on" : ""}" data-c="" style="cursor:pointer;padding:5px 12px;border-radius:20px;font-size:12px;border:1px solid var(--line);${qrCatFilter === "" ? "background:var(--accent);color:var(--accent-ink);font-weight:600" : "color:var(--muted)"}">Todas</span>` +
    cats.map(c => { const on = qrCatFilter === c; return `<span class="chip" data-c="${escape(c)}" style="cursor:pointer;padding:5px 12px;border-radius:20px;font-size:12px;border:1px solid var(--line);background:${on ? "var(--accent)" : "var(--panel2)"};color:${on ? "var(--accent-ink)" : "var(--muted)"};font-weight:600">${escape(c)}</span>`; }).join("");
  const rows = list.map(q => {
    return `<tr style="border-left:4px solid var(--line)">
    <td>${escape(q.nro || "")}</td>
    <td>${catChip(q.category)}</td>
    <td><b>${escape(q.title || "")}</b>${q.image ? '' : ""}${q.description ? `<div style="color:var(--muted);font-size:12px">${escape(q.description)}</div>` : ""}</td>
    <td style="color:var(--muted)">${q.text ? escape(q.text.slice(0, 60)) + (q.text.length > 60 ? "…" : "") : (q.image ? "(solo imagen)" : "")}</td>
    <td style="white-space:nowrap"><button class="mini" data-edit="${q.id}">Editar</button> <button class="mini" data-del="${q.id}">Borrar</button></td></tr>`;
  }).join("");
  el("v-respuestas").innerHTML = `<h1>Respuestas rápidas</h1><p class="lead">Créalas y edítalas aquí; se comparten con todo el equipo (y con el Google Sheet, si está conectado).</p>
    <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <input id="qr_search" class="mini" style="padding:8px;min-width:220px" placeholder="Buscar por nombre o texto…" value="${escape(qrFilter)}">
      <button class="btn" id="qr_new">＋ Nueva respuesta</button>
      <button class="btn sec" id="qr_import" style="border:1px solid var(--line)">Importar de Google Sheets</button>
      <span class="msg" id="qr_msg" style="align-self:center"></span>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${chips}</div>
    <p class="note" style="margin:-6px 0 12px">Los filtros son solo para tu vista; no modifican el Google Sheet.</p>
    <table><thead><tr><th>Nro</th><th>Categoría</th><th>Nombre</th><th>Respuesta</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="color:var(--muted)">Sin respuestas con estos filtros.</td></tr>'}</tbody></table>`;
  el("qr_search").oninput = () => { qrFilter = el("qr_search").value; renderRespuestas(); };
  el("v-respuestas").querySelectorAll(".chip").forEach(c =>c.onclick = () => { qrCatFilter = c.dataset.c; renderRespuestas(); });
  el("qr_new").onclick = () =>openQrModal(null);
  el("qr_import").onclick = importFromSheet;
  el("v-respuestas").querySelectorAll("[data-edit]").forEach(b =>b.onclick = () =>openQrModal(QR.find(x =>x.id === b.dataset.edit)));
  el("v-respuestas").querySelectorAll("[data-del]").forEach(b =>b.onclick = async () => {
    const q = QR.find(x =>x.id === b.dataset.del); if (!q) return;
    await deleteDoc(doc(db, "quickReplies", q.id)); await sheetPush("delete", q); renderRespuestas();
  });
}
function qrWrapSel(ta, a, b) {
  b = b || a;
  const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
  const sel = v.slice(s, e) || "texto";
  ta.value = v.slice(0, s) + a + sel + b + v.slice(e);
  ta.focus();
  ta.selectionStart = s + a.length; ta.selectionEnd = s + a.length + sel.length;
}
function openQrModal(q) {
  qrEditId = q ? q.id : null;
  let curImage = q && q.image ? q.image : "";
  const cats = [...new Set(QR.map(x =>x.category || "General"))];
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px;width:640px;max-width:96vw;max-height:92vh;overflow-y:auto">
    <h3 style="margin:0 0 16px">${q ? "Editar" : "Nueva"} respuesta</h3>
    <div class="grid2">
      <div class="field"><label>Nro</label><input id="f_nro" value="${escape(q ? q.nro || "" : "")}"></div>
      <div class="field"><label>Categoría</label><input id="f_cat" value="${escape(q ? q.category || "" : "")}" placeholder="Ventas" list="f_catlist"><datalist id="f_catlist">${cats.map(c => `<option value="${escape(c)}">`).join("")}</datalist></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Nombre de la respuesta</label><input id="f_title" value="${escape(q ? q.title || "" : "")}" placeholder="Saludo"></div>
      <div class="field"><label>Descripción breve</label><input id="f_desc" value="${escape(q ? q.description || "" : "")}" placeholder="De qué trata"></div>
    </div>
    <div class="field">
      <label>Respuesta</label>
      <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">
        <button type="button" class="mini" id="f_b" title="Negrita (WhatsApp)"><b>N</b></button>
        <button type="button" class="mini" id="f_i" title="Cursiva"><i>C</i></button>
        <button type="button" class="mini" id="f_s" title="Tachado"><s>T</s></button>
        <span class="note" style="align-self:center">Selecciona texto y aplica formato. En WhatsApp se ve *negrita*, _cursiva_, ~tachado~.</span>
      </div>
      <textarea id="f_text" style="min-height:200px;font-size:14px;line-height:1.6;white-space:pre-wrap">${escape(q ? q.text || "" : "")}</textarea>
    </div>
    <div class="field">
      <label>Imagen (opcional) — p. ej. tu QR de pago</label>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button type="button" class="btn sec" id="f_imgbtn" style="border:1px solid var(--line)">Elegir imagen</button>
        <button type="button" class="mini" id="f_imgclear" style="${curImage ? "" : "display:none"}">Quitar</button>
        <span class="note" id="f_imgnote">Se guarda junto a la respuesta. En el CRM podrás copiarla y pegarla en el chat.</span>
      </div>
      <img id="f_imgprev" src="${curImage || ""}" style="${curImage ? "" : "display:none;"}max-width:160px;max-height:160px;margin-top:10px;border:1px solid var(--line);border-radius:8px">
      <input type="file" id="f_imgfile" accept="image/*" style="display:none">
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn sec" id="f_cancel" style="border:1px solid var(--line)">Cancelar</button><button class="btn" id="f_save">Guardar</button></div>
    <div class="msg" id="f_msg"></div>
  </div>`;
  document.body.appendChild(bg);
  const close = () =>bg.remove();
  const $ = s =>bg.querySelector(s);
  bg.onclick = (e) => { if (e.target === bg) close(); };
  $("#f_cancel").onclick = close;
  const ta = $("#f_text");
  $("#f_b").onclick = () =>qrWrapSel(ta, "*");
  $("#f_i").onclick = () =>qrWrapSel(ta, "_");
  $("#f_s").onclick = () =>qrWrapSel(ta, "~");
  // Imagen: elegir, comprimir a PNG y previsualizar
  $("#f_imgbtn").onclick = () => $("#f_imgfile").click();
  $("#f_imgclear").onclick = () => { curImage = ""; $("#f_imgprev").style.display = "none"; $("#f_imgprev").src = ""; $("#f_imgclear").style.display = "none"; $("#f_imgnote").textContent = "Imagen quitada."; };
  $("#f_imgfile").onchange = () => {
    const file = $("#f_imgfile").files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        curImage = cv.toDataURL("image/png");
        $("#f_imgprev").src = curImage; $("#f_imgprev").style.display = "";
        $("#f_imgclear").style.display = "";
        const kb = Math.round(curImage.length * 0.75 / 1024);
        $("#f_imgnote").textContent = kb > 700 ? `Imagen pesada (~${kb} KB). Usa uno más liviano si falla al guardar.` : `Imagen lista (~${kb} KB).`;
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  };
  $("#f_save").onclick = async () => {
    const item = { nro: $("#f_nro").value.trim(), category: $("#f_cat").value.trim() || "General", title: $("#f_title").value.trim(), description: $("#f_desc").value.trim(), text: $("#f_text").value.replace(/\s+$/, "") };
    item.image = curImage || "";
    if (!item.title) { $("#f_msg").className = "msg err"; $("#f_msg").textContent = "Ponle un nombre a la respuesta."; return; }
    if (!item.text && !item.image) { $("#f_msg").className = "msg err"; $("#f_msg").textContent = "Agrega texto o una imagen."; return; }
    $("#f_save").disabled = true; $("#f_msg").className = "msg"; $("#f_msg").textContent = "Guardando…";
    try {
      if (qrEditId) await updateDoc(doc(db, "quickReplies", qrEditId), item);
      else await setDoc(doc(collection(db, "quickReplies")), item);
      await sheetPush("upsert", item);
      close(); renderRespuestas();
    } catch (e) { $("#f_save").disabled = false; $("#f_msg").className = "msg err"; $("#f_msg").textContent = "Error al guardar" + (String(e).includes("longer than") || String(e).includes("bytes") ? ": la imagen es muy grande. Usa una más liviana." : ": " + (e.code || e.message)); }
  };
}
function importFromSheet() {
  const msg = el("qr_msg"); msg.className = "msg";
  loadConfigDoc().then(cfg => {
    const url = (cfg.sheetUrl || "").trim();
    if (!url) { msg.className = "msg err"; msg.textContent = "Primero pon la URL del puente en Configuración."; return; }
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
function statusLabel(s) { return ({ nuevo: "Nuevo", proceso: "En proceso", cerrado: "Cerrado" })[s] || "— sin estado —"; }
async function renderBandeja() {
  await loadAll();
  const agents = USERS.filter(u =>u.active);
  const allLabels = [...new Set(CHATS.flatMap(c =>c.labels || []))].sort();
  const chats = CHATS.map(c =>c).filter(c => {
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
    <td>${(c.labels || []).map(t => `<span class="pill" style="background:var(--panel2);color:var(--txt);border:1px solid var(--line)">${escape(t)}</span>`).join(" ")}</td>
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
  const totalToday = USERS.reduce((s, u) =>s + (Number((u.dailyMinutes || {})[today]) || 0), 0);
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
    const week7 = Object.keys(dm).filter(k =>days.includes(k)).reduce((s, k) =>s + (Number(dm[k]) || 0), 0);
    const month = Object.keys(dm).filter(k =>k.startsWith(monthKey)).reduce((s, k) =>s + (Number(dm[k]) || 0), 0);
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
  const cerrados = CHATS.filter(c =>c.status === "cerrado").length;
  const pendientes = CHATS.filter(c =>c.status === "nuevo" || c.status === "proceso").length;
  const sinAsignar = CHATS.filter(c => !c.assignedTo).length;
  const by = {};
  USERS.forEach(u =>by[u.uid] = { name: u.name || u.email, role: u.role, asignados: 0, cerrados: 0, pendientes: 0 });
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
  // PINs guardados (caja privada, solo admin). Si no es admin, no se cargan.
  const PINS = {};
  if (ME.role === "admin") {
    try { (await getDocs(collection(db, "userPins"))).forEach(d => { PINS[d.id] = (d.data() || {}).pin || ""; }); } catch (e) {}
  }
  const isAdmin = ME.role === "admin";
  const rows = USERS.map(u => {
    const pin = PINS[u.uid] || "";
    const pinCell = isAdmin
      ? `<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
           <input class="mini pin-in" data-uid="${u.uid}" type="password" value="${escape(pin)}" placeholder="—" style="width:110px">
           <span class="reveal mini pin-eye" data-uid="${u.uid}" title="Mostrar/ocultar"></span>
           <button class="mini pin-save" data-uid="${u.uid}" title="Solo anota el PIN aquí (no cambia la contraseña)">Anotar</button>
           <button class="mini pin-reset" data-uid="${u.uid}" data-email="${escape(u.email || "")}" title="Enviar correo para cambiar la contraseña de verdad">Restablecer</button>
         </div>`
      : `<span style="color:var(--muted)">—</span>`;
    return `<tr>
    <td>${escape(u.name || "—")}<div style="color:var(--muted);font-size:12px">${escape(u.email || "")}</div></td>
    <td><select class="mini role-sel" data-uid="${u.uid}" ${u.uid === ME.uid ? "disabled" : ""}>
      <option value="agent" ${u.role === "agent" ? "selected" : ""}>Agente</option>
      <option value="supervisor" ${u.role === "supervisor" ? "selected" : ""}>Supervisor</option>
      <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option></select></td>
    <td>${pinCell}</td>
    <td>${u.active ? '<span class="pill agent">Activo</span>' : '<span class="pill" style="background:var(--panel2);color:var(--muted);border:1px solid var(--line)">Inactivo</span>'}</td>
    <td>${u.uid === ME.uid ? "" : `<button class="mini" data-toggle="${u.uid}" data-s="${u.active}">${u.active ? "Desactivar" : "Activar"}</button>`}</td></tr>`;
  }).join("");
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
    <table><thead><tr><th>Usuario</th><th>Rol</th><th>PIN / Contraseña</th><th>Estado</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    ${isAdmin ? `<div class="note" style="margin-top:12px;line-height:1.6">
      <b>PIN / Contraseña</b> = tu <b>cuaderno privado</b> (solo lo ve el admin). Firebase cifra la contraseña real y nadie la puede leer, así que aquí solo la <b>anotas</b>para recordarla. <b>Anotar NO cambia la contraseña.</b><br>
      <b>¿Alguien olvidó su contraseña?</b>Toca <b>Restablecer</b>: le llega un correo a esa cuenta con un enlace para poner una nueva. Cuando la ponga, anótala aquí con el para tenerla a mano.<br>
      <span style="color:var(--muted)">Nota: para crear usuarios nuevos, el PIN que escribes sí es el de acceso desde el inicio. El problema es solo con los usuarios viejos cuya contraseña ya nadie recuerda.</span>
    </div>` : ""}`;

  el("u_create").onclick = async () => {
    const name = el("u_name").value.trim(), email = el("u_email").value.trim(), pin = el("u_pin").value, role = el("u_role").value;
    const msg = el("u_msg"); msg.className = "msg";
    if (!name || !email || pin.length < 6) { msg.className = "msg err"; msg.textContent = "Completa nombre, correo y un PIN de 6+ caracteres."; return; }
    el("u_create").disabled = true; msg.textContent = "Creando…";
    try {
      const cred = await createUserWithEmailAndPassword(auth2, email, pin);
      await setDoc(doc(db, "users", cred.user.uid), { name, email, role, active: true, signature: "", createdAt: serverTimestamp() });
      try { await setDoc(doc(db, "userPins", cred.user.uid), { pin, email, updatedAt: serverTimestamp() }); } catch (e) {}
      await signOut(auth2);
      msg.className = "msg ok"; msg.textContent = "✓ Usuario creado. Dale su correo y PIN.";
      el("u_name").value = ""; el("u_email").value = ""; el("u_pin").value = "";
      renderUsers();
    } catch (e) {
      msg.className = "msg err";
      msg.textContent = e.code === "auth/email-already-in-use" ? "Ese correo ya está registrado." : ("Error: " + (e.code || e.message));
    } finally { el("u_create").disabled = false; }
  };
  document.querySelectorAll(".role-sel").forEach(s =>s.onchange = async () => { await updateDoc(doc(db, "users", s.dataset.uid), { role: s.value }); renderUsers(); });
  document.querySelectorAll("[data-toggle]").forEach(b =>b.onclick = async () => { await updateDoc(doc(db, "users", b.dataset.toggle), { active: b.dataset.s !== "true" }); renderUsers(); });
  document.querySelectorAll(".pin-eye").forEach(e =>e.onclick = () => { const i = el("v-users").querySelector(`.pin-in[data-uid="${e.dataset.uid}"]`); if (i) i.type = i.type === "password" ? "text" : "password"; });
  document.querySelectorAll(".pin-save").forEach(b =>b.onclick = async () => {
    const uid = b.dataset.uid, i = el("v-users").querySelector(`.pin-in[data-uid="${uid}"]`);
    const u = USERS.find(x =>x.uid === uid) || {};
    b.disabled = true; b.textContent = "…";
    try { await setDoc(doc(db, "userPins", uid), { pin: i.value, email: u.email || "", updatedAt: serverTimestamp() }, { merge: true }); b.textContent = "✓"; setTimeout(() => { b.textContent = "Anotar"; b.disabled = false; }, 1200); }
    catch (e) { b.textContent = "Error"; b.disabled = false; }
  });
  document.querySelectorAll(".pin-reset").forEach(b =>b.onclick = async () => {
    const email = b.dataset.email;
    if (!email) { alert("Ese usuario no tiene correo registrado."); return; }
    if (!confirm(`Se enviará un correo a:\n${email}\n\ncon un enlace para poner una nueva contraseña. La persona (o quien tenga acceso a ese correo) debe abrirlo y elegir la nueva contraseña.\n\n¿Enviar ahora?`)) return;
    b.disabled = true; const o = b.textContent; b.textContent = "Enviando…";
    try { await sendPasswordResetEmail(auth, email); b.textContent = "✓ Enviado"; setTimeout(() => { b.textContent = o; b.disabled = false; }, 2500); }
    catch (e) { b.textContent = "Error"; b.disabled = false; alert("No se pudo enviar: " + (e.code || e.message)); }
  });
}

// ---------- Configuración IA ----------
const AI_MODELS = {
  deepseek: [["deepseek-chat", "deepseek-chat (recomendado)"], ["deepseek-reasoner", "deepseek-reasoner (razonamiento)"]],
  gemini: [["gemini-2.5-flash", "gemini-2.5-flash (recomendado)"], ["gemini-2.5-pro", "gemini-2.5-pro (más potente)"], ["gemini-flash-latest", "gemini-flash-latest (siempre el más nuevo)"], ["gemini-2.0-flash", "gemini-2.0-flash (antiguo)"]]
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
      <h3 style="margin:0 0 6px">Clave de Gemini para leer comprobantes (opcional)</h3>
      <p class="note" style="margin:0 0 12px">Si tu IA principal (arriba) es DeepSeek, DeepSeek no puede leer imágenes. Pega aquí una clave de <b>Gemini</b>(empieza con <code>AIza</code>) que se usará <b>solo</b>para el lector de comprobantes del CRM. Todo lo demás sigue con la IA principal.</p>
      <label>Clave de Gemini (solo lector de comprobantes)</label>
      <input id="c_vision" type="password" placeholder="AIza… (déjalo vacío si tu IA principal ya es Gemini)" value="${escape(cfg.visionKey || "")}">
      <button class="btn" id="c_visionsave">Guardar clave de comprobantes</button>
      <div class="msg" id="c_visionmsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Datos de la empresa</h3>
      <p class="note" style="margin:0 0 12px">El nombre se usa en la variable <code>{empresa}</code>de las respuestas rápidas.</p>
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
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Base de Datos (Google Sheets · BDCONTAX)</h3>
      <p class="note" style="margin:0 0 12px">Pega la URL del "puente" (Apps Script) conectado a tu hoja <b>BDCONTAX</b>.
      Con esto la pestaña <b>Base de Datos</b>lee y guarda directamente en tu Google Sheet (el Sheet sigue siendo la fuente principal).
      Sigue la guía <b>GUIA-BASE-DE-DATOS.md</b>.</p>
      <label>URL del puente de la Base de Datos (…/exec)</label>
      <input id="c_bdurl" placeholder="https://script.google.com/macros/s/…/exec" value="${escape(cfg.bdUrl || "")}">
      <button class="btn" id="c_bdsave">Guardar URL</button>
      <div class="msg" id="c_bdmsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Recibos por correo (Gmail CONTAX)</h3>
      <p class="note" style="margin:0 0 12px">Pega la URL del "puente" de recibos (Apps Script <b>PUENTE-RECIBOS.gs</b>) publicado desde la cuenta de Gmail de CONTAX.
      Con esto la pestaña <b>Recepción</b>envía automáticamente el recibo en PDF al correo del cliente cuando registras un pago.
      Si lo dejas vacío, igual se registra el pago pero no se envía el correo.</p>
      <label>URL del puente de Recibos (…/exec)</label>
      <input id="c_recibos" placeholder="https://script.google.com/macros/s/…/exec" value="${escape(cfg.recibosUrl || "")}">
      <button class="btn" id="c_recibossave">Guardar URL</button>
      <div class="msg" id="c_recibosmsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Recepción — Numeración automática</h3>
      <p class="note" style="margin:0 0 12px">Define desde qué número siguen el <b>N° de Recepción</b>y el <b>N° de Comprobante/Recibo</b>, y el <b>N° de Gasto</b>(Egresos). El sistema usa el número y sube +1 solo en cada registro.</p>
      <div class="grid3">
        <div class="field"><label>Próximo N° Recepción</label><input id="c_nrec" type="number" value="${escape(String(cfg.nextRecep != null ? cfg.nextRecep : 7048))}"></div>
        <div class="field"><label>Próximo N° Comprobante</label><input id="c_ncom" type="number" value="${escape(String(cfg.nextRecibo != null ? cfg.nextRecibo : 7784))}"></div>
        <div class="field"><label>Próximo N° Gasto (Egresos)</label><input id="c_ngas" type="number" value="${escape(String(cfg.nextGasto != null ? cfg.nextGasto : 1002))}"></div>
      </div>
      <button class="btn" id="c_numsave">Guardar numeración</button>
      <div class="msg" id="c_nummsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Recepción — Listas desplegables</h3>
      <p class="note" style="margin:0 0 12px">Un valor por línea. Estas listas aparecen en Recepción y Egresos. Si dejas una vacía, se usan los valores por defecto.</p>
      <div class="grid2">
        <div class="field"><label>Servicios (SERVICIOS CONTAX)</label><textarea id="c_l_servicios" style="min-height:120px">${escape((recListas(cfg).servicios).join("\n"))}</textarea></div>
        <div class="field"><label>Detalle de servicio (Tipo)</label><textarea id="c_l_detalles" style="min-height:120px">${escape((recListas(cfg).detalles).join("\n"))}</textarea></div>
      </div>
      <div class="grid3">
        <div class="field"><label>Formas de pago</label><textarea id="c_l_pagos" style="min-height:90px">${escape((recListas(cfg).pagos).join("\n"))}</textarea></div>
        <div class="field"><label>Atención (personas)</label><textarea id="c_l_atencion" style="min-height:90px">${escape((recListas(cfg).atencion).join("\n"))}</textarea></div>
        <div class="field"><label>Cuentas contables (Egresos)</label><textarea id="c_l_cuentas" style="min-height:90px">${escape((recListas(cfg).cuentas).join("\n"))}</textarea></div>
      </div>
      <button class="btn" id="c_listsave">Guardar listas</button>
      <div class="msg" id="c_listmsg"></div>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">Conocimiento de la empresa (para la IA)</h3>
      <p class="note" style="margin:0 0 12px">Escribe aquí todo lo que la IA debe saber de tu empresa: qué es CONTAX, servicios y precios,
      formas de pago, horarios, procedimientos, tono de respuesta, datos de contacto, preguntas frecuentes, etc.
      La IA usará esto como base en <b>Consultar</b>, <b>Sugerir</b>, <b>Mejorar</b>y <b>Resumir</b>, para todo el equipo.</p>
      <textarea id="c_context" style="width:100%;min-height:220px;padding:12px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt);font-size:13px;line-height:1.5;font-family:inherit" placeholder="Ej:
CONTAX es una empresa de contabilidad e impuestos en Santa Cruz, Bolivia.
Servicios: declaraciones mensuales, RCV, balances, trámites SEPREC/SIAT, emisión y verificación de facturas, asesoramiento.
Precios: declaración mensual desde Bs 50; balance desde Bs …
Formas de pago: QR / transferencia. Enviar comprobante por WhatsApp.
Horario: Lun-Vie 8:30-18:00.
Tono: cordial, claro y profesional. Tratar de 'usted'.
Contacto: …">${escape(cfg.aiContext || "")}</textarea>
      <button class="btn" id="c_ctxsave">Guardar conocimiento</button>
      <div class="msg" id="c_ctxmsg"></div>
    </div>`;
  const provSel = el("c_provider"); provSel.value = provider;
  function fillModels() {
    const p = provSel.value;
    el("c_model").innerHTML = AI_MODELS[p].map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
    if (curModel && AI_MODELS[p].some(m =>m[0] === curModel)) el("c_model").value = curModel;
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
  el("c_visionsave").onclick = async () => {
    const msg = el("c_visionmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { visionKey: el("c_vision").value.trim(), updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ Clave guardada. El lector de comprobantes ya puede usarla."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
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
  el("c_bdsave").onclick = async () => {
    const msg = el("c_bdmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { bdUrl: el("c_bdurl").value.trim(), updatedAt: serverTimestamp() }, { merge: true }); bdUrlCache = ""; bdLoaded = false; msg.className = "msg ok"; msg.textContent = "✓ URL guardada. Abre la pestaña Base de Datos."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_recibossave").onclick = async () => {
    const msg = el("c_recibosmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { recibosUrl: el("c_recibos").value.trim(), updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ URL guardada. La pestaña Recepción ya puede enviar recibos."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_numsave").onclick = async () => {
    const msg = el("c_nummsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { nextRecep: parseInt(el("c_nrec").value, 10) || 1, nextRecibo: parseInt(el("c_ncom").value, 10) || 1, nextGasto: parseInt(el("c_ngas").value, 10) || 1, updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ Numeración guardada."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_listsave").onclick = async () => {
    const msg = el("c_listmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    const toArr = id => el(id).value.split("\n").map(s => s.trim()).filter(Boolean);
    const recListasVal = { servicios: toArr("c_l_servicios"), detalles: toArr("c_l_detalles"), pagos: toArr("c_l_pagos"), atencion: toArr("c_l_atencion"), cuentas: toArr("c_l_cuentas") };
    try { await setDoc(doc(db, "config", "app"), { recListas: recListasVal, updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ Listas guardadas. Ya aparecen en Recepción y Egresos."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
  el("c_ctxsave").onclick = async () => {
    const msg = el("c_ctxmsg"); msg.className = "msg"; msg.textContent = "Guardando…";
    try { await setDoc(doc(db, "config", "app"), { aiContext: el("c_context").value, updatedAt: serverTimestamp() }, { merge: true }); msg.className = "msg ok"; msg.textContent = "✓ Conocimiento guardado. La IA ya lo usa para todo el equipo."; }
    catch (e) { msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
  };
}

// ============================================================
//  MÓDULO CLIENTES (Portal) — base de datos BDCONTAX en Firebase
// ============================================================
let CLIENTES = [], cliFilter = "", cliEstado = "", cliTipo = "";

// Campos del cliente (clave interna, etiqueta, grupo, tipo)
const CLI_FIELDS = [
  ["codigoId", "Código ID", "Cliente", "text"],
  ["nit", "NIT", "Cliente", "text"],
  ["nombre", "Nombre o Razón Social", "Cliente", "text"],
  ["telefono", "Teléfono", "Cliente", "text"],
  ["correo", "Correo electrónico", "Cliente", "text"],
  ["tipoContribuyente", "Tipo de contribuyente", "Actividad", "text"],
  ["actividadPrincipal", "Actividad principal", "Actividad", "text"],
  ["actividadSecundaria", "Actividad secundaria", "Actividad", "text"],
  ["brindaServiciosA", "Brinda servicios a", "Actividad", "text"],
  ["fechaAperturaNit", "Fecha apertura NIT", "Actividad", "text"],
  ["usuario", "Usuario (impuestos)", "Actividad", "text"],
  ["password", "Contraseña (impuestos)", "Actividad", "secret"],
  ["passwordSiat", "Contraseña SIAT", "Actividad", "secret"],
  ["inicioCapital", "Inicio de capital", "SEPREC", "text"],
  ["estadoMatricula", "Estado de la matrícula SEPREC", "SEPREC", "text"],
  ["correoSeprec", "Correo SEPREC", "SEPREC", "text"],
  ["usuarioSeprec", "Usuario SEPREC", "SEPREC", "text"],
  ["passwordSeprec", "Contraseña SEPREC", "SEPREC", "secret"],
  ["contratosServicio", "Contratos de servicio", "Adicionales", "text"],
  ["estadoUsuario", "Estado del cliente", "Adicionales", "estado"],
  ["costoMensual", "Costo servicio mensual (Bs)", "Adicionales", "text"],
  ["fileUrl", "Carpeta / archivos (Drive URL)", "Adicionales", "text"],
  ["comentarios", "Comentarios", "Adicionales", "textarea"]
];
const CLI_GROUPS = ["Cliente", "Actividad", "SEPREC", "Adicionales"];

function cliIsActivo(c) { return /^activo/i.test(String(c.estadoUsuario || "").trim()); }
function cliMoney(v) {
  let s = String(v == null ? "" : v).replace(/\s/g, "");
  s = s.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}
function fmtBs(n) { return "Bs " + (Number(n) || 0).toLocaleString("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }

async function loadClientes() {
  CLIENTES = [];
  try { (await getDocs(collection(db, "clientes"))).forEach(d =>CLIENTES.push({ id: d.id, ...d.data() })); } catch (e) {}
  CLIENTES.sort((a, b) => (Number(a.codigoId) || 9e9) - (Number(b.codigoId) || 9e9) || String(a.nombre || "").localeCompare(String(b.nombre || "")));
}

async function renderClientes() {
  await loadClientes();
  const canEdit = canEditClientes();
  const isAdmin = ME.role === "admin";
  const term = cliFilter.toLowerCase().trim();
  const tipos = [...new Set(CLIENTES.map(c => (c.tipoContribuyente || "").trim()).filter(Boolean))].sort();
  const estados = [...new Set(CLIENTES.map(c => (c.estadoUsuario || "").trim()).filter(Boolean))].sort();
  const list = CLIENTES.filter(c => {
    if (cliEstado === "__activo" && !cliIsActivo(c)) return false;
    if (cliEstado === "__inactivo" && cliIsActivo(c)) return false;
    if (cliEstado && cliEstado.indexOf("__") !== 0 && (c.estadoUsuario || "").trim() !== cliEstado) return false;
    if (cliTipo && (c.tipoContribuyente || "").trim() !== cliTipo) return false;
    if (term && !`${c.codigoId} ${c.nit} ${c.nombre} ${c.telefono} ${c.correo} ${c.actividadPrincipal}`.toLowerCase().includes(term)) return false;
    return true;
  });
  const total = CLIENTES.length;
  const activos = CLIENTES.filter(cliIsActivo).length;
  const ingreso = CLIENTES.filter(cliIsActivo).reduce((s, c) =>s + cliMoney(c.costoMensual), 0);

  const rows = list.map(c => `<tr class="clienterow" data-open="${c.id}" style="cursor:pointer">
    <td>${escape(c.codigoId || "—")}</td>
    <td><b>${escape(c.nombre || "—")}</b>${c.nit ? `<div style="color:var(--muted);font-size:12px">NIT ${escape(c.nit)}</div>` : ""}</td>
    <td>${escape(c.telefono || "—")}</td>
    <td>${escape((c.tipoContribuyente || "—"))}</td>
    <td><span class="badge ${cliIsActivo(c) ? "ok" : "off"}">${escape(c.estadoUsuario || "—")}</span></td>
    <td style="text-align:right">${c.costoMensual ? escape(String(c.costoMensual)) : "—"}</td>
    <td style="white-space:nowrap" data-stop="1">
      <button class="mini" data-edit="${c.id}">${canEdit ? "Editar" : "Ver"}</button>
      ${isAdmin ? `<button class="mini" data-del="${c.id}">Borrar</button>` : ""}
    </td></tr>`).join("");

  el("v-clientes").innerHTML = `<h1>Clientes</h1>
    <p class="lead">Tu base de datos de clientes (BDCONTAX), guardada en Firebase y compartida con tu equipo según su rol.</p>
    <div class="kpis">
      <div class="kpi"><div class="n">${total}</div><div class="l">Clientes registrados</div></div>
      <div class="kpi"><div class="n" style="color:var(--green)">${activos}</div><div class="l">Activos</div></div>
      <div class="kpi"><div class="n" style="color:var(--warn)">${total - activos}</div><div class="l">Inactivos</div></div>
      <div class="kpi"><div class="n">${fmtBs(ingreso)}</div><div class="l">Ingreso mensual (activos)</div></div>
    </div>
    <div class="toolbar">
      <input id="cli_search" class="mini" style="padding:9px;min-width:240px" placeholder="Buscar por nombre, NIT, código, teléfono…" value="${escape(cliFilter)}">
      <select id="cli_estado" class="mini" style="padding:9px">
        <option value="">Todos los estados</option>
        <option value="__activo">Solo activos</option>
        <option value="__inactivo">Solo inactivos</option>
        ${estados.map(e => `<option value="${escape(e)}">${escape(e)}</option>`).join("")}
      </select>
      <select id="cli_tipo" class="mini" style="padding:9px">
        <option value="">Todos los tipos</option>
        ${tipos.map(t => `<option value="${escape(t)}">${escape(t)}</option>`).join("")}
      </select>
      ${canEdit ? '<button class="btn" id="cli_new">＋ Nuevo cliente</button>' : ""}
      ${canEdit ? '<button class="btn sec" id="cli_import" style="border:1px solid var(--line)">Importar CSV</button>' : ""}
      <button class="btn sec" id="cli_export" style="border:1px solid var(--line)">Exportar CSV</button>
      <span class="msg" id="cli_msg" style="align-self:center"></span>
    </div>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>Código</th><th>Cliente</th><th>Teléfono</th><th>Tipo</th><th>Estado</th><th style="text-align:right">Costo/mes</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" style="color:var(--muted)">${total ? "Sin clientes con estos filtros." : "Aún no hay clientes. Usa “Importar CSV” para cargar tu base, o “＋ Nuevo cliente”."}</td></tr>`}</tbody>
    </table></div>
    <p class="note" style="margin-top:10px">Mostrando ${list.length} de ${total}. Toca una fila para ver la ficha completa.</p>`;

  el("cli_search").oninput = () => { cliFilter = el("cli_search").value; renderClientes(); };
  el("cli_estado").value = cliEstado; el("cli_estado").onchange = () => { cliEstado = el("cli_estado").value; renderClientes(); };
  el("cli_tipo").value = cliTipo; el("cli_tipo").onchange = () => { cliTipo = el("cli_tipo").value; renderClientes(); };
  if (el("cli_new")) el("cli_new").onclick = () =>openClienteModal(null);
  if (el("cli_import")) el("cli_import").onclick = importClientesCSV;
  el("cli_export").onclick = exportClientesCSV;
  el("v-clientes").querySelectorAll("[data-edit]").forEach(b =>b.onclick = (e) => { e.stopPropagation(); openClienteModal(CLIENTES.find(x =>x.id === b.dataset.edit)); });
  el("v-clientes").querySelectorAll("[data-del]").forEach(b =>b.onclick = (e) => { e.stopPropagation(); delCliente(CLIENTES.find(x =>x.id === b.dataset.del)); });
  el("v-clientes").querySelectorAll("[data-open]").forEach(r =>r.onclick = () =>openClienteModal(CLIENTES.find(x =>x.id === r.dataset.open)));
}

function openClienteModal(c) {
  const canEdit = canEditClientes();
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const groupsHtml = CLI_GROUPS.map(g => {
    const fields = CLI_FIELDS.filter(f =>f[2] === g);
    const inputs = fields.map(([key, label, , type]) => {
      const val = escape(c ? (c[key] != null ? c[key] : "") : "");
      const dis = canEdit ? "" : "disabled";
      if (type === "textarea") return `<div class="field" style="grid-column:1/-1"><label>${label}</label><textarea id="cf_${key}" style="min-height:70px" ${dis}>${val}</textarea></div>`;
      if (type === "secret") return `<div class="field"><label>${label}</label><input id="cf_${key}" type="password" value="${val}" ${dis}><span class="reveal note" data-rev="cf_${key}" style="font-size:11px">mostrar</span></div>`;
      if (type === "estado") return `<div class="field"><label>${label}</label><input id="cf_${key}" value="${val}" list="cf_estlist" placeholder="ACTIVO" ${dis}></div>`;
      return `<div class="field"><label>${label}</label><input id="cf_${key}" value="${val}" ${dis}></div>`;
    }).join("");
    return `<div class="fs">${g}</div><div class="grid2">${inputs}</div>`;
  }).join("");
  const estOpts = [...new Set(CLIENTES.map(x => (x.estadoUsuario || "").trim()).filter(Boolean))];
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px;width:760px;max-width:96vw;max-height:92vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3 style="margin:0">${c ? (canEdit ? "Editar cliente" : "Ficha del cliente") : "Nuevo cliente"}</h3>
      <button class="mini" id="cf_x">✕</button>
    </div>
    <datalist id="cf_estlist">${estOpts.map(e => `<option value="${escape(e)}">`).join("")}</datalist>
    ${groupsHtml}
    ${c && c.fileUrl ? `<div class="note" style="margin-top:10px"><a href="${escape(c.fileUrl)}" target="_blank" style="color:var(--green)">Abrir carpeta de archivos</a></div>` : ""}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
      <button class="btn sec" id="cf_cancel" style="border:1px solid var(--line)">Cerrar</button>
      ${canEdit ? '<button class="btn" id="cf_save">Guardar</button>' : ""}
    </div>
    <div class="msg" id="cf_msg"></div>`;
  document.body.appendChild(bg);
  const close = () =>bg.remove();
  bg.onclick = (e) => { if (e.target === bg) close(); };
  bg.querySelector("#cf_x").onclick = close;
  bg.querySelector("#cf_cancel").onclick = close;
  bg.querySelectorAll("[data-rev]").forEach(s =>s.onclick = () => { const i = bg.querySelector("#" + s.dataset.rev); if (i) { i.type = i.type === "password" ? "text" : "password"; s.textContent = i.type === "password" ? "mostrar" : "ocultar"; } });
  const saveBtn = bg.querySelector("#cf_save");
  if (saveBtn) saveBtn.onclick = async () => {
    const data = {};
    CLI_FIELDS.forEach(([key]) => { const i = bg.querySelector("#cf_" + key); data[key] = i ? i.value.trim() : ""; });
    const msg = bg.querySelector("#cf_msg"); msg.className = "msg";
    if (!data.nombre) { msg.className = "msg err"; msg.textContent = "El nombre o razón social es obligatorio."; return; }
    saveBtn.disabled = true; msg.textContent = "Guardando…";
    data.updatedAt = serverTimestamp();
    try {
      if (c) { await updateDoc(doc(db, "clientes", c.id), data); }
      else {
        data.createdAt = serverTimestamp(); data.createdBy = ME.uid;
        const id = data.codigoId ? ("id" + String(data.codigoId).replace(/[^\w-]/g, "")) : null;
        if (id) await setDoc(doc(db, "clientes", id), data, { merge: true });
        else await setDoc(doc(collection(db, "clientes")), data);
      }
      close(); renderClientes();
    } catch (e) { msg.className = "msg err"; saveBtn.disabled = false; msg.textContent = "Error: " + (e.code || e.message); }
  };
}

async function delCliente(c) {
  if (!c) return;
  if (!confirm(`¿Eliminar al cliente "${c.nombre || c.codigoId}"?\nEsta acción no se puede deshacer.`)) return;
  try { await deleteDoc(doc(db, "clientes", c.id)); renderClientes(); }
  catch (e) { const m = el("cli_msg"); if (m) { m.className = "msg err"; m.textContent = "Error al borrar: " + (e.code || e.message); } }
}

// ---------- CSV: parser robusto (comillas, comas y saltos de línea) ----------
function parseCSV(text) {
  const rows = []; let row = [], field = "", i = 0, q = false;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  while (i < text.length) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += ch;
    }
    i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}
// mapea encabezado → clave interna
function headerToKey(h) {
  const raw = String(h || "").trim();
  const m = raw.match(/^\s*(\d+)\s*[.\-)]/);
  const byNum = { 1: "codigoId", 2: "nit", 3: "nombre", 4: "telefono", 5: "correo", 6: "tipoContribuyente", 7: "actividadPrincipal", 8: "actividadSecundaria", 9: "brindaServiciosA", 10: "fechaAperturaNit", 11: "usuario", 12: "password", 13: "inicioCapital", 14: "estadoMatricula", 15: "correoSeprec", 16: "passwordSeprec", 17: "usuarioSeprec", 18: "contratosServicio", 19: "comentarios", 20: "estadoUsuario", 21: "costoMensual", 22: "fileUrl" };
  if (m && byNum[m[1]]) return byNum[m[1]];
  const n = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("siat")) return "passwordSiat";
  if (n === "nombre" || n.includes("razon social")) return "nombre";
  if (n.includes("codigo")) return "codigoId";
  if (n === "nit") return "nit";
  if (n.includes("telefono")) return "telefono";
  if (n.includes("correo") && n.includes("seprec")) return "correoSeprec";
  if (n.includes("correo")) return "correo";
  if (n.includes("estado") && n.includes("usuario")) return "estadoUsuario";
  if (n.includes("costo")) return "costoMensual";
  return null;
}
function importClientesCSV() {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = ".csv,text/csv,text/plain";
  inp.onchange = () => {
    const file = inp.files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = async () => {
      const msg = el("cli_msg"); msg.className = "msg";
      try {
        const rows = parseCSV(String(rd.result)).filter(r =>r.some(x => (x || "").trim() !== ""));
        if (rows.length < 2) { msg.className = "msg err"; msg.textContent = "El archivo no tiene datos."; return; }
        const header = rows[0].map(headerToKey);
        if (!header.includes("nombre")) { msg.className = "msg err"; msg.textContent = "No encontré la columna de Nombre/Razón Social. ¿Exportaste la hoja BDCONTAX con sus encabezados?"; return; }
        const existingByCode = {}; CLIENTES.forEach(c => { if (c.codigoId) existingByCode[String(c.codigoId)] = c; });
        let ok = 0, skip = 0;
        for (let r = 1; r < rows.length; r++) {
          const rowArr = rows[r]; const data = {};
          header.forEach((k, idx) => { if (k) data[k] = (rowArr[idx] || "").trim(); });
          if (!data.nombre) { skip++; continue; }
          data.updatedAt = serverTimestamp();
          msg.className = "msg"; msg.textContent = `Importando ${ok + 1}… (no cierres la pestaña)`;
          const code = (data.codigoId || "").replace(/[^\w-]/g, "");
          const id = code ? ("id" + code) : null;
          if (id) await setDoc(doc(db, "clientes", id), data, { merge: true });
          else await setDoc(doc(collection(db, "clientes")), data);
          ok++;
        }
        msg.className = "msg ok"; msg.textContent = `✓ ${ok} clientes importados${skip ? ` · ${skip} filas sin nombre omitidas` : ""}.`;
        renderClientes();
      } catch (e) { msg.className = "msg err"; msg.textContent = "Error al importar: " + (e.message || e); }
    };
    rd.readAsText(file, "UTF-8");
  };
  inp.click();
}
function exportClientesCSV() {
  const cols = CLI_FIELDS.map(f =>f[0]);
  const labels = CLI_FIELDS.map(f =>f[1]);
  const esc = v => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [labels.map(esc).join(",")];
  CLIENTES.forEach(c =>lines.push(cols.map(k =>esc(c[k])).join(",")));
  const blob = new Blob(["" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "clientes-contax.csv"; a.click(); URL.revokeObjectURL(a.href);
}

// ============================================================
//  MÓDULO BASE DE DATOS (Google Sheets · hoja BDCONTAX vía Apps Script)
//  El Google Sheets sigue siendo la fuente; el portal lo lee y escribe.
// ============================================================
// [clave interna, ETIQUETA EXACTA en el Sheet (fila A1), grupo, tipo]
const BD_FIELDS = [
  ["nombre", "NOMBRE", "Cliente", "text"],
  ["codigoId", "Codigo de ID", "Cliente", "text"],
  ["nit", "NIT", "Cliente", "text"],
  ["razon", "Nombre o Razón Social", "Cliente", "text"],
  ["celular", "Celular", "Cliente", "text"],
  ["correo", "Correo Electrónico", "Cliente", "text"],
  ["tipo", "Tipo de Contribuyente", "Actividad", "text"],
  ["actP", "Actividad Principal", "Actividad", "text"],
  ["actS", "Actividad Secundaria", "Actividad", "text"],
  ["brinda", "Brinda Servicios A", "Actividad", "text"],
  ["fechaNit", "Fecha Apertura NIT", "Actividad", "text"],
  ["usuario", "Usuario", "Accesos", "text"],
  ["password", "Contraseña", "Accesos", "secret"],
  ["passSiat", "Contraseña SIAT", "Accesos", "secret"],
  ["capital", "Inicio De Capital", "SEPREC", "text"],
  ["estMat", "Estado de La Matricula SEPREC", "SEPREC", "text"],
  ["correoSeprec", "Correo SEPREC", "SEPREC", "text"],
  ["userSeprec", "Usuario SEPREC", "SEPREC", "text"],
  ["passSeprec", "Contraseña SEPREC", "SEPREC", "secret"],
  ["estado", "Estado Usuario", "Adicionales", "estado"],
  ["costo", "Costo Servicio Mensual", "Adicionales", "text"],
  ["fechaInact", "Fecha Inactivación", "Adicionales", "text"],
  ["comentarios", "Comentarios", "Adicionales", "textarea"]
];
const BD_GROUPS = ["Cliente", "Actividad", "Accesos", "SEPREC", "Adicionales"];
const BD_LBL2KEY = {}; BD_FIELDS.forEach(f =>BD_LBL2KEY[f[1]] = f[0]);
const BD_KEY2LBL = {}; BD_FIELDS.forEach(f =>BD_KEY2LBL[f[0]] = f[1]);
const BD_SECRET_LBL = BD_FIELDS.filter(f =>f[3] === "secret").map(f =>f[1]);
// Las filas se guardan TAL CUAL vienen del Sheet: claves = etiquetas (títulos).
let BD = [], bdHeader = [], bdFilter = "", bdEstado = "", bdTipo = "", bdLoaded = false, bdUrlCache = "";
let bdSubtab = "resumen", bdSort = "", bdEnFirebaseFlag = false;
let bdKey2Header = {};
// Mapea un encabezado del Sheet (aunque tenga "20." adelante) a la clave interna de BD_FIELDS
function bdHeaderToKey(h) {
  const raw = String(h || "").trim().replace(/^\s*\d+\s*[.\-)]\s*/, "");
  const n = raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  if (n.includes("estado") && n.includes("usuario")) return "estado";
  if (n.includes("costo")) return "costo";
  if (n.includes("matricula")) return "estMat";
  if (n.includes("apertura") && n.includes("nit")) return "fechaNit";
  if (n.includes("correo") && n.includes("seprec")) return "correoSeprec";
  if (n.includes("correo")) return "correo";
  if (n.includes("tipo") && n.includes("contribuy")) return "tipo";
  if (n.includes("brinda")) return "brinda";
  if (n.includes("actividad principal")) return "actP";
  if (n.includes("actividad secundaria")) return "actS";
  if (n.includes("celular") || n.includes("telefono")) return "celular";
  if (n.includes("codigo")) return "codigoId";
  if (n.includes("razon")) return "razon";
  if (n === "nombre") return "nombre";
  if (n === "nit") return "nit";
  if (n.includes("comentario")) return "comentarios";
  if (n.includes("fecha inactiv")) return "fechaInact";
  return BD_LBL2KEY[raw] || null;
}
function bdBuildKeyMap() {
  bdKey2Header = {};
  bdHeader.forEach(h => { const k = bdHeaderToKey(h); if (k && !bdKey2Header[k]) bdKey2Header[k] = h; });
}
const BD_COLL = "bdclientes";
// Carga la Base de Datos desde Firebase (cuando ya se migró)
async function bdLoadFirebase(cb) {
  try {
    const cfg = await loadConfigDoc();
    bdHeader = (cfg.bdHeader && cfg.bdHeader.length) ? cfg.bdHeader.slice() : [];
    bdBuildKeyMap();
    const snap = await getDocs(collection(db, BD_COLL));
    let rows = snap.docs.filter(d => d.id !== "_meta").map(d => Object.assign({ _docid: d.id }, d.data()));
    if (!bdHeader.length && rows.length) { bdHeader = Object.keys(rows[0]).filter(k => k.charAt(0) !== "_"); bdBuildKeyMap(); }
    BD = rows.filter(r => (bdV(r, "nombre") || bdV(r, "razon") || bdV(r, "codigoId") || bdV(r, "nit")));
    bdEnFirebaseFlag = true; bdLoaded = true; cb(true);
  } catch (e) { cb(false, e.message || e); }
}
// Carga la Base de Datos (Sheet) si aún no está, y luego ejecuta cb
function bdEnsureLoaded(cb) {
  if (bdLoaded && BD.length) { cb(true); return; }
  loadConfigDoc().then(cfg => {
    if (cfg.bdEnFirebase) { bdLoadFirebase(cb); return; }
    bdEnsureLoadedBridge(cb);
  });
}
function bdEnsureLoadedBridge(cb) {
  bdFetch((data) => {
    if (data && !data.error) {
      const rows = (data.rows || []);
      bdHeader = (data.header && data.header.length) ? data.header : (rows.length ? Object.keys(rows[0]) : BD_FIELDS.map(f => f[1]));
      bdBuildKeyMap();
      BD = rows.filter(r => (bdV(r, "nombre") || bdV(r, "razon") || bdV(r, "codigoId") || bdV(r, "nit")));
      bdEnFirebaseFlag = false; bdLoaded = true; cb(true);
    } else { cb(false, data && data.error); }
  });
}
let bdHidden = [], bdPinned = [];
try { bdHidden = JSON.parse(localStorage.getItem("bd-hidden") || "[]"); if (!Array.isArray(bdHidden)) bdHidden = []; } catch (e) { bdHidden = []; }
try { bdPinned = JSON.parse(localStorage.getItem("bd-pinned") || "[]"); if (!Array.isArray(bdPinned)) bdPinned = []; } catch (e) { bdPinned = []; }
function bdSaveHidden() { try { localStorage.setItem("bd-hidden", JSON.stringify(bdHidden)); } catch (e) {} }
function bdSavePinned() { try { localStorage.setItem("bd-pinned", JSON.stringify(bdPinned)); } catch (e) {} }
function bdVisibleHeader() { return bdHeader.filter(h => bdHidden.indexOf(h) < 0); }
// Devuelve las columnas visibles con las FIJADAS primero, y el ancho/posición de fijado
const BD_PINW = 170;
function bdOrderedHeader() {
  const vis = bdVisibleHeader();
  const pin = bdPinned.filter(h => vis.indexOf(h) >= 0);
  const rest = vis.filter(h => pin.indexOf(h) < 0);
  return { ordered: pin.concat(rest), pin: pin };
}
function bdPinStyle(h, pin, head) {
  const i = pin.indexOf(h); if (i < 0) return "";
  const bg = head ? "var(--panel2)" : "var(--panel)";
  return `position:sticky;left:${i * BD_PINW}px;z-index:${head ? 6 : 5};min-width:${BD_PINW}px;max-width:${BD_PINW}px;background:${bg};box-shadow:${i === pin.length - 1 ? "2px 0 5px rgba(0,0,0,.12)" : "none"}`;
}

// Lee un campo por su clave interna (busca la etiqueta del Sheet)
function bdV(r, key) { const lbl = (bdKey2Header && bdKey2Header[key]) || BD_KEY2LBL[key]; const v = r && lbl != null ? r[lbl] : ""; return String(v == null ? "" : v).trim(); }

// Los 6 estados definidos por CONTAX (clave, etiqueta corta, color)
// Solo "ACTIVO" son clientes reales. "Suscripcion de facturacion" NO es cliente.
const BD_ESTADO_DEFS = [
  ["activo",       "Clientes activos",     "ok"],
  ["facturacion",  "Por facturacion",      "mut"],
  ["inactivo",     "Clientes inactivos",   "off"],
  ["nit_baja",     "Cerraron NIT",         "off"],
  ["susc_inact",   "Suscripcion inactiva", "off"],
  ["lista_negra",  "Lista negra",          "danger"]
];
const BD_ESTADO_LBL = {}; BD_ESTADO_DEFS.forEach(function (d) { BD_ESTADO_LBL[d[0]] = d[1]; });

// Clasifica el "Estado Usuario" en uno de los 6 grupos, con su color
function bdEstadoInfo(r) {
  const raw = bdV(r, "estado");
  const u = raw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  let g;
  if (u === "ACTIVO") g = "activo";
  else if (u.indexOf("LISTA NEGRA") >= 0) g = "lista_negra";
  else if (u.indexOf("SUSCRIP") >= 0 && u.indexOf("INACTIV") >= 0) g = "susc_inact";
  else if (u.indexOf("SUSCRIP") >= 0 || u.indexOf("FACTURACION") >= 0) g = "facturacion";
  else if (u.indexOf("SOLICITAD") >= 0) g = "nit_baja";
  else if (u.indexOf("INACTIV") >= 0) g = "inactivo";
  else g = raw ? "inactivo" : "otro";
  const cls = g === "activo" ? "ok" : g === "lista_negra" ? "danger" : g === "facturacion" ? "mut" : "off";
  return { raw: raw, grupo: g, cls: cls, activo: g === "activo" };
}
function bdIsActivo(r) { return bdEstadoInfo(r).activo; }
function bdMoney(v) { let s = String(v == null ? "" : v).replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".").replace(/[^\d.]/g, ""); const n = parseFloat(s); return isNaN(n) ? 0 : n; }
function fmtBs2(n) { return "Bs " + (Number(n) || 0).toLocaleString("es-BO", { maximumFractionDigits: 2 }); }
// Descarga una copia de respaldo en CSV (se abre en Excel / Google Sheets)
function downloadCSV(filename, headers, rows) {
  const cell = v => { let s = String(v == null ? "" : v); if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; };
  const lines = [headers.map(cell).join(",")].concat(rows.map(r => r.map(cell).join(",")));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function hoyISO() { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }

async function bdBridgeUrl() { const cfg = await loadConfigDoc(); return (cfg.bdUrl || "").trim(); }

function bdFetch(cb) {
  bdBridgeUrl().then(url => {
    if (!url) { cb({ error: "nourl" }); return; }
    bdUrlCache = url;
    const cbn = "bdcb_" + Date.now() + Math.floor(Math.random() * 999);
    const s = document.createElement("script");
    const to = setTimeout(() => { try { delete window[cbn]; } catch (e) {} s.remove(); cb({ error: "timeout" }); }, 20000);
    window[cbn] = (data) => { clearTimeout(to); try { delete window[cbn]; } catch (e) {} s.remove(); cb(data || {}); };
    const sep = url.indexOf("?") >= 0 ? "&" : "?";
    s.src = url + sep + "action=list&callback=" + cbn;
    s.onerror = () => { clearTimeout(to); try { delete window[cbn]; } catch (e) {} s.remove(); cb({ error: "net" }); };
    document.body.appendChild(s);
  });
}

async function renderBaseDatos(force) {
  // Caché: si ya está cargada, no volvemos a leer (navegar entre pestañas es instantáneo y no gasta Firebase)
  if (!force && bdLoaded && BD.length) { BD.forEach((r, i) => r._i = i); paintBaseDatos(); return; }
  const cfg0 = await loadConfigDoc();
  if (cfg0.bdEnFirebase) {
    el("v-basedatos").innerHTML = `<h1>Base de Datos</h1><p class="lead"><span class="cx-spin"></span> Cargando desde Firebase…</p>`;
    bdLoadFirebase((ok, err) => {
      if (!ok) { el("v-basedatos").innerHTML = `<h1>Base de Datos</h1><p class="msg err">No se pudo cargar desde Firebase: ${escape(String(err || ""))}</p>`; return; }
      BD.forEach((r, i) => r._i = i); paintBaseDatos();
    });
    return;
  }
  const url = await bdBridgeUrl();
  if (!url) {
    el("v-basedatos").innerHTML = `<h1>Base de Datos</h1>
      <p class="lead">Tu hoja <b>BDCONTAX</b>de Google Sheets, dentro del portal. El Sheet sigue siendo la fuente y puedes seguir usándolo normal.</p>
      <div class="formcard"><h3 style="margin:0 0 8px">Falta conectar tu Google Sheets</h3>
      <p class="note">Ve a <b>Configuración → Base de Datos (Google Sheets)</b>y pega la URL del puente (Apps Script). Te pasé el código para instalarlo en tu hoja.</p>
      <button class="btn" onclick="document.querySelector('nav.tabs [data-v=config]').click()">Ir a Configuración</button></div>`;
    return;
  }
  el("v-basedatos").innerHTML = `<h1>Base de Datos</h1><p class="lead"><span class="cx-spin"></span>Cargando desde Google Sheets…</p>`;
  bdFetch((data) => {
    if (data.error) {
      el("v-basedatos").innerHTML = `<h1>Base de Datos</h1><p class="msg err">No se pudo leer el Sheet (${escape(data.error)}). Revisa la URL del puente en Configuración y que el Apps Script esté publicado como "Cualquiera".</p>
        <button class="btn sec" style="border:1px solid var(--line)">Reintentar</button>`;
      const b = el("v-basedatos").querySelector("button"); if (b) b.onclick = () =>renderBaseDatos();
      return;
    }
    const rows = (data.rows || []);
    // Orden de columnas TAL CUAL el Sheet (fila 1). Si el puente no lo manda, lo deducimos.
    bdHeader = (data.header && data.header.length) ? data.header
             : (rows.length ? Object.keys(rows[0]) : BD_FIELDS.map(f =>f[1]));
    bdBuildKeyMap();
    BD = rows.filter(r => (bdV(r, "nombre") || bdV(r, "razon") || bdV(r, "codigoId") || bdV(r, "nit")));
    bdEnFirebaseFlag = false; bdLoaded = true;
    paintBaseDatos();
  });
}

function paintBaseDatos() {
  const canEdit = canEditClientes();
  // _i estable por índice en BD (antes de construir filas)
  BD.forEach((r, i) =>r._i = i);
  const term = bdFilter.toLowerCase().trim();
  const ESTADO_LBL = BD_KEY2LBL["estado"];   // "Estado Usuario"
  const TIPO_LBL = BD_KEY2LBL["tipo"];       // "Tipo de Contribuyente"
  const tipos = [...new Set(BD.map(r =>bdV(r, "tipo")).filter(Boolean))].sort();
  const estados = [...new Set(BD.map(r =>bdV(r, "estado")).filter(Boolean))].sort();
  const list = BD.filter(r => {
    // Filtro por subpestaña: Activos / Otros estados
    if (bdSubtab === "activos" && !bdEstadoInfo(r).activo) return false;
    if (bdSubtab === "otros" && bdEstadoInfo(r).activo) return false;
    if (bdEstado) {
      if (bdEstado.indexOf("g:") === 0) { if (bdEstadoInfo(r).grupo !== bdEstado.slice(2)) return false; }
      else if (bdV(r, "estado") !== bdEstado) return false;
    }
    if (bdTipo && bdV(r, "tipo") !== bdTipo) return false;
    if (term) {
      let hay = false;
      for (const lbl of bdHeader) { if (String(r[lbl] == null ? "" : r[lbl]).toLowerCase().includes(term)) { hay = true; break; } }
      if (!hay) return false;
    }
    return true;
  });
  const codeNum = r => { const n = parseInt(String(bdV(r, "codigoId")).replace(/\D/g, ""), 10); return isNaN(n) ? -1 : n; };
  if (bdSort === "nombre") list.sort((a, b) => String(bdV(a, "nombre") || bdV(a, "razon")).localeCompare(String(bdV(b, "nombre") || bdV(b, "razon"))));
  else if (bdSort === "estado") list.sort((a, b) => String(bdV(a, "estado")).localeCompare(String(bdV(b, "estado"))));
  else if (bdSort === "costo") list.sort((a, b) => bdMoney(bdV(b, "costo")) - bdMoney(bdV(a, "costo")));
  else if (bdSort === "antiguo") list.sort((a, b) => codeNum(a) - codeNum(b));
  else list.sort((a, b) => codeNum(b) - codeNum(a)); // "reciente" por defecto (código más alto primero)
  const counts = { activo: 0, facturacion: 0, inactivo: 0, nit_baja: 0, susc_inact: 0, lista_negra: 0, otro: 0 };
  BD.forEach(r => { counts[bdEstadoInfo(r).grupo] = (counts[bdEstadoInfo(r).grupo] || 0) + 1; });
  const total = BD.length, activos = counts.activo;
  const ingreso = BD.filter(bdIsActivo).reduce((s, r) =>s + bdMoney(bdV(r, "costo")), 0);
  // Cabecera: solo las columnas visibles del Sheet + una fija al final para "Editar/Ver"
  const { ordered: visHeader, pin: pinCols } = bdOrderedHeader();
  const thead = `<tr>${visHeader.map(h => `<th style="${bdPinStyle(h, pinCols, true)}">${pinCols.indexOf(h) >= 0 ? "📌 " : ""}${escape(h)}</th>`).join("")}<th class="bd-actioncol"></th></tr>`;
  const rowCls = { inactivo: "bd-inact", nit_baja: "bd-inact", susc_inact: "bd-inact", lista_negra: "bd-negra" };
  const rows = list.map(r => {
    const info = bdEstadoInfo(r);
    const tds = visHeader.map(lbl => {
      const val = String(r[lbl] == null ? "" : r[lbl]);
      const ps = bdPinStyle(lbl, pinCols, false);
      if (lbl === ESTADO_LBL) {
        return `<td style="${ps}"><span class="badge ${info.cls}">${escape(info.raw || "—")}</span></td>`;
      }
      return `<td style="${ps}" title="${escape(val)}">${escape(val) || "<span style='color:var(--muted)'>—</span>"}</td>`;
    }).join("");
    const cls = rowCls[info.grupo] || "";
    return `<tr data-open="${r._i}" class="${cls}">${tds}<td class="bd-actioncol"><button class="mini" data-edit="${r._i}">${canEdit ? "Editar" : "Ver"}</button></td></tr>`;
  }).join("");
  const colspan = visHeader.length + 1;
  const resumenHTML = `
    <div class="kpis">
      <div class="kpi"><div class="n">${total}</div><div class="l">Registros</div></div>
      <div class="kpi bd-kpi" data-gfilter="activo" title="Ver en la lista"><div class="n" style="color:var(--green)">${counts.activo}</div><div class="l">Clientes activos <span class="badge ok" style="padding:1px 6px">reales</span></div></div>
      <div class="kpi bd-kpi" data-gfilter="facturacion" title="Ver en la lista"><div class="n">${counts.facturacion}</div><div class="l">Por facturación</div></div>
      <div class="kpi bd-kpi" data-gfilter="inactivo" title="Ver en la lista"><div class="n">${counts.inactivo}</div><div class="l">Clientes inactivos</div></div>
      <div class="kpi bd-kpi" data-gfilter="nit_baja" title="Ver en la lista"><div class="n">${counts.nit_baja}</div><div class="l">Cerraron NIT</div></div>
      <div class="kpi bd-kpi" data-gfilter="susc_inact" title="Ver en la lista"><div class="n">${counts.susc_inact}</div><div class="l">Suscripción inactiva</div></div>
      <div class="kpi bd-kpi" data-gfilter="lista_negra" title="Ver en la lista"><div class="n" style="color:var(--danger)">${counts.lista_negra}</div><div class="l">Lista negra</div></div>
      <div class="kpi"><div class="n">${fmtBs2(ingreso)}</div><div class="l">Ingreso mensual (activos)</div></div>
    </div>`;
  const listaHTML = `
    <div class="toolbar">
      <input id="bd_search" class="mini" style="padding:9px;min-width:240px" placeholder="Buscar en toda la base…" value="${escape(bdFilter)}">
      <select id="bd_estado" class="mini" style="padding:9px"><option value="">Todos los estados</option><optgroup label="Por categoría">${BD_ESTADO_DEFS.map(d => `<option value="g:${d[0]}">${escape(d[1])} (${counts[d[0]] || 0})</option>`).join("")}</optgroup><optgroup label="Texto exacto del Sheet">${estados.map(e => `<option value="${escape(e)}">${escape(e)}</option>`).join("")}</optgroup></select>
      <select id="bd_tipo" class="mini" style="padding:9px"><option value="">Todos los tipos</option>${tipos.map(t => `<option value="${escape(t)}">${escape(t)}</option>`).join("")}</select>
      <select id="bd_sort" class="mini" style="padding:9px"><option value="">Más recientes</option><option value="antiguo">Más antiguos</option><option value="nombre">Nombre (A-Z)</option><option value="estado">Estado</option><option value="costo">Costo (mayor)</option></select>
      ${canEdit ? '<button class="btn" id="bd_new">＋ Nuevo</button>' : ""}
      <button class="btn sec" id="bd_cols" style="border:1px solid var(--line)">Columnas${bdHidden.length ? ` (${visHeader.length}/${bdHeader.length})` : ""}</button>
      <button class="btn sec" id="bd_download" style="border:1px solid var(--line)">⬇ Descargar</button>
      <button class="btn sec" id="bd_reload" style="border:1px solid var(--line)">Actualizar</button>
      ${(isAdmin() && !bdEnFirebaseFlag) ? '<button class="btn" id="bd_migrar" style="background:var(--green);border-color:var(--green)" title="Copiar todo a Firebase y dejar de usar Google Sheets">⬆ Migrar a Firebase</button>' : ''}
      ${bdEnFirebaseFlag ? '<span class="badge ok" style="align-self:center;padding:4px 10px">⚡ En Firebase</span>' : ''}
      <span class="msg" id="bd_msg" style="align-self:center"></span>
    </div>
    <div class="bd-scroll"><table class="bd-table">
      <thead>${thead}</thead>
      <tbody>${rows || `<tr><td colspan="${colspan}" style="color:var(--muted)">Sin registros con estos filtros.</td></tr>`}</tbody></table></div>
    <p class="note" style="margin-top:10px">Mostrando ${list.length} de ${total}. Toca una fila para ver la ficha completa. Desliza a los lados para ver todas las columnas.</p>`;
  const isList = bdSubtab !== "resumen" && bdSubtab !== "movimientos";
  el("v-basedatos").innerHTML = `<h1>Clientes</h1>
    <p class="lead">${bdEnFirebaseFlag ? `Base de datos de clientes en Firebase (rápida), con las ${bdHeader.length} columnas.` : `Tu hoja <b>BDCONTAX</b>de Google Sheets, con las ${bdHeader.length} columnas tal cual.`}</p>
    <div class="subtabs">
      <button class="subtab ${bdSubtab === 'resumen' ? 'on' : ''}" data-st="resumen">Resumen</button>
      <button class="subtab ${bdSubtab === 'general' ? 'on' : ''}" data-st="general">General (${total})</button>
      <button class="subtab ${bdSubtab === 'activos' ? 'on' : ''}" data-st="activos">Activos (${counts.activo})</button>
      <button class="subtab ${bdSubtab === 'otros' ? 'on' : ''}" data-st="otros">Otros estados (${total - counts.activo})</button>
      <button class="subtab ${bdSubtab === 'movimientos' ? 'on' : ''}" data-st="movimientos">Movimientos</button>
    </div>
    <div ${bdSubtab === 'resumen' ? '' : 'style="display:none"'}>${resumenHTML}</div>
    <div ${isList ? '' : 'style="display:none"'}>${listaHTML}</div>
    <div ${bdSubtab === 'movimientos' ? '' : 'style="display:none"'} id="bd-mov"></div>`;
  el("v-basedatos").querySelectorAll(".subtab").forEach(b => b.onclick = () => { bdSubtab = b.dataset.st; if (bdSubtab !== "resumen" && bdSubtab !== "general" && bdSubtab !== "activos" && bdSubtab !== "otros" && bdSubtab !== "movimientos") bdSubtab = "general"; paintBaseDatos(); });
  if (bdSubtab === "movimientos") renderBDMovimientos();
  if (el("bd_sort")) { el("bd_sort").value = bdSort; el("bd_sort").onchange = () => { bdSort = el("bd_sort").value; paintBaseDatos(); }; }
  if (el("bd_search")) el("bd_search").oninput = () => { bdFilter = el("bd_search").value; paintBaseDatos(); const nb = el("bd_search"); if (nb) { nb.focus(); nb.setSelectionRange(nb.value.length, nb.value.length); } };
  if (el("bd_estado")) { el("bd_estado").value = bdEstado; el("bd_estado").onchange = () => { bdEstado = el("bd_estado").value; paintBaseDatos(); }; }
  if (el("bd_tipo")) { el("bd_tipo").value = bdTipo; el("bd_tipo").onchange = () => { bdTipo = el("bd_tipo").value; paintBaseDatos(); }; }
  if (el("bd_new")) el("bd_new").onclick = () =>openBDModal(null);
  if (el("bd_cols")) el("bd_cols").onclick = () => openBDColsModal();
  if (el("bd_reload")) el("bd_reload").onclick = () =>renderBaseDatos(true);
  if (el("bd_migrar")) el("bd_migrar").onclick = () => migrarBDaFirebase();
  el("v-basedatos").querySelectorAll(".bd-kpi").forEach(k => { k.style.cursor = "pointer"; k.onclick = () => { const g = "g:" + k.dataset.gfilter; bdEstado = (bdEstado === g) ? "" : g; bdSubtab = "general"; paintBaseDatos(); }; });
  if (el("bd_download")) el("bd_download").onclick = () => openBDDownloadModal(list);
  el("v-basedatos").querySelectorAll("[data-edit]").forEach(b =>b.onclick = (e) => { e.stopPropagation(); openBDModal(BD[+b.dataset.edit]); });
  el("v-basedatos").querySelectorAll("tr[data-open]").forEach(r =>r.onclick = () =>openBDModal(BD[+r.dataset.open]));
  // Resaltado de columna: al pasar el cursor, ilumina toda la columna
  const tabla = el("v-basedatos").querySelector(".bd-table");
  if (tabla) {
    let colActual = -1;
    const limpiar = () => { tabla.querySelectorAll(".bd-colhi").forEach(c =>c.classList.remove("bd-colhi")); colActual = -1; };
    tabla.addEventListener("mouseover", (e) => {
      const cel = e.target.closest("td,th"); if (!cel || cel.cellIndex === colActual) return;
      limpiar(); colActual = cel.cellIndex;
      tabla.querySelectorAll("tr").forEach(tr => { const c = tr.children[colActual]; if (c) c.classList.add("bd-colhi"); });
    });
    tabla.addEventListener("mouseleave", limpiar);
  }
}

function openBDColsModal() {
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const items = bdHeader.map((h, i) => {
    const on = bdHidden.indexOf(h) < 0;
    const pinned = bdPinned.indexOf(h) >= 0;
    return `<label style="display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);font-size:13px;cursor:pointer">
      <input type="checkbox" data-col="${escape(h)}" ${on ? "checked" : ""} style="width:auto"> <span style="flex:1">${escape(h)}</span>
      <span class="bc-pin" data-pin="${escape(h)}" title="Fijar/soltar columna" style="cursor:pointer;opacity:${pinned ? "1" : ".3"};font-size:15px">📌</span></label>`;
  }).join("");
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:22px;width:500px;max-width:96vw;max-height:90vh;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <h3 style="margin:0">Columnas</h3><button class="mini" id="bc_x">✕</button></div>
    <p class="note" style="margin:0 0 12px">Marca las que quieres ver. Toca el 📌 para <b>fijar</b>una columna: las fijadas quedan siempre visibles a la izquierda aunque te muevas de lado. (Se recuerda en este navegador.)</p>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn sec" id="bc_all" style="flex:1;border:1px solid var(--line)">Mostrar todas</button>
      <button class="btn sec" id="bc_none" style="flex:1;border:1px solid var(--line)">Ocultar todas</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;overflow-y:auto;flex:1">${items}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn" id="bc_apply">Aplicar</button></div>
  </div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  bg.querySelector("#bc_x").onclick = close;
  bg.querySelector("#bc_all").onclick = () => bg.querySelectorAll("input[data-col]").forEach(c => c.checked = true);
  bg.querySelector("#bc_none").onclick = () => bg.querySelectorAll("input[data-col]").forEach(c => c.checked = false);
  bg.querySelectorAll(".bc-pin").forEach(p => p.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    const h = p.dataset.pin; const idx = bdPinned.indexOf(h);
    if (idx >= 0) bdPinned.splice(idx, 1); else bdPinned.push(h);
    p.style.opacity = bdPinned.indexOf(h) >= 0 ? "1" : ".3";
  });
  bg.querySelector("#bc_apply").onclick = () => {
    bdHidden = [...bg.querySelectorAll("input[data-col]")].filter(c => !c.checked).map(c => c.dataset.col);
    bdSaveHidden(); bdSavePinned(); close(); paintBaseDatos();
  };
}

// Registro de movimientos (alta / baja / cambio de estado)
async function bdLog(e) {
  try {
    const entry = { fechaISO: new Date().toISOString(), accion: e.accion || "", nombre: e.nombre || "", estadoAnterior: e.estadoAnterior || "", estadoNuevo: e.estadoNuevo || "", porUid: (ME && ME.uid) || "", porNombre: (ME && (ME.name || ME.email)) || "", createdAt: serverTimestamp() };
    await setDoc(doc(collection(db, "bdlog")), entry);
  } catch (err) {}
}
function esBaja(estado) { return /inactiv|negra|suspend|baja/i.test(String(estado || "").normalize("NFD").replace(/[̀-ͯ]/g, "")); }
async function renderBDMovimientos() {
  const box = el("bd-mov"); if (!box) return;
  box.innerHTML = `<p class="lead"><span class="cx-spin"></span> Cargando movimientos…</p>`;
  let logs = [];
  try { const snap = await getDocs(query(collection(db, "bdlog"), orderBy("fechaISO", "desc"), limit(500))); logs = snap.docs.map(d => d.data()); }
  catch (e) { box.innerHTML = `<p class="note">Aún no hay registro de movimientos (se empieza a llenar cuando des de alta/baja o cambies estados). Si ves un error, revisa que agregaste la regla de Firestore para <b>bdlog</b>.</p>`; return; }
  if (!logs.length) { box.innerHTML = `<p class="note">Todavía no hay movimientos registrados. A partir de ahora, cada alta, baja o cambio de estado quedará aquí con su fecha.</p>`; return; }
  const byMonth = {};
  logs.forEach(l => { const m = (l.fechaISO || "").slice(0, 7); if (!m) return; byMonth[m] = byMonth[m] || { alta: 0, baja: 0, cambio: 0 }; if (l.accion === "alta") byMonth[m].alta++; else if (esBaja(l.estadoNuevo)) byMonth[m].baja++; else byMonth[m].cambio++; });
  const months = Object.keys(byMonth).sort().reverse().slice(0, 12);
  const MES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mLbl = m => { const p = m.split("-"); return (MES[parseInt(p[1], 10)] || p[1]) + " " + p[0]; };
  const resumen = `<table style="max-width:520px"><thead><tr><th>Mes</th><th style="text-align:center">Nuevos</th><th style="text-align:center">Bajas</th><th style="text-align:center">Otros cambios</th></tr></thead>
    <tbody>${months.map(m => `<tr><td>${mLbl(m)}</td><td style="text-align:center;color:var(--green);font-weight:700">${byMonth[m].alta}</td><td style="text-align:center;color:var(--danger);font-weight:700">${byMonth[m].baja}</td><td style="text-align:center">${byMonth[m].cambio}</td></tr>`).join("")}</tbody></table>`;
  const rows = logs.slice(0, 200).map(l => `<tr>
    <td class="mono">${escape(fmtFecha(l.fechaISO))}</td>
    <td>${l.accion === "alta" ? '<span class="badge ok">Alta</span>' : (esBaja(l.estadoNuevo) ? '<span class="badge danger">Baja</span>' : '<span class="badge off">Cambio</span>')}</td>
    <td><b>${escape(l.nombre || "—")}</b></td>
    <td>${escape(l.estadoAnterior || "")}${l.estadoAnterior && l.estadoNuevo ? " → " : ""}${escape(l.estadoNuevo || "")}</td>
    <td>${escape(l.porNombre || "")}</td></tr>`).join("");
  box.innerHTML = `<h3 style="margin:6px 0 8px">Resumen por mes</h3>${resumen}
    <h3 style="margin:18px 0 8px">Movimientos recientes</h3>
    <div class="bd-scroll"><table class="bd-table"><thead><tr><th>Fecha</th><th>Acción</th><th>Cliente</th><th>Estado</th><th>Por</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
// Descargar seleccionando columnas (abre en Excel)
function openBDDownloadModal(list) {
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const defaults = bdHeader.filter(h => { const k = bdHeaderToKey(h); return k === "nombre" || k === "nit" || k === "celular" || k === "codigoId" || k === "estado"; });
  const items = bdHeader.map(h => {
    const on = defaults.indexOf(h) >= 0;
    return `<label style="display:flex;align-items:center;gap:8px;padding:6px 9px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);font-size:13px;cursor:pointer"><input type="checkbox" data-dc="${escape(h)}" ${on ? "checked" : ""} style="width:auto"><span style="flex:1">${escape(h)}</span></label>`;
  }).join("");
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:22px;width:520px;max-width:96vw;max-height:90vh;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><h3 style="margin:0">Descargar (Excel/CSV)</h3><button class="mini" id="dc_x">✕</button></div>
    <p class="note" style="margin:0 0 10px">Elige qué columnas descargar. Se bajan los <b>${list.length}</b>registros que estás viendo ahora (según el filtro/subpestaña actual).</p>
    <div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn sec" id="dc_all" style="flex:1;border:1px solid var(--line)">Todas</button><button class="btn sec" id="dc_none" style="flex:1;border:1px solid var(--line)">Ninguna</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;overflow-y:auto;flex:1">${items}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn" id="dc_go">⬇ Descargar</button></div>
  </div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  bg.querySelector("#dc_x").onclick = close;
  bg.querySelector("#dc_all").onclick = () => bg.querySelectorAll("input[data-dc]").forEach(c => c.checked = true);
  bg.querySelector("#dc_none").onclick = () => bg.querySelectorAll("input[data-dc]").forEach(c => c.checked = false);
  bg.querySelector("#dc_go").onclick = () => {
    const cols = [...bg.querySelectorAll("input[data-dc]")].filter(c => c.checked).map(c => c.dataset.dc);
    if (!cols.length) { alert("Elige al menos una columna."); return; }
    const rws = list.map(r => cols.map(h => String(r[h] == null ? "" : r[h])));
    downloadCSV("CONTAX-Clientes-" + hoyISO() + ".csv", cols, rws);
    close();
  };
}

function openBDModal(row) {
  const canEdit = canEditClientes();
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const groupsHtml = BD_GROUPS.map(g => {
    const fields = BD_FIELDS.filter(f =>f[2] === g);
    const inputs = fields.map(([key, label, , type]) => {
      const val = escape(row ? (row[label] != null ? row[label] : "") : "");
      const dis = canEdit ? "" : "disabled";
      if (type === "textarea") return `<div class="field" style="grid-column:1/-1"><label>${escape(label)}</label><textarea id="bf_${key}" style="min-height:70px" ${dis}>${val}</textarea></div>`;
      if (type === "secret") return `<div class="field"><label>${escape(label)}</label><input id="bf_${key}" type="password" value="${val}" ${dis}><span class="reveal note" data-rev="bf_${key}" style="font-size:11px">mostrar</span></div>`;
      if (type === "estado") return `<div class="field"><label>${escape(label)}</label><input id="bf_${key}" value="${val}" list="bf_estlist" placeholder="ACTIVO" ${dis}></div>`;
      return `<div class="field"><label>${escape(label)}</label><input id="bf_${key}" value="${val}" ${dis}></div>`;
    }).join("");
    return `<div class="fs">${g}</div><div class="grid2">${inputs}</div>`;
  }).join("");
  const estOpts = [...new Set(["ACTIVO", "CLIENTE INACTIVO", "INACTIVO SOLICITADO", "LISTA NEGRA", "SUSCRIPCIÓN FACTURACIÓN", ...BD.map(x =>bdV(x, "estado"))].filter(Boolean))];
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px;width:760px;max-width:96vw;max-height:92vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3 style="margin:0">${row ? (canEdit ? "Editar registro" : "Ficha") : "Nuevo registro"}</h3>
      <button class="mini" id="bf_x">✕</button></div>
    <datalist id="bf_estlist">${estOpts.map(e => `<option value="${escape(e)}">`).join("")}</datalist>
    ${groupsHtml}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
      <button class="btn sec" id="bf_cancel" style="border:1px solid var(--line)">Cerrar</button>
      ${canEdit ? '<button class="btn" id="bf_save">Guardar</button>' : ""}</div>
    <div class="msg" id="bf_msg"></div></div>`;
  document.body.appendChild(bg);
  const close = () =>bg.remove();
  bg.onclick = (e) => { if (e.target === bg) close(); };
  bg.querySelector("#bf_x").onclick = close;
  bg.querySelector("#bf_cancel").onclick = close;
  bg.querySelectorAll("[data-rev]").forEach(s =>s.onclick = () => { const i = bg.querySelector("#" + s.dataset.rev); if (i) { i.type = i.type === "password" ? "text" : "password"; s.textContent = i.type === "password" ? "mostrar" : "ocultar"; } });
  const saveBtn = bg.querySelector("#bf_save");
  if (saveBtn) saveBtn.onclick = async () => {
    const item = {}, itemByHeader = {};
    BD_FIELDS.forEach(([key, label]) => {
      const i = bg.querySelector("#bf_" + key); const val = i ? i.value.trim() : "";
      item[label] = val;
      const hdr = (bdKey2Header && bdKey2Header[key]) || label; // clave real de la fila (ej. "20. ESTADO USUARIO")
      itemByHeader[hdr] = val;
    });
    if (!item[BD_KEY2LBL["razon"]] && !item[BD_KEY2LBL["nombre"]]) { bg.querySelector("#bf_msg").className = "msg err"; bg.querySelector("#bf_msg").textContent = "Pon al menos el nombre o razón social."; return; }
    saveBtn.disabled = true; bg.querySelector("#bf_msg").className = "msg"; bg.querySelector("#bf_msg").textContent = "Guardando…";
    const estAnt = row ? bdV(row, "estado") : "";
    const estNue = item[BD_KEY2LBL["estado"]] || "";
    const nombreCli = item[BD_KEY2LBL["nombre"]] || item[BD_KEY2LBL["razon"]] || "";
    const nowISO = new Date().toISOString();
    // Marcas de fecha automáticas (alta/baja) en la propia ficha
    if (!row) itemByHeader["_altaISO"] = nowISO;
    if (row && estNue !== estAnt && /inactiv|negra|suspend|baja/i.test(estNue.normalize("NFD").replace(/[̀-ͯ]/g, ""))) itemByHeader["_bajaISO"] = nowISO;
    const ok = await bdSave(item, row ? bdV(row, "codigoId") : "", itemByHeader, row ? row._docid : "");
    if (ok) {
      // Registro de movimiento
      if (!row) bdLog({ accion: "alta", nombre: nombreCli, estadoNuevo: estNue });
      else if (estNue !== estAnt) bdLog({ accion: "cambio_estado", nombre: nombreCli, estadoAnterior: estAnt, estadoNuevo: estNue });
      close(); renderBaseDatos(true); setTimeout(() => { const mm = el("bd_msg"); if (mm) { mm.className = "msg ok"; mm.textContent = "✓ Guardado."; } }, 400);
    }
    else { saveBtn.disabled = false; bg.querySelector("#bf_msg").className = "msg err"; bg.querySelector("#bf_msg").textContent = "No se pudo guardar."; }
  };
}

async function bdSave(item, keyValue, itemByHeader, docid) {
  const cfg = await loadConfigDoc();
  if (cfg.bdEnFirebase) {
    try {
      let id = docid || String(keyValue || "").trim().replace(/[\/#.\$\[\]]/g, "_");
      if (!id) id = "row" + Date.now();
      await setDoc(doc(db, BD_COLL, id), itemByHeader || item, { merge: true });
      return true;
    } catch (e) { return false; }
  }
  const url = await bdBridgeUrl(); if (!url) return false;
  const payload = { action: "save", key: "Codigo de ID", keyValue: keyValue || item["Codigo de ID"] || "", item: item };
  try { await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }); return true; }
  catch (e) { return false; }
}
// Migra todos los registros del Google Sheet a Firebase (una sola vez)
async function migrarBDaFirebase() {
  if (!isAdmin()) { alert("Solo el administrador puede migrar."); return; }
  if (!confirm("Se copiarán TODOS los registros del Google Sheet a Firebase. Después la Base de Datos funcionará desde Firebase (más rápido) y el Sheet quedará como respaldo. ¿Continuar?")) return;
  const btn = el("bd_migrar"); if (btn) { btn.disabled = true; btn.textContent = "Leyendo el Sheet…"; }
  bdFetch(async (data) => {
    if (!data || data.error) { alert("No se pudo leer el Sheet: " + ((data && data.error) || "")); if (btn) { btn.disabled = false; btn.textContent = "⬆ Migrar a Firebase"; } return; }
    try {
      const header = (data.header && data.header.length) ? data.header : ((data.rows && data.rows.length) ? Object.keys(data.rows[0]) : []);
      const rows = (data.rows || []).filter(r => Object.values(r).some(v => String(v == null ? "" : v).trim() !== ""));
      bdHeader = header; bdBuildKeyMap();
      await setDoc(doc(db, "config", "app"), { bdHeader: header, bdEnFirebase: true, updatedAt: serverTimestamp() }, { merge: true });
      const used = {};
      const docs = rows.map((r, idx) => {
        let id = String(bdV(r, "codigoId") || "").trim().replace(/[\/#.\$\[\]]/g, "_");
        if (!id || used[id]) id = "row" + idx + (id ? ("_" + id) : "");
        used[id] = 1; return { id: id, data: r };
      });
      let done = 0; const CH = 20;
      for (let i = 0; i < docs.length; i += CH) {
        await Promise.all(docs.slice(i, i + CH).map(d => setDoc(doc(db, BD_COLL, d.id), d.data)));
        done += Math.min(CH, docs.length - i);
        if (btn) btn.textContent = `Migrando… ${done}/${docs.length}`;
      }
      bdLoaded = false;
      alert(`✓ Migrados ${done} registros a Firebase. La Base de Datos ahora funciona desde Firebase (más rápido). El Google Sheet queda como respaldo.`);
      renderBaseDatos();
    } catch (e) { alert("Error al migrar: " + (e.code || e.message)); if (btn) { btn.disabled = false; btn.textContent = "⬆ Migrar a Firebase"; } }
  });
}

// ============================================================
//  MÓDULO TARIFAS — catálogo de servicios (alimenta a la IA)
// ============================================================
let TARIFAS = [], tarFilter = "";
async function tarLoad() {
  try { const snap = await getDocs(collection(db, "tarifas")); TARIFAS = snap.docs.map(d => Object.assign({ id: d.id }, d.data())); }
  catch (e) { TARIFAS = []; }
  TARIFAS.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || "") || (a.orden || 0) - (b.orden || 0) || (a.nombre || "").localeCompare(b.nombre || ""));
}
function tarMoney(v) { const n = Number(v); return isNaN(n) ? "" : ("Bs " + n.toLocaleString("es-BO", { maximumFractionDigits: 2 })); }
let tarSubtab = "servicios";
async function renderTarifas() {
  el("v-tarifas").innerHTML = `<h1>Tarifas y Suscripciones</h1><p class="lead"><span class="cx-spin"></span> Cargando…</p>`;
  await tarLoad();
  paintTarifasView();
}
function paintTarifasView() {
  el("v-tarifas").innerHTML = `<h1>Tarifas y Suscripciones</h1>
    <div class="subtabs">
      <button class="subtab ${tarSubtab === 'servicios' ? 'on' : ''}" data-st="servicios">Catálogo de servicios</button>
      <button class="subtab ${tarSubtab === 'suscripciones' ? 'on' : ''}" data-st="suscripciones">Suscripciones</button>
    </div>
    <div id="tar-body"></div>`;
  el("v-tarifas").querySelectorAll(".subtab").forEach(b => b.onclick = () => { tarSubtab = b.dataset.st; paintTarifasView(); });
  if (tarSubtab === "suscripciones") paintSuscripciones();
  else paintTarifas();
}
function paintTarifas() {
  const box = el("tar-body") || el("v-tarifas");
  const admin = isAdmin();
  const term = tarFilter.toLowerCase().trim();
  const list = TARIFAS.filter(t => !term || `${t.nombre || ""} ${t.categoria || ""} ${t.descripcion || ""}`.toLowerCase().includes(term));
  const cats = [...new Set(list.map(t => t.categoria || "General"))];
  let rows = "";
  cats.forEach(cat => {
    rows += `<tr><td colspan="5" class="fs" style="border:0;padding:16px 0 6px">${escape(cat)}</td></tr>`;
    list.filter(t => (t.categoria || "General") === cat).forEach(t => {
      const precio = (t.precio != null && t.precio !== "") ? tarMoney(t.precio) : (t.precioTexto ? escape(t.precioTexto) : "—");
      rows += `<tr>
        <td><b>${escape(t.nombre || "")}</b>${t.activo === false ? ' <span class="badge off">inactivo</span>' : ''}</td>
        <td style="white-space:nowrap"><b>${precio}</b></td>
        <td>${escape(t.plazo || "—")}</td>
        <td style="color:var(--muted);max-width:380px">${escape(t.descripcion || "")}</td>
        <td style="text-align:right;white-space:nowrap">${admin ? `<button class="mini" data-edit="${t.id}">Editar</button> <button class="mini" data-del="${t.id}">✕</button>` : ''}</td></tr>`;
    });
  });
  box.innerHTML = `
    <p class="lead">Catálogo de servicios con precios, plazos y detalle. El Asistente IA del Panel lo usa para responder. ${admin ? 'Edita aquí y se actualiza para todo el equipo.' : ''}</p>
    <div class="toolbar">
      <input id="tar_search" class="mini" style="padding:9px;min-width:240px" placeholder="🔎 Buscar servicio…" value="${escape(tarFilter)}">
      ${admin ? '<button class="btn" id="tar_new">＋ Nuevo servicio</button>' : ''}
      <button class="btn sec" id="tar_export" style="border:1px solid var(--line)" title="Descargar respaldo en CSV">⬇ Exportar</button>
      <span class="msg" id="tar_msg" style="align-self:center"></span>
    </div>
    <table><thead><tr><th>Servicio</th><th>Precio</th><th>Plazo</th><th>En qué consiste</th><th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5" style="color:var(--muted)">Aún no hay servicios. ${admin ? 'Crea el primero con “＋ Nuevo servicio”.' : ''}</td></tr>`}</tbody></table>`;
  el("tar_search").oninput = () => { tarFilter = el("tar_search").value; paintTarifas(); };
  el("tar_export").onclick = () => {
    const H = ["Nombre", "Categoría", "Precio (Bs)", "Precio texto", "Plazo", "Tipo", "Activo", "Descripción"];
    const rws = TARIFAS.map(t => [t.nombre || "", t.categoria || "", (t.precio != null ? t.precio : ""), t.precioTexto || "", t.plazo || "", t.tipo || "", (t.activo === false ? "No" : "Sí"), t.descripcion || ""]);
    downloadCSV("CONTAX-Tarifas-" + hoyISO() + ".csv", H, rws);
  };
  if (el("tar_new")) el("tar_new").onclick = () => openTarifaModal(null);
  el("v-tarifas").querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openTarifaModal(TARIFAS.find(x => x.id === b.dataset.edit)));
  el("v-tarifas").querySelectorAll("[data-del]").forEach(b => b.onclick = () => delTarifa(TARIFAS.find(x => x.id === b.dataset.del)));
}
function openTarifaModal(t) {
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px;width:520px;max-width:96vw;max-height:92vh;overflow:auto">
    <h3 style="margin:0 0 14px">${t ? 'Editar' : 'Nuevo'} servicio</h3>
    <div class="field"><label>Nombre del servicio</label><input id="t_nombre" value="${t ? escape(t.nombre || '') : ''}" placeholder="Ej. Declaración jurada mensual"></div>
    <div class="grid2">
      <div class="field"><label>Categoría</label><input id="t_cat" list="t_catlist" value="${t ? escape(t.categoria || '') : ''}" placeholder="Ej. Trámites"></div>
      <div class="field"><label>Plazo de entrega</label><input id="t_plazo" value="${t ? escape(t.plazo || '') : ''}" placeholder="Ej. 48 a 72 hrs hábiles"></div>
    </div>
    <datalist id="t_catlist">${[...new Set(TARIFAS.map(x => x.categoria).filter(Boolean))].map(c => `<option value="${escape(c)}">`).join("")}</datalist>
    <div class="field"><label>Tipo (para las listas de trabajo)</label><select id="t_tipo"><option value="">Ninguno</option><option value="declaracion">Declaración</option><option value="tramite">Trámite</option><option value="eeff">Balance / EEFF</option><option value="otro">Otro</option></select></div>
    <div class="grid2">
      <div class="field"><label>Precio (Bs) — número</label><input id="t_precio" type="number" step="0.01" value="${t && t.precio != null ? escape(String(t.precio)) : ''}" placeholder="Ej. 150"></div>
      <div class="field"><label>…o precio en texto (si varía)</label><input id="t_preciotxt" value="${t ? escape(t.precioTexto || '') : ''}" placeholder="Ej. Desde Bs 250 / estacional"></div>
    </div>
    <div class="field"><label>En qué consiste (lo lee la IA y sirve para el cliente)</label><textarea id="t_desc" style="min-height:90px">${t ? escape(t.descripcion || '') : ''}</textarea></div>
    <div class="field"><label><input type="checkbox" id="t_activo" ${t && t.activo === false ? '' : 'checked'} style="width:auto;margin-right:6px">Activo (visible para la IA)</label></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn sec" id="t_cancel">Cancelar</button>
      <button class="btn" id="t_save">Guardar</button>
    </div><div class="msg" id="t_modmsg"></div></div>`;
  document.body.appendChild(bg);
  bg.querySelector("#t_tipo").value = t ? (t.tipo || "") : "";
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  bg.querySelector("#t_cancel").onclick = close;
  bg.querySelector("#t_save").onclick = async () => {
    const nombre = bg.querySelector("#t_nombre").value.trim();
    const m = bg.querySelector("#t_modmsg");
    if (!nombre) { m.className = "msg err"; m.textContent = "Ponle un nombre al servicio."; return; }
    const pv = bg.querySelector("#t_precio").value.trim();
    const item = {
      nombre, categoria: bg.querySelector("#t_cat").value.trim() || "General", plazo: bg.querySelector("#t_plazo").value.trim(),
      precio: pv === "" ? null : Number(pv), precioTexto: bg.querySelector("#t_preciotxt").value.trim(),
      descripcion: bg.querySelector("#t_desc").value.trim(), tipo: bg.querySelector("#t_tipo").value, activo: bg.querySelector("#t_activo").checked, updatedAt: serverTimestamp()
    };
    const btn = bg.querySelector("#t_save"); btn.disabled = true; btn.textContent = "Guardando…";
    try {
      if (t && t.id) await setDoc(doc(db, "tarifas", t.id), item, { merge: true });
      else await setDoc(doc(collection(db, "tarifas")), item);
      await tarLoad(); await saveTarifasText(); close(); paintTarifas();
    } catch (e) { btn.disabled = false; btn.textContent = "Guardar"; m.className = "msg err"; m.textContent = "Error: " + (e.code || e.message); }
  };
}
function delTarifa(t) {
  if (!t) return;
  if (!confirm(`¿Eliminar el servicio "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
  deleteDoc(doc(db, "tarifas", t.id)).then(async () => { await tarLoad(); await saveTarifasText(); paintTarifas(); });
}
function buildTarifasText() {
  const act = TARIFAS.filter(t => t.activo !== false);
  if (!act.length) return "";
  let txt = "TARIFAS Y SERVICIOS DE CONTAX (precios y plazos vigentes; usa estos datos para cotizar):\n";
  act.forEach(t => {
    const precio = (t.precio != null && t.precio !== "") ? ("Bs " + t.precio) : (t.precioTexto || "consultar");
    txt += `- ${t.nombre}${t.categoria ? ` [${t.categoria}]` : ''}: ${precio}${t.plazo ? `, plazo ${t.plazo}` : ''}.${t.descripcion ? ` ${t.descripcion}` : ''}\n`;
  });
  return txt.slice(0, 6000);
}
async function saveTarifasText() { try { await setDoc(doc(db, "config", "app"), { tarifasText: buildTarifasText(), updatedAt: serverTimestamp() }, { merge: true }); } catch (e) {} }

// ============================================================
//  MÓDULO SUSCRIPCIONES — control de planes, al día / morosos
//  Se calcula CRUZANDO las recepciones (pagos) con el mes calendario.
//  Regla CONTAX: el mes de la suscripción = mes calendario (no 30 días).
//  Pago del 25 al 30 = anticipado, cubre el mes siguiente (así lo registra
//  la recepcionista en "Mes a recepcionar"). El 1ro, quien no pagó el mes
//  en curso queda, de forma automática y visual, como SUSPENDIDO.
// ============================================================
let suscMesIdx = new Date().getMonth();   // 0-11
let suscAnio = new Date().getFullYear();
let suscFiltro = "";
let suscVista = "morosos";                 // morosos | aldia | todos
const SUSC_PLANES = {
  basico:      { lbl: "Básico",      precio: "30 Bs",      color: "#1f8a4c" },
  standard:    { lbl: "Standard",    precio: "50 / 60 Bs", color: "#0d6efd" },
  premium:     { lbl: "Premium",     precio: "95 Bs",      color: "#7a3ff2" },
  facturacion: { lbl: "Facturación", precio: "20 Bs",      color: "#b8860b" },
  otro:        { lbl: "Otro",        precio: "—",          color: "#55617a" }
};
const SUSC_FLOTAS = ["YANGO", "PEDIDOSYA", "PEDIDOS YA", "TADA", "TOGO", "TO GO", "TURBO", "UBER", "DIDI"];
function suscNorm(s) { return String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(); }
function suscEsServicioSusc(servicio, imp) {
  const s = suscNorm(servicio);
  if (/TRAMITE|BALANCE|EEFF|ESTADO FINANCIERO/.test(s)) return false;
  if (/DECLARAC|FACTURAC|SUSCRIP|MENSUAL/.test(s)) return true;
  return [20, 30, 50, 60, 95].indexOf(Math.round(Number(imp) || 0)) >= 0;
}
function suscEsDeclaracion(servicio, imp) {
  const s = suscNorm(servicio);
  if (/DECLARAC|MENSUAL/.test(s)) return true;
  if (/FACTURAC/.test(s)) return false;
  return [30, 50, 60, 95].indexOf(Math.round(Number(imp) || 0)) >= 0;
}
function suscPlanFromImporte(imp, servicio) {
  const r = Math.round(Number(imp) || 0);
  if (/FACTURAC/.test(suscNorm(servicio)) && r <= 25) return "facturacion";
  if (r === 20) return "facturacion";
  if (r === 30) return "basico";
  if (r === 50 || r === 60) return "standard";
  if (r === 95) return "premium";
  return "otro";
}
function suscEsRepartidor(txt) { const s = suscNorm(txt); return SUSC_FLOTAS.some(f => s.indexOf(f) >= 0); }
// Etiqueta de mes como la usa la recepción: "OCTUBRE./26"
function suscMesLabel(idx, anio) { return REC_MESES[idx] + "./" + String(anio).slice(2); }
function suscKeyDe(r) { return (r.clienteId || r.codigoId || r.nit || r.clienteNombre || "").toString().trim().toUpperCase(); }
function suscTelLimpio(t) { let d = String(t || "").replace(/\D/g, ""); if (d.length >= 8 && d.indexOf("591") !== 0 && d.length <= 9) d = "591" + d; return d; }

// Arma la estructura de suscriptores a partir de las recepciones cargadas (RECEP)
function suscBuild(overrides) {
  overrides = overrides || {};
  const bdByCode = {}, bdByNit = {};
  BD.forEach(r => { const c = suscNorm(bdV(r, "codigoId")); const n = suscNorm(bdV(r, "nit")); if (c) bdByCode[c] = r; if (n) bdByNit[n] = r; });
  const map = {};
  RECEP.forEach(r => {
    const imp = Number(r.importe) || 0;
    if (!suscEsServicioSusc(r.servicio || r.servicioNombre, imp)) return;
    const key = suscKeyDe(r);
    if (!key) return;
    if (!map[key]) {
      const bd = bdByCode[suscNorm(r.clienteId || r.codigoId)] || bdByNit[suscNorm(r.nit)] || null;
      map[key] = {
        key, bd,
        codigoId: r.clienteId || r.codigoId || (bd ? bdV(bd, "codigoId") : ""),
        nit: r.nit || (bd ? bdV(bd, "nit") : ""),
        nombre: r.clienteNombre || (bd ? (bdV(bd, "nombre") || bdV(bd, "razon")) : "") || "—",
        celular: (bd ? bdV(bd, "celular") : "") || r.clienteCelular || "",
        correo: (bd ? bdV(bd, "correo") : "") || r.clienteCorreo || "",
        pagos: [], declPlan: null, declUlt: "", repartidor: false
      };
    }
    const m = map[key];
    m.pagos.push(r);
    if (suscEsRepartidor([r.clienteNombre, r.detalleServicio, r.servicio].join(" "))) m.repartidor = true;
    if (suscEsDeclaracion(r.servicio || r.servicioNombre, imp)) {
      const f = r.fechaPago || r.fechaISO || "";
      if (f >= (m.declUlt || "")) { m.declUlt = f; m.declPlan = suscPlanFromImporte(imp, r.servicio); }
    }
  });
  // Determina plan, estado del mes objetivo y aplica overrides
  const target = suscMesLabel(suscMesIdx, suscAnio);
  const list = [];
  Object.keys(map).forEach(key => {
    const m = map[key];
    const ov = overrides[key] || {};
    if (ov.excluir) return;
    m.plan = ov.plan || m.declPlan || (m.pagos.some(p => /FACTURAC/.test(suscNorm(p.servicio))) ? "facturacion" : "otro");
    // ¿pagó el mes objetivo?
    const pagoMes = m.pagos.find(p => suscNorm(p.mesRecepcion) === suscNorm(target) || suscNorm(p.mesPago) === suscNorm(target));
    m.alDia = !!pagoMes;
    m.pagoMes = pagoMes || null;
    m.importeMes = pagoMes ? (Number(pagoMes.importe) || 0) : 0;
    // estado BD actual (si está en la base)
    m.estadoBD = m.bd ? bdV(m.bd, "estado") : "";
    list.push(m);
  });
  list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  return list;
}

async function paintSuscripciones() {
  const box = el("tar-body"); if (!box) return;
  box.innerHTML = `<p class="lead"><span class="cx-spin"></span> Cargando suscripciones (cruzando pagos del mes)…</p>`;
  const yr = String(suscAnio);
  try {
    await Promise.all([
      (recLoadedGestion !== yr && recLoadedGestion !== "todas") ? recepLoad(yr) : Promise.resolve(),
      new Promise(res => bdEnsureLoaded(() => res()))
    ]);
  } catch (e) {}
  const cfg = await loadConfigDoc();
  const overrides = cfg.suscOverrides || {};
  suscRenderBody(box, overrides);
}

function suscRenderBody(box, overrides) {
  const admin = isAdmin();
  const puedeEditar = !!(ME && ["admin", "supervisor", "editor", "cajero"].includes(ME.role));
  const target = suscMesLabel(suscMesIdx, suscAnio);
  const hoy = new Date();
  const esMesActual = (suscMesIdx === hoy.getMonth() && suscAnio === hoy.getFullYear());
  const esFuturo = (suscAnio > hoy.getFullYear()) || (suscAnio === hoy.getFullYear() && suscMesIdx > hoy.getMonth());
  const dia = hoy.getDate();
  let LIST = suscBuild(overrides);
  const total = LIST.length;
  const alDia = LIST.filter(m => m.alDia);
  const morosos = LIST.filter(m => !m.alDia);
  const ingresos = alDia.reduce((s, m) => s + m.importeMes, 0);
  const porPlan = {}; LIST.forEach(m => { porPlan[m.plan] = (porPlan[m.plan] || 0) + 1; });
  // término de suspensión según el mes elegido
  const etiquetaMoroso = esFuturo ? "Por renovar" : "Suspendido (sin pago)";

  const mesSel = REC_MESES.map((m, i) => `<option value="${i}" ${i === suscMesIdx ? "selected" : ""}>${m.charAt(0) + m.slice(1).toLowerCase()}</option>`).join("");
  const y2 = hoy.getFullYear();
  const anioSel = [];
  for (let y = y2 + 1; y >= 2023; y--) anioSel.push(`<option value="${y}" ${y === suscAnio ? "selected" : ""}>${y}</option>`);

  // Nota de precio Standard según ventana de pago (hoy)
  let notaStd = "";
  if (esMesActual || esFuturo) {
    if (dia >= 25 && dia <= 31) notaStd = `Hoy es día ${dia}: pago <b>anticipado (25–30)</b> → Standard <b>50 Bs</b> para el mes siguiente.`;
    else if (dia >= 1 && dia <= 5) notaStd = `Hoy es día ${dia}: pago <b>regular (1–5)</b> → Standard <b>60 Bs</b>.`;
    else notaStd = `Standard: <b>50 Bs</b> si paga del 25 al 30 (anticipado), <b>60 Bs</b> si paga del 1 al 5.`;
  }

  const planChips = Object.keys(SUSC_PLANES).filter(p => porPlan[p]).map(p =>
    `<span style="display:inline-block;background:${SUSC_PLANES[p].color}22;color:${SUSC_PLANES[p].color};border:1px solid ${SUSC_PLANES[p].color}55;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600;margin:2px">${SUSC_PLANES[p].lbl}: ${porPlan[p]} · ${SUSC_PLANES[p].precio}</span>`).join("");

  const term = suscFiltro.toLowerCase().trim();
  const vistaList = (suscVista === "aldia" ? alDia : suscVista === "todos" ? LIST : morosos)
    .filter(m => !term || `${m.nombre} ${m.nit} ${m.celular}`.toLowerCase().includes(term));

  const planBadge = m => `<span style="background:${SUSC_PLANES[m.plan].color}22;color:${SUSC_PLANES[m.plan].color};border-radius:6px;padding:2px 7px;font-size:11px;font-weight:600">${SUSC_PLANES[m.plan].lbl}</span>${m.repartidor ? ' <span style="background:#ff8c0022;color:#c76a00;border-radius:6px;padding:2px 6px;font-size:10px">repartidor</span>' : ''}`;

  const filas = vistaList.map(m => {
    const estadoTxt = m.alDia
      ? `<span style="color:var(--ok,#1f8a4c);font-weight:600">✓ Al día</span>`
      : `<span style="color:${esFuturo ? '#b8860b' : 'var(--danger)'};font-weight:600">${esFuturo ? '◷ ' : '⛔ '}${etiquetaMoroso}</span>`;
    const tel = suscTelLimpio(m.celular);
    const acc = !m.alDia && tel
      ? `<button class="mini" data-wa="${escape(tel)}" data-nom="${escape(m.nombre)}" title="Abrir WhatsApp para avisarle">📲 Avisar</button>`
      : (m.alDia && m.pagoMes ? `<span style="color:var(--muted);font-size:11px">${escape(m.pagoMes.fechaPago || "")} · Bs ${m.importeMes}</span>` : "");
    return `<tr>
      <td><b>${escape(m.nombre)}</b>${m.nit ? `<div style="color:var(--muted);font-size:11px">NIT ${escape(m.nit)}</div>` : ""}</td>
      <td>${planBadge(m)}</td>
      <td>${escape(m.celular || "—")}</td>
      <td>${estadoTxt}${m.estadoBD ? `<div style="color:var(--muted);font-size:10px">BD: ${escape(m.estadoBD)}</div>` : ""}</td>
      <td style="text-align:right;white-space:nowrap">${acc}${admin ? ` <button class="mini" data-ov="${escape(m.key)}" title="Cambiar plan / excluir">⚙</button>` : ""}</td>
    </tr>`;
  }).join("");

  box.innerHTML = `
    <p class="lead">Control de suscripciones mensuales. El estado <b>al día / suspendido</b> se calcula automáticamente cruzando los pagos registrados en <b>Recepción</b> con el mes que eliges. Modalidad por <b>mes calendario</b>: el pago del 25 al 30 es anticipado y cubre el mes siguiente.</p>

    <div class="toolbar" style="gap:10px;align-items:center;flex-wrap:wrap">
      <label style="font-size:13px;color:var(--muted)">Mes a controlar:</label>
      <select id="su_mes" class="mini">${mesSel}</select>
      <select id="su_anio" class="mini">${anioSel.join("")}</select>
      <button class="mini" id="su_reload" title="Volver a leer los pagos">↻ Actualizar</button>
      <span style="flex:1"></span>
      <input id="su_search" class="mini" style="padding:9px;min-width:200px" placeholder="🔎 Buscar cliente…" value="${escape(suscFiltro)}">
      <button class="btn sec" id="su_export" style="border:1px solid var(--line)" title="Descargar lista en Excel/CSV">⬇ Exportar</button>
    </div>

    <div class="kpis" style="margin:12px 0">
      <div class="kpi"><div class="n">${total}</div><div class="l">Suscriptores</div></div>
      <div class="kpi"><div class="n" style="color:var(--ok,#1f8a4c)">${alDia.length}</div><div class="l">Al día (${REC_MESES[suscMesIdx].toLowerCase()})</div></div>
      <div class="kpi"><div class="n" style="color:${esFuturo ? '#b8860b' : 'var(--danger)'}">${morosos.length}</div><div class="l">${esFuturo ? 'Por renovar' : 'Suspendidos / sin pago'}</div></div>
      <div class="kpi"><div class="n">Bs ${ingresos.toLocaleString("es-BO")}</div><div class="l">Cobrado del mes</div></div>
    </div>
    <div style="margin:4px 0 12px">${planChips || '<span style="color:var(--muted)">Aún no hay planes detectados.</span>'}</div>
    ${notaStd ? `<p class="note" style="margin:0 0 12px">💡 ${notaStd}</p>` : ""}
    ${esMesActual && morosos.length && puedeEditar ? `<p class="note" style="margin:0 0 12px;border-left:3px solid var(--danger);padding-left:10px">Hay <b>${morosos.length}</b> suscriptores sin pago de ${REC_MESES[suscMesIdx].toLowerCase()}. Puedes marcarlos a todos como “Servicio Suspendido” en la Base de Datos con un clic: <button class="mini" id="su_aplicar" style="margin-left:6px">⛔ Aplicar suspensión en la BD</button></p>` : ""}

    <div class="subtabs" style="margin-bottom:8px">
      <button class="subtab ${suscVista === 'morosos' ? 'on' : ''}" data-sv="morosos">${esFuturo ? 'Por renovar' : 'Suspendidos'} (${morosos.length})</button>
      <button class="subtab ${suscVista === 'aldia' ? 'on' : ''}" data-sv="aldia">Al día (${alDia.length})</button>
      <button class="subtab ${suscVista === 'todos' ? 'on' : ''}" data-sv="todos">Todos (${total})</button>
    </div>

    <table><thead><tr><th>Cliente</th><th>Plan</th><th>Celular</th><th>Estado del mes</th><th></th></tr></thead>
    <tbody>${filas || `<tr><td colspan="5" style="color:var(--muted)">${total ? "Nadie en esta vista." : "No se encontraron pagos de suscripción en la gestión " + suscAnio + ". Registra pagos en Recepción o cambia el año."}</td></tr>`}</tbody></table>`;

  // Eventos
  el("su_mes").onchange = () => { suscMesIdx = parseInt(el("su_mes").value, 10); suscRenderBody(box, overrides); };
  el("su_anio").onchange = () => { suscAnio = parseInt(el("su_anio").value, 10); paintSuscripciones(); };
  el("su_reload").onclick = () => { recLoadedGestion = null; paintSuscripciones(); };
  el("su_search").oninput = () => { suscFiltro = el("su_search").value; suscRenderBody(box, overrides); };
  box.querySelectorAll(".subtab[data-sv]").forEach(b => b.onclick = () => { suscVista = b.dataset.sv; suscRenderBody(box, overrides); });
  box.querySelectorAll("[data-wa]").forEach(b => b.onclick = () => suscAvisar(b.dataset.wa, b.dataset.nom));
  box.querySelectorAll("[data-ov]").forEach(b => b.onclick = () => suscOverrideModal(b.dataset.ov, LIST.find(x => x.key === b.dataset.ov), overrides));
  if (el("su_export")) el("su_export").onclick = () => {
    const H = ["Cliente", "NIT", "Celular", "Correo", "Plan", "Precio", "Repartidor", "Estado del mes", "Pagó (fecha)", "Importe", "Estado BD"];
    const rws = vistaList.map(m => [m.nombre, m.nit, m.celular, m.correo, SUSC_PLANES[m.plan].lbl, SUSC_PLANES[m.plan].precio, m.repartidor ? "Sí" : "No", m.alDia ? "Al día" : etiquetaMoroso, m.pagoMes ? (m.pagoMes.fechaPago || "") : "", m.importeMes || "", m.estadoBD]);
    downloadCSV("CONTAX-Suscripciones-" + REC_MESES[suscMesIdx] + suscAnio + ".csv", H, rws);
  };
  if (el("su_aplicar")) el("su_aplicar").onclick = () => suscAplicarSuspension(morosos.filter(m => m.bd));
}

// Abre WhatsApp con un mensaje de aviso de renovación
function suscAvisar(tel, nombre) {
  const mes = REC_MESES[suscMesIdx].charAt(0) + REC_MESES[suscMesIdx].slice(1).toLowerCase();
  const txt = `Hola ${nombre || ""}, le saluda CONTAX 👋. Le recordamos que su suscripción del mes de ${mes} está pendiente de pago. Para reactivar su servicio puede cancelar del 25 al 30 (tarifa anticipada) o del 1 al 5. ¡Gracias!`;
  window.open("https://wa.me/" + tel + "?text=" + encodeURIComponent(txt), "_blank");
}

// Modal admin: cambiar plan o excluir a un cliente de las suscripciones
function suscOverrideModal(key, m, overrides) {
  if (!m) return;
  const ov = overrides[key] || {};
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const opts = Object.keys(SUSC_PLANES).map(p => `<option value="${p}" ${((ov.plan || m.plan) === p) ? "selected" : ""}>${SUSC_PLANES[p].lbl} (${SUSC_PLANES[p].precio})</option>`).join("");
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px;width:440px;max-width:96vw">
    <h3 style="margin:0 0 6px">Ajustar suscripción</h3>
    <p style="color:var(--muted);margin:0 0 14px">${escape(m.nombre)}${m.nit ? " · NIT " + escape(m.nit) : ""}</p>
    <div class="field"><label>Plan (forzar manualmente)</label><select id="ov_plan">${opts}</select>
      <div style="color:var(--muted);font-size:12px;margin-top:4px">Normalmente el plan se detecta solo por el monto pagado. Úsalo solo si quieres corregirlo.</div></div>
    <div class="field"><label><input type="checkbox" id="ov_excl" ${ov.excluir ? "checked" : ""} style="width:auto;margin-right:6px">No es suscriptor (excluir de esta lista)</label></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn sec" id="ov_cancel">Cancelar</button>
      <button class="btn" id="ov_save">Guardar</button>
    </div><div class="msg" id="ov_msg"></div></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  bg.querySelector("#ov_cancel").onclick = close;
  bg.querySelector("#ov_save").onclick = async () => {
    const nuevo = Object.assign({}, overrides);
    nuevo[key] = { plan: bg.querySelector("#ov_plan").value, excluir: bg.querySelector("#ov_excl").checked };
    if (!nuevo[key].excluir && nuevo[key].plan === (m.declPlan || "")) delete nuevo[key].plan;
    const btn = bg.querySelector("#ov_save"); btn.disabled = true; btn.textContent = "Guardando…";
    try {
      await setDoc(doc(db, "config", "app"), { suscOverrides: nuevo, updatedAt: serverTimestamp() }, { merge: true });
      close(); paintSuscripciones();
    } catch (e) { btn.disabled = false; btn.textContent = "Guardar"; bg.querySelector("#ov_msg").className = "msg err"; bg.querySelector("#ov_msg").textContent = "Error: " + (e.code || e.message) + " (solo el administrador puede ajustar planes)."; }
  };
}

// Marca en la Base de Datos (bdclientes) a los morosos del mes como suspendidos, de una vez
async function suscAplicarSuspension(morosos) {
  if (!morosos.length) { alert("No hay morosos con ficha en la Base de Datos para suspender."); return; }
  const ESTADO = "SUSCRIPCIÓN INACTIVA";
  if (!confirm(`Se marcará a ${morosos.length} cliente(s) como "${ESTADO}" en la Base de Datos (los que no pagaron ${REC_MESES[suscMesIdx].toLowerCase()}).\n\nEsto cambia su estado y queda en el registro de Movimientos. ¿Continuar?`)) return;
  const btn = el("su_aplicar"); if (btn) { btn.disabled = true; btn.textContent = "Aplicando…"; }
  let ok = 0, err = 0;
  for (const m of morosos) {
    try {
      const estAnt = bdV(m.bd, "estado");
      if (suscNorm(estAnt) === suscNorm(ESTADO)) { ok++; continue; }
      const hdr = (bdKey2Header && bdKey2Header["estado"]) || BD_KEY2LBL["estado"];
      const itemByHeader = {}; itemByHeader[hdr] = ESTADO; itemByHeader["_bajaISO"] = new Date().toISOString();
      const done = await bdSave({}, bdV(m.bd, "codigoId"), itemByHeader, m.bd._docid);
      if (done) { ok++; bdLog({ accion: "cambio_estado", nombre: m.nombre, estadoAnterior: estAnt, estadoNuevo: ESTADO }); }
      else err++;
    } catch (e) { err++; }
  }
  bdLoaded = false;
  if (btn) { btn.disabled = false; btn.textContent = "⛔ Aplicar suspensión en la BD"; }
  alert(`Listo: ${ok} suspendido(s)${err ? ", " + err + " con error" : ""}. Se actualizó la Base de Datos y el registro de Movimientos.`);
  paintSuscripciones();
}

// ============================================================
//  MÓDULO ASISTENTE IA (Panel) — chat para todo el equipo
// ============================================================
let asisMsgs = [];
async function renderAsistente() {
  const cfg = await loadConfigDoc();
  const hasKey = !!(cfg.aiKey || cfg.geminiKey);
  el("v-asistente").innerHTML = `<h1>Asistente IA</h1>
    <p class="lead">Pregúntale lo que necesites. Conoce el conocimiento de la empresa y las tarifas. ${hasKey ? '' : '<b style="color:var(--danger)">Falta configurar la clave de IA</b> en ⚙️ Configuración.'}</p>
    <div id="as_chat" style="border:1px solid var(--line);border-radius:14px;background:var(--panel);min-height:320px;max-height:58vh;overflow:auto;padding:16px;margin-bottom:12px"></div>
    <textarea id="as_in" style="width:100%;min-height:58px;padding:11px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;color:var(--txt);font-size:14px;font-family:inherit" placeholder="Escribe tu pregunta…  (Ctrl/Cmd + Enter para enviar)"></textarea>
    <div class="toolbar" style="margin-top:10px">
      <button class="btn" id="as_send">Enviar</button>
      <button class="btn sec" id="as_clear">Limpiar conversación</button>
    </div>`;
  paintAsis();
  el("as_send").onclick = asisSend;
  el("as_clear").onclick = () => { asisMsgs = []; paintAsis(); };
  el("as_in").addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); asisSend(); } });
}
function paintAsis() {
  const c = el("as_chat"); if (!c) return;
  if (!asisMsgs.length) { c.innerHTML = `<div style="color:var(--muted);text-align:center;padding:40px 10px">Escribe tu primera pregunta. Por ejemplo:<br>“¿Cuánto cuesta la actualización de matrícula y qué incluye?”</div>`; return; }
  c.innerHTML = asisMsgs.map(m => {
    const me = m.role === "user";
    return `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin-bottom:10px">
      <div style="max-width:82%;padding:10px 13px;border-radius:12px;white-space:pre-wrap;font-size:13.5px;line-height:1.5;${me ? 'background:var(--accent);color:var(--accent-ink)' : 'background:var(--panel2);border:1px solid var(--line);color:var(--txt)'}">${escape(m.text)}</div></div>`;
  }).join("");
  c.scrollTop = c.scrollHeight;
}
async function asisSend() {
  const inp = el("as_in"); const q = (inp.value || "").trim(); if (!q) return;
  asisMsgs.push({ role: "user", text: q }); inp.value = ""; paintAsis();
  asisMsgs.push({ role: "assistant", text: "…" }); paintAsis();
  const cfg = await loadConfigDoc();
  let sys = "Eres el asistente interno de CONTAX (consultora de contabilidad e impuestos en Santa Cruz, Bolivia). Responde de forma clara, útil y bien organizada, con tono cordial y profesional. Si la pregunta es sobre precios o servicios, usa EXACTAMENTE las tarifas provistas. No inventes datos; si no lo sabes, dilo con honestidad.";
  if (cfg.aiContext) sys += "\n\nCONOCIMIENTO DE LA EMPRESA:\n" + String(cfg.aiContext).slice(0, 6000);
  if (cfg.tarifasText) sys += "\n\n" + String(cfg.tarifasText).slice(0, 6000);
  try {
    const r = await panelAI(cfg, sys, q);
    asisMsgs[asisMsgs.length - 1] = { role: "assistant", text: r || "(sin respuesta)" };
  } catch (e) {
    asisMsgs[asisMsgs.length - 1] = { role: "assistant", text: "⚠️ " + (e.message || "No se pudo contactar a la IA.") };
  }
  paintAsis();
}
async function panelAI(cfg, system, user) {
  const key = (cfg.aiKey || cfg.geminiKey || "").trim();
  if (!key) throw new Error("Falta la clave de IA. Configúrala en ⚙️ Configuración.");
  const prov = cfg.provider || (/^sk-/.test(key) ? "deepseek" : "gemini");
  if (prov === "deepseek") {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ model: cfg.aiModel || "deepseek-chat", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.6 })
    });
    if (!res.ok) { let t = ""; try { t = ((await res.json()).error || {}).message || ""; } catch (e) {} throw new Error("DeepSeek: " + (t || res.status)); }
    const d = await res.json(); return ((((d.choices || [])[0] || {}).message || {}).content || "").trim();
  }
  const models = [cfg.aiModel, "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"].filter((m, i, a) => m && a.indexOf(m) === i);
  const body = JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 900 } });
  let lastErr = "";
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) { let t = ""; try { t = ((await res.json()).error || {}).message || ""; } catch (e) {} lastErr = t || ("HTTP " + res.status); if (res.status === 404) continue; throw new Error("Gemini: " + lastErr); }
      const d = await res.json();
      const txt = ((((d.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("").trim();
      if (txt) return txt;
      lastErr = "respuesta vacía";
    } catch (e) { lastErr = e.message; }
  }
  throw new Error("IA: " + (lastErr || "sin respuesta"));
}


// ============================================================
//  MÓDULO OPERACIONES — Recepción · Dashboard · Listas
// ============================================================
let RECEP = [], recepLoaded = false, recFilterMes = "", recFlash = "", recGestion = String(new Date().getFullYear()), recLoadedGestion = null, recepError = "";
async function recepLoad(gestion) {
  gestion = gestion || recGestion || String(new Date().getFullYear());
  try {
    let q;
    if (gestion === "todas") {
      q = query(collection(db, "recepciones"), orderBy("fechaISO", "desc"), limit(1500));
    } else {
      const a = gestion + "-01-01", b = (Number(gestion) + 1) + "-01-01";
      q = query(collection(db, "recepciones"), where("fechaISO", ">=", a), where("fechaISO", "<", b), orderBy("fechaISO", "desc"), limit(3000));
    }
    const snap = await getDocs(q);
    RECEP = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
    RECEP.sort((a, b) => (b.fechaISO || "").localeCompare(a.fechaISO || ""));
    recLoadedGestion = gestion; recepLoaded = true; recepError = "";
  } catch (e) { recepError = e.code || e.message; recepLoaded = true; /* conserva lo que ya había */ }
}
function money(n) { return "Bs " + (Number(n) || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtFecha(iso) { if (!iso) return ""; try { return new Date(iso).toLocaleString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return iso; } }
function mesKey(iso) { return (iso || "").slice(0, 7); }
async function recibosUrlGet() { const cfg = await loadConfigDoc(); return (cfg.recibosUrl || "").trim(); }
// ===== Listas configurables de Recepción (con valores semilla) =====
const REC_SEED = {
  servicios: ["DECLARACIÓN MENSUAL", "TRÁMITES", "BALANCE", "DECLARACIÓN MENSUAL 2024", "FACTURACIÓN YANGO", "SERVICIOS MTG - YANGO", "Servicios de Emisión de Facturas, Verificaciones de Documentos"],
  detalles: ["DDJJ - Sin Movimiento", "DDJJ - Con Su Crédito Fiscal Anterior", "DDJJ - Facturas ELECTRÓNICAS", "DDJJ - Facturas MANUALES", "DDJJ - Facturas MIXTAS (Electrónicas y Manuales)", "FORM 110 - RC IVA (Dependientes)", "TRÁMITES RIDERS (Matrícula - ROE)", "TRÁMITE MATRÍCULA (APERTURA)", "TRÁMITE MATRÍCULA (CIERRE)", "TRÁMITE ROE", "TRÁMITE ACTUALIZACION DE ACTIVIDADES ECONOMICAS", "TRÁMITE ACTUALIZACIÓN SEPREC", "BALANCE DE APERTURA", "BALANCE GENERAL", "BALANCE DE CIERRE", "INICIO DE SERVICIOS CONTABLES"],
  pagos: ["EFECTIVO", "TRANSFERENCIA", "DEUDOR"],
  atencion: ["AILYN", "SOLEDAD", "JHONNY", "KEVIN"],
  cuentas: ["ALQUILER", "AGUA", "LUZ", "INTERNET", "SUELDOS", "LINEA CORPORATIVA", "IMPUESTOS", "INTERESES"]
};
const REC_MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
function recMesesOpts() {
  const out = []; const y2 = new Date().getFullYear() + 1;
  for (let y = y2; y >= 2023; y--) { const yy = String(y).slice(2); REC_MESES.forEach(m => out.push(m + "./" + yy)); }
  return out;
}
function recListas(cfg) {
  const L = (cfg && cfg.recListas) || {};
  const pick = (k) => (Array.isArray(L[k]) && L[k].length) ? L[k] : REC_SEED[k];
  return { servicios: pick("servicios"), detalles: pick("detalles"), pagos: pick("pagos"), atencion: pick("atencion"), cuentas: pick("cuentas") };
}
// Numeración automática continua (lee config, usa el número y guarda el siguiente)
async function recNextNum(field, fallback) {
  const cfg = await loadConfigDoc();
  let n = parseInt(cfg[field], 10); if (!Number.isFinite(n)) n = fallback;
  try { await setDoc(doc(db, "config", "app"), { [field]: n + 1, updatedAt: serverTimestamp() }, { merge: true }); } catch (e) {}
  return n;
}
// Clasifica el servicio/detalle en la lista de trabajo (declaración / trámite / EEFF)
function recTipoDe(servicio, detalle) {
  const s = ((servicio || "") + " " + (detalle || "")).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/BALANCE|EEFF|ESTADO FINANC|SERVICIOS CONTABLES/.test(s)) return "eeff";
  if (/TRAMITE|MATRICULA|ROE|SEPREC|ACTUALIZ/.test(s)) return "tramite";
  if (/DDJJ|DECLARAC|FORM 110|RC IVA/.test(s)) return "declaracion";
  return "";
}
function nitUltimo(nit) { const d = String(nit || "").replace(/\D/g, ""); return d ? d.slice(-3) : ""; }
function recDiaSemana(d) { try { return d.toLocaleDateString("es-BO", { weekday: "long" }); } catch (e) { return ""; } }

async function postRecibo(rec) {
  const url = await recibosUrlGet(); if (!url) return false;
  const cfg = await loadConfigDoc();
  const payload = {
    action: "recibo", to: rec.clienteCorreo, nombre: rec.clienteNombre, nit: rec.nit || "", idCliente: rec.clienteId || "",
    celular: rec.clienteCelular || "", correo: rec.clienteCorreo || "", tipoContribuyente: rec.tipoContribuyente || "",
    rubro: rec.rubro || "", actividad: rec.actividad || "", aperturaNit: rec.aperturaNit || "", matricula: rec.matriculaComercio || "",
    nroRecepcion: rec.nroRecepcion || "", nroRecibo: rec.nroComprobante || "", dia: rec.dia || "", fecha: rec.fecha || "", hora: rec.hora || "",
    mes: rec.mesRecepcion || "", tipoServicio: rec.servicio || "", detalleServicio: rec.detalleServicio || "",
    importe: rec.importe, formaPago: rec.tipoPago || "", atencion: rec.atencion || "", comentarios: rec.comentarios || "",
    fechaPago: rec.fechaPago || "", compBanco: rec.compBanco || "", compNroOperacion: rec.compNroOperacion || "", compDepositante: rec.compDepositante || "",
    empresa: (cfg.company || "CONTAX")
  };
  try { await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }); return true; }
  catch (e) { return false; }
}

// ---------- RECEPCIÓN (completa) ----------
let recCli = null; // cliente seleccionado para autollenado
let recSubtab = "form", recListFilter = "", recListSort = "fecha", recLastRec = null;
// Genera la Orden de Recepción en HTML (misma que el correo) para ver/descargar/imprimir como PDF
function comprobanteHTML(r) {
  const nv = "#16233f";
  const row = (l, v) => v ? `<tr><td style="color:#55617a;white-space:nowrap;padding:2px 10px 2px 0;font-size:12px">${l}</td><td style="font-size:12px;padding:2px 0">${escape(v)}</td></tr>` : "";
  const money2 = v => { const n = Number(v); return "Bs" + (isNaN(n) ? v : n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })); };
  const comp = (r.compBanco || r.compNroOperacion || r.compDepositante) ? `<div style="margin-top:12px;font-size:11px;color:#55617a;border-top:1px solid #eef0f4;padding-top:8px">Datos de la transacción: ${[r.compBanco ? "Banco " + r.compBanco : "", r.compNroOperacion ? "N° oper. " + r.compNroOperacion : "", r.compDepositante ? "Depositante " + r.compDepositante : ""].filter(Boolean).map(escape).join(" · ")}</div>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Orden de Recepción ${escape(String(r.nroRecepcion || ""))}</title>
  <style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box;font-family:Helvetica,Arial,sans-serif;color:#1f2a3a}body{margin:0}
  .band{background:${nv};color:#fff;text-align:center;padding:24px 0 20px}.band .t{font-size:38px;letter-spacing:.22em}
  .sub{text-align:center;font-size:22px;color:#2b3952;margin:16px 0 6px}.wrap{padding:0 46px}
  .cols{display:flex;gap:30px;border-top:1px solid #dfe3ea;padding-top:14px;margin-top:8px}.col{flex:1}.ch{text-align:center;font-size:15px;color:#2b3952;margin:0 0 8px}
  table.serv{width:100%;border-collapse:collapse;margin-top:8px}table.serv th{border-top:1px solid #cfd4de;border-bottom:1px solid #cfd4de;padding:9px 6px;font-size:12px;color:#2b3952;text-align:left}
  table.serv td{padding:14px 6px;font-size:12px;border-bottom:1px solid #eef0f4}.r{text-align:right}
  .tot{margin-top:14px;text-align:right;font-size:13px;line-height:1.9}.disc{margin:34px 46px 0;font-size:10.5px;color:#55617a;font-style:italic;text-align:center}
  .foot{margin-top:30px;background:${nv};color:#cdd4e2;font-size:10px;padding:9px 46px;display:flex;justify-content:space-between}
  .noprint{text-align:center;margin:16px}@media print{.noprint{display:none}}</style></head><body>
  <div class="noprint"><button onclick="window.print()" style="padding:10px 18px;font-size:14px;cursor:pointer;background:#16233f;color:#fff;border:none;border-radius:8px">Imprimir / Guardar como PDF</button></div>
  <div class="band"><div class="t">CONTAX</div></div><div class="sub">Orden de Recepción</div>
  <div class="wrap"><div class="cols">
    <div class="col"><div class="ch">Datos del Cliente</div><table>${row("Nombre del Cliente:", r.clienteNombre)}${row("NIT:", r.nit)}${row("ID Cliente:", r.clienteId)}${row("Celular:", r.clienteCelular)}${row("Correo:", r.clienteCorreo)}${row("Tipo de Contribuyente:", r.tipoContribuyente)}${row("Rubro:", r.rubro)}${row("Apertura de NIT:", r.aperturaNit)}</table></div>
    <div class="col"><div class="ch">Datos de Recepción</div><table>${row("Nro Recepción:", String(r.nroRecepcion || ""))}${row("Nro Recibo:", String(r.nroComprobante || ""))}${row("Día:", r.dia)}${row("Fecha:", r.fecha)}${row("Hora:", r.hora)}${row("Fecha de pago:", r.fechaPago)}</table></div>
  </div>
  <div class="sub" style="margin-top:22px">Datos del Servicio</div>
  <table class="serv"><tr><th>Mes</th><th>Tipo de Servicio</th><th>Nro Recepción</th><th class="r">Importe</th></tr>
  <tr><td>${escape(r.mesRecepcion || "")}</td><td>${escape(r.servicio || r.servicioNombre || "")}${r.detalleServicio ? `<br><span style="color:#55617a">${escape(r.detalleServicio)}</span>` : ""}</td><td>${escape(String(r.nroRecepcion || ""))}</td><td class="r">${money2(r.importe)}</td></tr></table>
  <div class="tot">Total: <b>${money2(r.importe)}</b><br>Forma de Pago: <b>${escape(r.tipoPago || "")}</b><br>Atención: <b>${escape(r.atencion || "")}</b>${r.comentarios ? `<br><span style="color:#55617a;font-size:11px">${escape(r.comentarios)}</span>` : ""}</div>${comp}
  </div>
  <div class="disc">"CONTAX no asume responsabilidad alguna por declaraciones presentadas fuera de plazo o multas derivadas de la falta de entrega oportuna de documentación por parte del cliente. Es responsabilidad del cliente garantizar la entrega correcta y a tiempo de toda la documentación necesaria."</div>
  <div class="foot"><span>Dir.: Urbanización El Palmar Calle Zafiro Nro. S/N Zona Sur - 6to Anillo Av. Bolivia</span><span>Contacto: 690-21969</span><span>Correo: info@contaxbolivia.com</span></div>
  </body></html>`;
}
function verComprobante(r) {
  if (!r) return;
  const w = window.open("", "_blank");
  if (!w) { alert("Permite las ventanas emergentes para ver el comprobante."); return; }
  w.document.write(comprobanteHTML(r)); w.document.close();
}
async function renderRecepcion() {
  el("v-recepcion").innerHTML = `<h1>Recepción</h1><p class="lead"><span class="cx-spin"></span> Cargando…</p>`;
  // Solo cargamos los clientes para el formulario; el historial se carga al abrir "Lista".
  bdEnsureLoaded(() => { BD.forEach((r, i) => r._i = i); paintRecepcion(); });
}
function recFill(id, v) { const e = el(id); if (e) e.value = v == null ? "" : v; }
function recSortList(list) {
  const l = list.slice();
  if (recListSort === "cliente") l.sort((a, b) => String(a.clienteNombre || "").localeCompare(String(b.clienteNombre || "")));
  else if (recListSort === "nrorec") l.sort((a, b) => (Number(b.nroRecepcion) || 0) - (Number(a.nroRecepcion) || 0));
  else if (recListSort === "importe") l.sort((a, b) => (Number(b.importe) || 0) - (Number(a.importe) || 0));
  else l.sort((a, b) => String(b.fechaISO || "").localeCompare(String(a.fechaISO || "")));
  return l;
}
function paintRecepcion() {
  const canEdit = canEditClientes();
  // La "Lista" carga el historial de la gestión elegida SOLO cuando se abre (ahorra lecturas)
  if (recSubtab === "list" && recLoadedGestion !== recGestion) {
    el("v-recepcion").innerHTML = `<h1>Recepción</h1>
      <div class="subtabs"><button class="subtab" data-st="form">Registrar</button><button class="subtab on" data-st="list">Lista</button></div>
      <p class="lead"><span class="cx-spin"></span> Cargando recepciones de la gestión ${escape(recGestion)}…</p>`;
    el("v-recepcion").querySelectorAll(".subtab").forEach(b => b.onclick = () => { recSubtab = b.dataset.st; paintRecepcion(); });
    recepLoad(recGestion).then(() => paintRecepcion());
    return;
  }
  loadConfigDoc().then(cfg => {
    const L = recListas(cfg);
    const nextRec = parseInt(cfg.nextRecep, 10) || 7048;
    const nextCom = parseInt(cfg.nextRecibo, 10) || 7784;
    const mesesOpts = recMesesOpts();
    // Buscador de cliente (datalist con todos los de la Base de Datos)
    const cliDL = BD.map(c => `<option value="${escape((bdV(c, "codigoId") ? bdV(c, "codigoId") + " · " : "") + (bdV(c, "nombre") || bdV(c, "razon") || ""))}">`).join("");
    const now = new Date();
    const hoyIso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    // Lista filtrada + ordenada
    const term = recListFilter.toLowerCase();
    let list = RECEP.slice();
    if (term) list = list.filter(r => [r.clienteNombre, r.nit, r.servicio, r.detalleServicio, r.mesRecepcion, r.atencion, r.tipoPago, String(r.nroRecepcion), String(r.nroComprobante)].join(" ").toLowerCase().includes(term));
    list = recSortList(list);
    const totalAll = RECEP.reduce((s, r) => s + (Number(r.importe) || 0), 0);
    const rows = list.map(r => `<tr data-rec="${r.id}">
       <td class="mono">${escape(r.fecha || fmtFecha(r.fechaISO))}${r.hora ? `<div style="color:var(--muted);font-size:11px">${escape(r.hora)}</div>` : ''}</td>
       <td class="mono">${escape(String(r.nroRecepcion || "—"))}</td>
       <td class="mono">${escape(String(r.nroComprobante || "—"))}</td>
       <td><b>${escape(r.clienteNombre || "—")}</b>${r.nit ? `<div style="color:var(--muted);font-size:11px">NIT ${escape(r.nit)}</div>` : ''}</td>
       <td>${escape(r.servicio || r.servicioNombre || "—")}${r.detalleServicio ? `<div style="color:var(--muted);font-size:11px">${escape(r.detalleServicio)}</div>` : ''}</td>
       <td>${escape(r.mesRecepcion || "—")}</td>
       <td>${escape(r.fechaPago || "—")}</td>
       <td class="mono" style="text-align:right">${money(r.importe)}</td>
       <td>${escape(r.tipoPago || "—")}</td>
       <td>${escape(r.atencion || "—")}</td>
       <td style="text-align:center">${(r.tipoPago === "DEUDOR" || r.estadoDeuda === "con_deuda") ? '<span class="badge danger">Con deuda</span>' : '<span class="badge ok">Sin deuda</span>'}</td>
       <td style="text-align:right;white-space:nowrap"><button class="mini" data-ver="${r.id}">Ver</button>${canEdit ? ` <button class="mini" data-recibo="${r.id}">Recibo</button>` : ''}${isAdmin() ? ` <button class="mini" data-delr="${r.id}">✕</button>` : ''}</td></tr>`).join("");

    const formHTML = !canEdit ? '<div class="note">Tu rol puede ver la recepción pero no registrar.</div>' : `
      <div class="formcard">
        <div class="fs">Datos automáticos</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px">
          <div class="field"><label>N° Recepción</label><input id="r_nrorec" value="${nextRec}"></div>
          <div class="field"><label>N° Comprobante</label><input id="r_nrocom" value="${nextCom}"></div>
          <div class="field"><label>Fecha</label><input id="r_fecha" value="${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}"></div>
          <div class="field"><label>Hora</label><input id="r_hora" value="${now.toLocaleTimeString("es-BO", { hour12: false })}"></div>
          <div class="field"><label>NIT</label><input id="r_nit" placeholder="—"></div>
          <div class="field"><label>Último dígito NIT</label><input id="r_ult" placeholder="—"></div>
          <div class="field"><label>Presta servicios a</label><input id="r_rubro" placeholder="—"></div>
          <div class="field"><label>ID Cliente</label><input id="r_idcli" placeholder="—"></div>
        </div>
        <div class="fs" style="margin-top:12px">Llenar datos</div>
        <div class="field"><label>Cliente (escribe para buscar)</label><input id="r_clibusca" list="r_cli_dl" placeholder="Escribe el nombre o código y elige de la lista" autocomplete="off"><datalist id="r_cli_dl">${cliDL}</datalist></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">
          <div class="field"><label>Nombre / Razón Social</label><input id="r_nombre" placeholder="Nombre completo"></div>
          <div class="field"><label>Correo (para el recibo)</label><input id="r_correo" type="email" placeholder="cliente@correo.com"></div>
          <div class="field"><label>Celular</label><input id="r_cel" placeholder="7xxxxxxx"></div>
          <div class="field"><label>Servicio (SERVICIOS CONTAX)</label><select id="r_serv"><option value="">— elegir —</option>${L.servicios.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Detalle de servicio</label><select id="r_det"><option value="">— elegir —</option>${L.detalles.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Mes a recepcionar</label><select id="r_mesrec"><option value="">—</option>${mesesOpts.map(m => `<option>${escape(m)}</option>`).join("")}</select></div>
          <div class="field"><label>Mes de pago</label><select id="r_mespago"><option value="">—</option>${mesesOpts.map(m => `<option>${escape(m)}</option>`).join("")}</select></div>
          <div class="field"><label>Fecha de pago real</label><input id="r_fpago" type="date" value="${hoyIso}" title="Cuándo pagó el cliente (para la conciliación)"></div>
          <div class="field"><label>Total (Bs)</label><input id="r_total" type="number" step="0.01" placeholder="0.00"></div>
          <div class="field"><label>Forma de pago</label><select id="r_pago">${L.pagos.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Atención</label><select id="r_at"><option value="">—</option>${L.atencion.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label>Comentarios</label><input id="r_com" placeholder="Observaciones (NO la fecha de pago, esa va arriba)"></div>
        <div class="fs" style="margin-top:12px">Datos del comprobante / transacción (opcional)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">
          <div class="field"><label>Banco</label><input id="r_banco" placeholder="Ej. BNB, BCP…"></div>
          <div class="field"><label>N° de operación</label><input id="r_oper" placeholder="—"></div>
          <div class="field"><label>Depositante</label><input id="r_depo" placeholder="Quién hizo el pago"></div>
        </div>
        <p class="note" style="margin:8px 0 4px">📧 Al registrar se enviará automáticamente la Orden de Recepción al correo del cliente (si tiene correo).</p>
        <button class="btn" id="r_save">Registrar recepción</button>
        <div class="msg" id="r_msg"></div>
      </div>`;

    const yNow = new Date().getFullYear();
    const yearOpts = [];
    for (let y = yNow; y >= 2022; y--) yearOpts.push(`<option value="${y}" ${String(y) === recGestion ? "selected" : ""}>Gestión ${y}</option>`);
    yearOpts.push(`<option value="todas" ${recGestion === "todas" ? "selected" : ""}>Todas (últimas 1500)</option>`);
    const listHTML = `
      <div class="kpis" style="margin-top:4px">
        <div class="kpi"><div class="n">${RECEP.length}</div><div class="l">Recepciones (${escape(recGestion === "todas" ? "todas" : "gestión " + recGestion)})</div></div>
        <div class="kpi"><div class="n">${money(totalAll)}</div><div class="l">Total de la gestión</div></div>
        <div class="kpi"><div class="n" style="color:var(--danger)">${RECEP.filter(r => r.tipoPago === "DEUDOR" || r.estadoDeuda === "con_deuda").length}</div><div class="l">Con deuda</div></div>
      </div>
      ${recepError ? `<p class="msg err">No se pudo leer: ${escape(recepError)}. Toca "Actualizar".</p>` : ""}
      <div class="toolbar">
        <select id="r_gestion" class="mini" style="padding:9px" title="Mostrar solo esta gestión (año)">${yearOpts.join("")}</select>
        <input id="r_buscar" class="mini" style="padding:9px;min-width:220px" placeholder="🔎 Buscar en esta gestión…" value="${escape(recListFilter)}">
        <select id="r_sort" class="mini" style="padding:9px">
          <option value="fecha">Más recientes</option>
          <option value="cliente">Cliente (A-Z)</option>
          <option value="nrorec">N° Recepción</option>
          <option value="importe">Importe (mayor)</option>
        </select>
        <button class="btn sec" id="r_reload" style="border:1px solid var(--line)">↻ Actualizar</button>
        <button class="btn sec" id="r_export" style="border:1px solid var(--line)">⬇ Exportar</button>
      </div>
      <div class="bd-scroll"><table class="bd-table"><thead><tr><th>Fecha</th><th>N° Rec</th><th>N° Comp</th><th>Cliente</th><th>Servicio</th><th>Mes</th><th>F. pago</th><th style="text-align:right">Total</th><th>Pago</th><th>Atención</th><th>Deuda</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="12" style="color:var(--muted)">Sin recepciones${term ? " con ese filtro" : " todavía"}.</td></tr>`}</tbody></table></div>`;

    el("v-recepcion").innerHTML = `<h1>Recepción</h1>
      <div class="subtabs">
        <button class="subtab ${recSubtab === 'form' ? 'on' : ''}" data-st="form">Registrar</button>
        <button class="subtab ${recSubtab === 'list' ? 'on' : ''}" data-st="list">Lista (${RECEP.length})</button>
      </div>
      <div ${recSubtab === 'form' ? '' : 'style="display:none"'} id="r_pane_form">${formHTML}</div>
      <div ${recSubtab === 'list' ? '' : 'style="display:none"'} id="r_pane_list">${listHTML}</div>`;

    el("v-recepcion").querySelectorAll(".subtab").forEach(b => b.onclick = () => { recSubtab = b.dataset.st; paintRecepcion(); });

    if (canEdit && recSubtab === "form") {
      const busca = el("r_clibusca");
      if (busca) busca.oninput = () => {
        const val = busca.value.trim();
        const code = val.split(" · ")[0].trim();
        let c = BD.find(x => bdV(x, "codigoId") === code && code);
        if (!c) { const nm = val.split(" · ").slice(1).join(" · ").trim() || val; c = BD.find(x => (bdV(x, "nombre") || bdV(x, "razon")) === nm); }
        if (c) {
          recCli = c;
          recFill("r_nombre", bdV(c, "nombre") || bdV(c, "razon")); recFill("r_nit", bdV(c, "nit")); recFill("r_ult", nitUltimo(bdV(c, "nit")));
          recFill("r_rubro", bdV(c, "brinda")); recFill("r_idcli", bdV(c, "codigoId"));
          recFill("r_correo", bdV(c, "correo")); recFill("r_cel", bdV(c, "celular"));
        }
      };
      if (el("r_save")) el("r_save").onclick = registrarRecepcion;
      if (recFlash && el("r_msg")) {
        el("r_msg").className = "msg ok"; el("r_msg").innerHTML = escape(recFlash) + (recLastRec ? ` <button class="btn sec" id="r_vercomp" style="border:1px solid var(--line);margin-left:8px;padding:3px 10px">👁 Ver comprobante</button>` : "");
        recFlash = "";
        if (el("r_vercomp")) el("r_vercomp").onclick = () => verComprobante(recLastRec);
      }
    }
    if (recSubtab === "list") {
      const bq = el("r_buscar"); if (bq) bq.oninput = () => { recListFilter = bq.value; const pane = el("r_pane_list"); /* re-render solo lista */ paintRecepcion(); const nb = el("r_buscar"); if (nb) { nb.focus(); nb.setSelectionRange(nb.value.length, nb.value.length); } };
      const ss = el("r_sort"); if (ss) { ss.value = recListSort; ss.onchange = () => { recListSort = ss.value; paintRecepcion(); }; }
      const gs = el("r_gestion"); if (gs) gs.onchange = () => { recGestion = gs.value; recLoadedGestion = null; paintRecepcion(); };
      if (el("r_reload")) el("r_reload").onclick = () => { recLoadedGestion = null; paintRecepcion(); };
      if (el("r_export")) el("r_export").onclick = recExport;
      el("v-recepcion").querySelectorAll("[data-ver]").forEach(b => b.onclick = () => openRecepDetalle(RECEP.find(x => x.id === b.dataset.ver)));
      el("v-recepcion").querySelectorAll("[data-recibo]").forEach(b => b.onclick = () => enviarReciboDe(RECEP.find(x => x.id === b.dataset.recibo)));
      el("v-recepcion").querySelectorAll("[data-delr]").forEach(b => b.onclick = () => delRecepcion(RECEP.find(x => x.id === b.dataset.delr)));
    }
  });
}
async function registrarRecepcion() {
  const msg = el("r_msg");
  const nombre = el("r_nombre").value.trim();
  const total = parseFloat(el("r_total").value);
  const servicio = el("r_serv").value;
  if (!nombre) { msg.className = "msg err"; msg.textContent = "Elige o escribe el cliente."; return; }
  if (isNaN(total) || total < 0) { msg.className = "msg err"; msg.textContent = "Pon un total válido."; return; }
  const btn = el("r_save"); btn.disabled = true; btn.textContent = "Registrando…";
  try {
    const nroRec = await recNextNum("nextRecep", 7048);
    const nroCom = await recNextNum("nextRecibo", 7784);
    const now = new Date();
    const detalle = el("r_det").value;
    const mesRec = el("r_mesrec").value;
    const tipoPago = el("r_pago").value;
    const rec = {
      nroRecepcion: nroRec, nroComprobante: nroCom,
      fechaISO: now.toISOString(), fecha: el("r_fecha").value.trim(), hora: el("r_hora").value.trim(), dia: recDiaSemana(now),
      clienteId: el("r_idcli").value.trim(), clienteNombre: nombre, nit: el("r_nit").value.trim(), ultimoDigitoNit: el("r_ult").value.trim(),
      clienteCelular: el("r_cel").value.trim(), clienteCorreo: el("r_correo").value.trim(),
      tipoContribuyente: recCli ? bdV(recCli, "tipo") : "", rubro: el("r_rubro").value.trim(),
      actividad: recCli ? bdV(recCli, "actP") : "", aperturaNit: recCli ? bdV(recCli, "fechaNit") : "", matriculaComercio: recCli ? bdV(recCli, "estMat") : "",
      servicio: servicio, servicioNombre: servicio, detalleServicio: detalle,
      mesRecepcion: mesRec, anio: (mesRec.match(/\.\/(\d{2})$/) ? "20" + mesRec.match(/\.\/(\d{2})$/)[1] : ""), mesPago: el("r_mespago").value,
      fechaPago: el("r_fpago").value || "",
      importe: total, tipoPago: tipoPago, atencion: el("r_at").value, comentarios: el("r_com").value.trim(),
      compBanco: el("r_banco").value.trim(), compNroOperacion: el("r_oper").value.trim(), compDepositante: el("r_depo").value.trim(),
      tipo: recTipoDe(servicio, detalle), estado: "pendiente", estadoDeuda: (tipoPago === "DEUDOR" ? "con_deuda" : "sin_deuda"),
      reciboNro: String(nroCom), reciboEnviado: false,
      registradoPorUid: (ME && ME.uid) || "", registradoPorNombre: (ME && (ME.name || ME.email)) || "", createdAt: serverTimestamp()
    };
    const ref = doc(collection(db, "recepciones")); await setDoc(ref, rec); rec.id = ref.id;
    let enviado = false;
    if (rec.clienteCorreo) {
      enviado = await postRecibo(rec);
      if (enviado) { try { await setDoc(doc(db, "recepciones", ref.id), { reciboEnviado: true }, { merge: true }); } catch (e) {} rec.reciboEnviado = true; }
    }
    // Inserción inmediata en la lista (no dependemos de releer todo)
    RECEP.unshift(Object.assign({}, rec));
    recFlash = `✓ Recepción N° ${nroRec} registrada` + (rec.clienteCorreo ? (enviado ? " y Orden enviada al correo." : " (no se pudo enviar el PDF; revisa la URL de recibos en Configuración).") : " (el cliente no tiene correo: no se envió PDF).") + ` — míralo en la pestaña "Lista".`;
    recLastRec = rec;
    recCli = null;
    paintRecepcion();
  } catch (e) { btn.disabled = false; btn.textContent = "Registrar recepción"; msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
}
function openRecepDetalle(r) {
  if (!r) return;
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const row = (l, v) => `<div style="display:flex;gap:10px;padding:3px 0;font-size:13px"><span style="color:var(--muted);flex:0 0 160px">${l}</span><span style="flex:1">${escape(v || "—")}</span></div>`;
  const tieneComp = r.compBanco || r.compNroOperacion || r.compDepositante;
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:24px;width:640px;max-width:96vw;max-height:92vh;overflow:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="margin:0">Recepción N° ${escape(String(r.nroRecepcion || "—"))}</h3><button class="mini" id="rd_x">✕</button></div>
    <div class="fs">Datos de recepción</div>
    ${row("N° Recepción", String(r.nroRecepcion || ""))}${row("N° Comprobante", String(r.nroComprobante || ""))}${row("Día / Fecha / Hora", [r.dia, r.fecha, r.hora].filter(Boolean).join(" · "))}${row("Fecha de pago real", r.fechaPago)}
    <div class="fs" style="margin-top:8px">Cliente</div>
    ${row("Nombre / Razón Social", r.clienteNombre)}${row("NIT", r.nit)}${row("ID Cliente", r.clienteId)}${row("Celular", r.clienteCelular)}${row("Correo", r.clienteCorreo)}${row("Tipo contribuyente", r.tipoContribuyente)}${row("Rubro", r.rubro)}
    <div class="fs" style="margin-top:8px">Servicio</div>
    ${row("Servicio", r.servicio || r.servicioNombre)}${row("Detalle", r.detalleServicio)}${row("Mes a recepcionar", r.mesRecepcion)}${row("Mes de pago", r.mesPago)}${row("Total", money(r.importe))}${row("Forma de pago", r.tipoPago)}${row("Atención", r.atencion)}${row("Comentarios", r.comentarios)}${row("Estado deuda", (r.tipoPago === "DEUDOR" || r.estadoDeuda === "con_deuda") ? "Con deuda" : "Sin deuda")}
    ${tieneComp ? `<div class="fs" style="margin-top:8px">Datos del comprobante</div>${row("Banco", r.compBanco)}${row("N° operación", r.compNroOperacion)}${row("Depositante", r.compDepositante)}` : ''}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn sec" id="rd_close" style="border:1px solid var(--line)">Cerrar</button>
      <button class="btn sec" id="rd_ver" style="border:1px solid var(--line)">👁 Ver comprobante</button>
      ${canEditClientes() ? '<button class="btn" id="rd_recibo">Reenviar recibo</button>' : ''}
    </div></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  bg.querySelector("#rd_x").onclick = close; bg.querySelector("#rd_close").onclick = close;
  bg.querySelector("#rd_ver").onclick = () => verComprobante(r);
  const rb = bg.querySelector("#rd_recibo"); if (rb) rb.onclick = () => { enviarReciboDe(r); close(); };
}
function recExport() {
  const H = ["Fecha", "Hora", "N Recepcion", "N Comprobante", "Cliente", "NIT", "ID", "Rubro", "Servicio", "Detalle", "Mes recepcion", "Año", "Mes pago", "Fecha pago", "Total", "Forma pago", "Atencion", "Comentarios", "Banco", "N operacion", "Depositante", "Estado deuda", "Correo", "Celular", "Registrado por"];
  const rws = RECEP.map(r => [r.fecha || fmtFecha(r.fechaISO), r.hora || "", r.nroRecepcion || "", r.nroComprobante || "", r.clienteNombre || "", r.nit || "", r.clienteId || "", r.rubro || "", r.servicio || r.servicioNombre || "", r.detalleServicio || "", r.mesRecepcion || "", r.anio || "", r.mesPago || "", r.fechaPago || "", (Number(r.importe) || 0), r.tipoPago || "", r.atencion || "", r.comentarios || "", r.compBanco || "", r.compNroOperacion || "", r.compDepositante || "", ((r.tipoPago === "DEUDOR" || r.estadoDeuda === "con_deuda") ? "Con deuda" : "Sin deuda"), r.clienteCorreo || "", r.clienteCelular || "", r.registradoPorNombre || ""]);
  downloadCSV("CONTAX-Recepcion-" + hoyISO() + ".csv", H, rws);
}

async function enviarReciboDe(rec) {
  if (!rec) return;
  if (!rec.clienteCorreo) { alert("Esta recepción no tiene correo del cliente."); return; }
  const ok = await postRecibo(rec);
  if (ok) { try { await setDoc(doc(db, "recepciones", rec.id), { reciboEnviado: true }, { merge: true }); } catch (e) {} await recepLoad(); paintRecepcion(); alert("Orden de Recepción enviada (si la URL de recibos está configurada)."); }
  else alert("No se pudo enviar. Configura la URL de recibos en Configuración.");
}
async function delRecepcion(rec) {
  if (!rec) return;
  if (!confirm(`¿Eliminar la recepción N° ${rec.nroRecepcion} de "${rec.clienteNombre}" por ${money(rec.importe)}? No se puede deshacer.`)) return;
  try { await deleteDoc(doc(db, "recepciones", rec.id)); await recepLoad(); paintRecepcion(); } catch (e) { alert("No se pudo eliminar."); }
}

// ============================================================
//  MÓDULO EGRESOS (gastos de la empresa) — colección "egresos"
// ============================================================
let EGRESOS = [], egLoaded = false;
async function egLoad() {
  try { const snap = await getDocs(collection(db, "egresos")); EGRESOS = snap.docs.map(d => Object.assign({ id: d.id }, d.data())); }
  catch (e) { EGRESOS = []; }
  EGRESOS.sort((a, b) => (b.fechaISO || "").localeCompare(a.fechaISO || ""));
  egLoaded = true;
}
async function renderEgresos() {
  el("v-egresos").innerHTML = `<h1>Egresos</h1><p class="lead"><span class="cx-spin"></span> Cargando…</p>`;
  await egLoad();
  paintEgresos();
}
function paintEgresos() {
  const canEdit = canEditClientes();
  loadConfigDoc().then(cfg => {
    const L = recListas(cfg);
    const nextG = parseInt(cfg.nextGasto, 10) || 1002;
    const now = new Date();
    const total = EGRESOS.reduce((s, r) => s + (Number(r.importe) || 0), 0);
    const rows = EGRESOS.map(r => `<tr>
       <td class="mono">${escape(r.fecha || fmtFecha(r.fechaISO))}</td>
       <td class="mono">${escape(String(r.nroGasto || "—"))}</td>
       <td><b>${escape(r.cuentaContable || "—")}</b></td>
       <td>${escape(r.detalle || "—")}</td>
       <td>${escape(r.tipoPago || "—")}</td>
       <td>${escape(r.atencion || "—")}</td>
       <td class="mono" style="text-align:right">${money(r.importe)}</td>
       <td style="text-align:right">${isAdmin() ? `<button class="mini" data-dele="${r.id}">✕</button>` : ''}</td></tr>`).join("");
    el("v-egresos").innerHTML = `<h1>Egresos</h1>
      <p class="lead">Registro de gastos de la empresa por cuenta contable (alquiler, luz, sueldos, etc.).</p>
      ${canEdit ? `<div class="formcard" style="max-width:820px">
        <h3 style="margin:0 0 10px">Nuevo egreso</h3>
        <div class="grid3">
          <div class="field"><label>N° Gasto</label><input id="e_nro" value="${nextG}"></div>
          <div class="field"><label>Fecha</label><input id="e_fecha" value="${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}"></div>
          <div class="field"><label>Importe (Bs)</label><input id="e_imp" type="number" step="0.01" placeholder="0.00"></div>
        </div>
        <div class="grid2">
          <div class="field"><label>Cuenta contable</label><select id="e_cuenta">${L.cuentas.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Forma de pago</label><select id="e_pago">${L.pagos.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
        </div>
        <div class="grid2">
          <div class="field"><label>Detalle</label><input id="e_det" placeholder="Ej. alquiler oficina octubre"></div>
          <div class="field"><label>Atención / responsable</label><select id="e_at"><option value="">—</option>${L.atencion.map(s => `<option>${escape(s)}</option>`).join("")}</select></div>
        </div>
        <button class="btn" id="e_save">Registrar egreso</button>
        <div class="msg" id="e_msg"></div>
      </div>` : ''}
      <div class="kpis" style="margin-top:10px">
        <div class="kpi"><div class="n">${EGRESOS.length}</div><div class="l">Egresos</div></div>
        <div class="kpi"><div class="n" style="color:var(--danger)">${money(total)}</div><div class="l">Total egresos</div></div>
      </div>
      <div class="toolbar"><button class="btn sec" id="e_export" style="border:1px solid var(--line)">⬇ Exportar</button></div>
      <table><thead><tr><th>Fecha</th><th>N° Gasto</th><th>Cuenta</th><th>Detalle</th><th>Pago</th><th>Resp.</th><th style="text-align:right">Importe</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="8" style="color:var(--muted)">Sin egresos todavía.</td></tr>`}</tbody></table>`;
    if (el("e_save")) el("e_save").onclick = registrarEgreso;
    if (el("e_export")) el("e_export").onclick = () => {
      const H = ["Fecha", "N Gasto", "Cuenta contable", "Detalle", "Forma pago", "Responsable", "Importe"];
      const rws = EGRESOS.map(r => [r.fecha || fmtFecha(r.fechaISO), r.nroGasto || "", r.cuentaContable || "", r.detalle || "", r.tipoPago || "", r.atencion || "", (Number(r.importe) || 0)]);
      downloadCSV("CONTAX-Egresos-" + hoyISO() + ".csv", H, rws);
    };
    el("v-egresos").querySelectorAll("[data-dele]").forEach(b => b.onclick = async () => {
      const r = EGRESOS.find(x => x.id === b.dataset.dele); if (!r) return;
      if (!confirm(`¿Eliminar el egreso N° ${r.nroGasto} (${money(r.importe)})?`)) return;
      try { await deleteDoc(doc(db, "egresos", r.id)); await egLoad(); paintEgresos(); } catch (e) { alert("No se pudo eliminar."); }
    });
  });
}
async function registrarEgreso() {
  const msg = el("e_msg");
  const imp = parseFloat(el("e_imp").value);
  if (isNaN(imp) || imp < 0) { msg.className = "msg err"; msg.textContent = "Pon un importe válido."; return; }
  const btn = el("e_save"); btn.disabled = true; btn.textContent = "Registrando…";
  try {
    const nro = await recNextNum("nextGasto", 1002);
    const now = new Date();
    const eg = {
      nroGasto: nro, fechaISO: now.toISOString(), fecha: el("e_fecha").value.trim(),
      cuentaContable: el("e_cuenta").value, detalle: el("e_det").value.trim(), importe: imp,
      tipoPago: el("e_pago").value, atencion: el("e_at").value,
      registradoPorUid: (ME && ME.uid) || "", registradoPorNombre: (ME && (ME.name || ME.email)) || "", createdAt: serverTimestamp()
    };
    await setDoc(doc(collection(db, "egresos")), eg);
    await egLoad(); paintEgresos();
  } catch (e) { btn.disabled = false; btn.textContent = "Registrar egreso"; msg.className = "msg err"; msg.textContent = "Error: " + (e.code || e.message); }
}

// ---------- DASHBOARD ----------
async function renderDashboard() {
  el("v-dashboard").innerHTML = `<h1>Dashboard</h1><p class="lead"><span class="cx-spin"></span> Cargando…</p>`;
  await recepLoad();
  paintDashboard();
}
function paintDashboard() {
  const total = RECEP.length;
  const ingresos = RECEP.reduce((s, r) => s + (Number(r.importe) || 0), 0);
  const mesAct = new Date().toISOString().slice(0, 7);
  const delMes = RECEP.filter(r => mesKey(r.fechaISO) === mesAct);
  const ingMes = delMes.reduce((s, r) => s + (Number(r.importe) || 0), 0);
  const porCat = {}; RECEP.forEach(r => { const k = r.categoria || r.servicioNombre || "Otros"; porCat[k] = porCat[k] || { n: 0, m: 0 }; porCat[k].n++; porCat[k].m += Number(r.importe) || 0; });
  const porMetodo = {}; RECEP.forEach(r => { const k = r.metodoPago || "—"; porMetodo[k] = (porMetodo[k] || 0) + (Number(r.importe) || 0); });
  const meses = {}; RECEP.forEach(r => { const k = mesKey(r.fechaISO); if (k) meses[k] = (meses[k] || 0) + (Number(r.importe) || 0); });
  const mesesK = Object.keys(meses).sort().slice(-6);
  const maxMes = Math.max(1, ...mesesK.map(k => meses[k]));
  const tipoCount = tp => RECEP.filter(r => r.tipo === tp).length;
  el("v-dashboard").innerHTML = `<h1>Dashboard</h1><p class="lead">Resumen general de la operación, todo en un solo lugar.</p>
    <div class="kpis">
      <div class="kpi"><div class="n">${total}</div><div class="l">Total recepcionados</div></div>
      <div class="kpi"><div class="n">${money(ingresos)}</div><div class="l">Ingresos totales</div></div>
      <div class="kpi"><div class="n">${delMes.length}</div><div class="l">Pagos este mes</div></div>
      <div class="kpi"><div class="n" style="color:var(--green)">${money(ingMes)}</div><div class="l">Ingresos este mes</div></div>
      <div class="kpi"><div class="n">${tipoCount("declaracion")}</div><div class="l">Declaraciones</div></div>
      <div class="kpi"><div class="n">${tipoCount("tramite")}</div><div class="l">Trámites</div></div>
      <div class="kpi"><div class="n">${tipoCount("eeff")}</div><div class="l">EEFF / Balances</div></div>
    </div>
    <div class="grid2" style="gap:16px;align-items:start">
      <div class="formcard" style="max-width:none"><h3 style="margin:0 0 12px">Ingresos por mes</h3>
        ${mesesK.length ? mesesK.map(k => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:9px"><span class="mono" style="width:62px;color:var(--muted)">${k}</span><span style="flex:1;height:10px;background:var(--panel2);border-radius:20px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(meses[k] / maxMes * 100)}%;background:var(--accent);border-radius:20px"></i></span><span class="mono" style="width:120px;text-align:right">${money(meses[k])}</span></div>`).join('') : '<div class="note">Aún no hay datos. Registra pagos en Recepción.</div>'}
      </div>
      <div class="formcard" style="max-width:none"><h3 style="margin:0 0 12px">Por servicio / categoría</h3>
        <table><thead><tr><th>Categoría</th><th style="text-align:right">N°</th><th style="text-align:right">Ingresos</th></tr></thead><tbody>${Object.keys(porCat).sort((a, b) => porCat[b].m - porCat[a].m).map(k => `<tr><td>${escape(k)}</td><td class="mono" style="text-align:right">${porCat[k].n}</td><td class="mono" style="text-align:right">${money(porCat[k].m)}</td></tr>`).join('') || '<tr><td class="note" colspan="3">Sin datos</td></tr>'}</tbody></table>
      </div>
    </div>
    <div class="formcard" style="max-width:none"><h3 style="margin:0 0 12px">Por método de pago</h3>
      <table><thead><tr><th>Método</th><th style="text-align:right">Ingresos</th></tr></thead><tbody>${Object.keys(porMetodo).map(k => `<tr><td>${escape(k)}</td><td class="mono" style="text-align:right">${money(porMetodo[k])}</td></tr>`).join('') || '<tr><td class="note" colspan="2">Sin datos</td></tr>'}</tbody></table>
    </div>`;
}

// ---------- LISTAS (Declaraciones / Trámites / EEFF) ----------
const ESTADOS_LISTA = [["pendiente", "Pendiente"], ["en_proceso", "En proceso"], ["entregado", "Entregado"]];
async function renderLista(tipo, viewId, titulo) {
  el(viewId).innerHTML = `<h1>${escape(titulo)}</h1><p class="lead"><span class="cx-spin"></span> Cargando…</p>`;
  await recepLoad();
  paintLista(tipo, viewId, titulo);
}
function paintLista(tipo, viewId, titulo) {
  const canEdit = canEditClientes();
  const list = RECEP.filter(r => r.tipo === tipo);
  const pend = list.filter(r => (r.estado || "pendiente") !== "entregado").length;
  const rows = list.map(r => {
    const est = r.estado || "pendiente";
    const ctrl = canEdit ? `<select class="mini" data-estado="${r.id}">${ESTADOS_LISTA.map(([v, l]) => `<option value="${v}" ${v === est ? 'selected' : ''}>${l}</option>`).join('')}</select>` : `<span class="badge ${est === 'entregado' ? 'ok' : 'off'}">${est}</span>`;
    return `<tr>
      <td class="mono">${escape(fmtFecha(r.fechaISO))}</td>
      <td><b>${escape(r.clienteNombre || "—")}</b>${r.clienteCelular ? `<div style="color:var(--muted);font-size:12px">${escape(r.clienteCelular)}</div>` : ''}</td>
      <td>${escape(r.servicioNombre || "—")}</td>
      <td class="mono" style="text-align:right">${money(r.importe)}</td>
      <td>${ctrl}</td></tr>`;
  }).join("");
  el(viewId).innerHTML = `<h1>${escape(titulo)}</h1>
    <p class="lead">Trabajo generado desde la Recepción. ${canEdit ? 'Cambia el estado conforme avances con el equipo.' : ''}</p>
    <div class="kpis"><div class="kpi"><div class="n">${list.length}</div><div class="l">Total</div></div><div class="kpi"><div class="n" style="color:var(--warn)">${pend}</div><div class="l">Por entregar</div></div></div>
    <table><thead><tr><th>Fecha</th><th>Cliente</th><th>Servicio</th><th style="text-align:right">Importe</th><th>Estado</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5" style="color:var(--muted)">Nada por aquí todavía. Se llena cuando registres pagos de este tipo en Recepción (el tipo se define en Tarifas).</td></tr>`}</tbody></table>`;
  el(viewId).querySelectorAll("[data-estado]").forEach(sel => sel.onchange = async () => {
    try { await setDoc(doc(db, "recepciones", sel.dataset.estado), { estado: sel.value }, { merge: true }); const r = RECEP.find(x => x.id === sel.dataset.estado); if (r) r.estado = sel.value; paintLista(tipo, viewId, titulo); }
    catch (e) { alert("No se pudo guardar el estado."); }
  });
}


// ============================================================
//  MÓDULO CALENDARIO (Operaciones) — agenda del equipo
//  Colección Firestore: "eventos"
// ============================================================
let EVENTOS = [], evLoaded = false, calYear = 0, calMonth = 0;
const EV_TIPOS = [
  ["tarea",       "Tarea",            "#235347"],
  ["vencimiento", "Vencimiento",      "#B4453C"],
  ["turno",       "Turno de atención","#2E7D5B"],
  ["clase",       "Clase / curso",    "#7A5AA6"],
  ["reunion",     "Reunión",          "#C77C2E"],
  ["otro",        "Otro",             "#5E7A70"]
];
function evColor(t) { const f = EV_TIPOS.find(x => x[0] === t); return f ? f[2] : "#5E7A70"; }
function evTipoLbl(t) { const f = EV_TIPOS.find(x => x[0] === t); return f ? f[1] : "Otro"; }
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

async function evLoad() {
  try {
    const snap = await getDocs(collection(db, "eventos"));
    EVENTOS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    EVENTOS.sort((a, b) => (a.fechaISO + (a.hora || "")).localeCompare(b.fechaISO + (b.hora || "")));
    evLoaded = true;
  } catch (e) { EVENTOS = []; }
}
function todayISO() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function isoOf(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }

async function renderCalendario() {
  el("v-calendario").innerHTML = `<h1>Calendario</h1><p class="lead"><span class="cx-spin"></span> Cargando agenda…</p>`;
  await evLoad();
  if (!calYear) { const d = new Date(); calYear = d.getFullYear(); calMonth = d.getMonth(); }
  paintCalendario();
}

function paintCalendario() {
  const canEdit = canEditClientes() || true; // todo el equipo activo puede agendar
  const first = new Date(calYear, calMonth, 1);
  let startDow = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = todayISO();

  const leyenda = EV_TIPOS.map(([k, l, c]) => `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:12px;color:var(--muted)"><span style="width:10px;height:10px;border-radius:3px;background:${c};display:inline-block"></span>${l}</span>`).join("");

  let cells = "";
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell cal-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoOf(calYear, calMonth, d);
    const evs = EVENTOS.filter(e => e.fechaISO === iso);
    const isToday = iso === today;
    const chips = evs.slice(0, 3).map(e => `<div class="cal-chip" title="${escape((e.hora ? e.hora + ' · ' : '') + (e.titulo || ''))}" style="border-left:3px solid ${evColor(e.tipo)};${e.done ? 'opacity:.5;text-decoration:line-through' : ''}">${e.hora ? `<b>${escape(e.hora)}</b> ` : ''}${escape(e.titulo || '')}</div>`).join("");
    const more = evs.length > 3 ? `<div class="cal-more">+${evs.length - 3} más</div>` : "";
    cells += `<div class="cal-cell${isToday ? ' cal-today' : ''}" data-day="${iso}">
      <div class="cal-dnum">${d}</div>${chips}${more}</div>`;
  }

  // Próximos eventos (desde hoy, 40 días)
  const limit = new Date(); limit.setDate(limit.getDate() + 40); const limitISO = limit.getFullYear() + "-" + String(limit.getMonth() + 1).padStart(2, "0") + "-" + String(limit.getDate()).padStart(2, "0");
  const prox = EVENTOS.filter(e => e.fechaISO >= today && e.fechaISO <= limitISO).slice(0, 25);
  const proxRows = prox.map(e => `<div class="ev-row" style="border-left:3px solid ${evColor(e.tipo)}">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:var(--muted)">${escape(fmtFecha(e.fechaISO))}${e.hora ? ' · ' + escape(e.hora) : ''} · ${escape(evTipoLbl(e.tipo))}</div>
        <div style="font-weight:600;${e.done ? 'opacity:.5;text-decoration:line-through' : ''}">${escape(e.titulo || '')}</div>
        ${e.cliente ? `<div style="font-size:12px;color:var(--muted)">${escape(e.cliente)}</div>` : ''}
        ${e.nota ? `<div style="font-size:12px;color:var(--muted)">${escape(e.nota)}</div>` : ''}
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="mini ev-done" data-id="${e.id}" title="Marcar hecho/pendiente">${e.done ? '↺' : '✓'}</button>
        <button class="mini ev-edit" data-id="${e.id}">Editar</button>
        <button class="mini ev-del" data-id="${e.id}" title="Eliminar">✕</button>
      </div>
    </div>`).join("");

  el("v-calendario").innerHTML = `
    <style>
      .cal-head{display:flex;align-items:center;gap:10px;margin:6px 0 10px}
      .cal-head h2{margin:0;font-size:19px;min-width:190px}
      .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
      .cal-dow{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:center;padding:4px 0;font-weight:600}
      .cal-cell{min-height:92px;background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:5px 5px 4px;cursor:pointer;transition:.12s;overflow:hidden}
      .cal-cell:hover{border-color:var(--sage);box-shadow:0 2px 8px rgba(0,0,0,.06)}
      .cal-empty{background:transparent;border:none;cursor:default}
      .cal-today{outline:2px solid var(--green);outline-offset:-1px}
      .cal-dnum{font-size:12px;font-weight:700;color:var(--muted);margin-bottom:3px}
      .cal-today .cal-dnum{color:var(--green)}
      .cal-chip{font-size:11px;background:var(--panel2);border-radius:5px;padding:2px 5px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
      .cal-more{font-size:10.5px;color:var(--muted);padding-left:3px}
      .ev-row{display:flex;gap:10px;align-items:flex-start;background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:9px 11px;margin-bottom:7px}
      @media(max-width:900px){.cal-cell{min-height:70px}}
    </style>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px">
      <div><h1 style="margin:0 0 2px">Calendario</h1><p class="lead" style="margin:0">Agenda compartida del equipo: tareas, vencimientos, turnos de atención, clases y reuniones.</p></div>
      <button class="btn" id="ev_new">+ Nuevo evento</button>
    </div>
    <div style="margin:14px 0">${leyenda}</div>
    <div class="cal-head">
      <button class="btn sec" id="cal_prev">‹</button>
      <h2>${MESES[calMonth]} ${calYear}</h2>
      <button class="btn sec" id="cal_next">›</button>
      <button class="btn sec" id="cal_today">Hoy</button>
    </div>
    <div class="cal-grid">${DIAS.map(d => `<div class="cal-dow">${d}</div>`).join("")}</div>
    <div class="cal-grid" style="margin-top:6px">${cells}</div>
    <h2 style="margin:26px 0 10px;font-size:17px">Próximos eventos</h2>
    ${proxRows || `<p class="note">No hay eventos próximos. Usa "+ Nuevo evento" o toca un día del calendario para agregar uno.</p>`}
  `;

  el("cal_prev").onclick = () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } paintCalendario(); };
  el("cal_next").onclick = () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } paintCalendario(); };
  el("cal_today").onclick = () => { const d = new Date(); calYear = d.getFullYear(); calMonth = d.getMonth(); paintCalendario(); };
  el("ev_new").onclick = () => openEventoModal(null, today);
  el("v-calendario").querySelectorAll(".cal-cell[data-day]").forEach(c => c.onclick = () => openEventoModal(null, c.dataset.day));
  el("v-calendario").querySelectorAll(".ev-edit").forEach(b => b.onclick = () => { const e = EVENTOS.find(x => x.id === b.dataset.id); if (e) openEventoModal(e); });
  el("v-calendario").querySelectorAll(".ev-del").forEach(b => b.onclick = () => delEvento(b.dataset.id));
  el("v-calendario").querySelectorAll(".ev-done").forEach(b => b.onclick = async () => {
    const e = EVENTOS.find(x => x.id === b.dataset.id); if (!e) return;
    try { await setDoc(doc(db, "eventos", e.id), { done: !e.done }, { merge: true }); e.done = !e.done; paintCalendario(); } catch (err) { alert("No se pudo actualizar."); }
  });
}

function openEventoModal(e, fechaDefault) {
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const clientesList = (typeof CLIENTES !== "undefined" && CLIENTES.length) ? CLIENTES.map(c => `<option value="${escape(c.nombre || "")}">`).join("") : "";
  bg.innerHTML = `<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:24px;width:500px;max-width:96vw;max-height:92vh;overflow:auto">
    <h3 style="margin:0 0 14px">${e ? 'Editar' : 'Nuevo'} evento</h3>
    <div class="field"><label>Título</label><input id="ev_titulo" value="${e ? escape(e.titulo || '') : ''}" placeholder="Ej. Vencimiento IVA / Turno mañana / Clase de facturación"></div>
    <div class="grid2">
      <div class="field"><label>Fecha</label><input id="ev_fecha" type="date" value="${e ? escape(e.fechaISO || '') : (fechaDefault || todayISO())}"></div>
      <div class="field"><label>Hora (opcional)</label><input id="ev_hora" type="time" value="${e ? escape(e.hora || '') : ''}"></div>
    </div>
    <div class="field"><label>Tipo</label><select id="ev_tipo">${EV_TIPOS.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></div>
    <div class="field"><label>Cliente (opcional)</label><input id="ev_cliente" list="ev_clist" value="${e ? escape(e.cliente || '') : ''}" placeholder="Relacionado a un cliente"><datalist id="ev_clist">${clientesList}</datalist></div>
    <div class="field"><label>Nota (opcional)</label><textarea id="ev_nota" style="min-height:70px">${e ? escape(e.nota || '') : ''}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
      <button class="btn sec" id="ev_cancel">Cancelar</button>
      <button class="btn" id="ev_save">Guardar</button>
    </div><div class="msg" id="ev_mmsg"></div></div>`;
  document.body.appendChild(bg);
  bg.querySelector("#ev_tipo").value = e ? (e.tipo || "tarea") : "tarea";
  const close = () => bg.remove();
  bg.onclick = ev => { if (ev.target === bg) close(); };
  bg.querySelector("#ev_cancel").onclick = close;
  bg.querySelector("#ev_save").onclick = async () => {
    const titulo = bg.querySelector("#ev_titulo").value.trim();
    const fecha = bg.querySelector("#ev_fecha").value;
    const m = bg.querySelector("#ev_mmsg");
    if (!titulo) { m.className = "msg err"; m.textContent = "Ponle un título al evento."; return; }
    if (!fecha) { m.className = "msg err"; m.textContent = "Elige una fecha."; return; }
    const item = {
      titulo, fechaISO: fecha, hora: bg.querySelector("#ev_hora").value || "",
      tipo: bg.querySelector("#ev_tipo").value, cliente: bg.querySelector("#ev_cliente").value.trim(),
      nota: bg.querySelector("#ev_nota").value.trim(), updatedAt: serverTimestamp()
    };
    const btn = bg.querySelector("#ev_save"); btn.disabled = true; btn.textContent = "Guardando…";
    try {
      if (e && e.id) await setDoc(doc(db, "eventos", e.id), item, { merge: true });
      else await setDoc(doc(collection(db, "eventos")), { ...item, done: false, createdByUid: ME.uid, createdByNombre: ME.name || ME.email, createdAt: serverTimestamp() });
      await evLoad(); close(); paintCalendario();
    } catch (err) { btn.disabled = false; btn.textContent = "Guardar"; m.className = "msg err"; m.textContent = "Error: " + (err.code || err.message); }
  };
}
function delEvento(id) {
  const e = EVENTOS.find(x => x.id === id); if (!e) return;
  if (!confirm(`¿Eliminar el evento "${e.titulo}"?`)) return;
  deleteDoc(doc(db, "eventos", id)).then(async () => { await evLoad(); paintCalendario(); }).catch(() => alert("No se pudo eliminar."));
}


// ============================================================
//  MÓDULO ARQUEO (Operaciones) — conciliación de extracto bancario
//  Compara los movimientos del banco con los pagos registrados
//  en Recepción (colección "recepciones") por nombre, fecha e importe.
// ============================================================
let ARQ_ROWS = [], ARQ_HEADERS = [], ARQ_MAP = { fecha: -1, desc: -1, importe: -1 }, ARQ_RESULT = [];

function arqNorm(s) {
  return String(s == null ? "" : s).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
// Parsea importes en varios formatos: "1.234,56" / "1,234.56" / "1234.56" / "Bs 150,00"
function arqNum(v) {
  if (v == null) return NaN;
  let s = String(v).replace(/[^0-9.,-]/g, "").trim();
  if (!s) return NaN;
  const lastC = s.lastIndexOf(","), lastD = s.lastIndexOf(".");
  if (lastC > -1 && lastD > -1) {
    if (lastC > lastD) { s = s.replace(/\./g, "").replace(",", "."); }  // 1.234,56
    else { s = s.replace(/,/g, ""); }                                    // 1,234.56
  } else if (lastC > -1) {
    // solo comas: si hay 2 decimales tras la última coma => decimal
    s = (s.length - lastC - 1 === 2) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastD > -1) {
    // solo puntos (formato boliviano): 3 dígitos tras el último punto => separador de miles
    if (s.length - lastD - 1 === 3) s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}
// Normaliza fechas a YYYY-MM-DD desde dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, etc.
function arqDate(v) {
  if (v == null) return "";
  let s = String(v).trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m) { let y = m[3]; if (y.length === 2) y = "20" + y; return y + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0"); }
  return "";
}
function arqDaysDiff(a, b) {
  if (!a || !b) return 999;
  const da = new Date(a + "T00:00:00"), db = new Date(b + "T00:00:00");
  return Math.abs(Math.round((da - db) / 86400000));
}
// Parser CSV simple (comas o ; con comillas)
function arqParseCSV(text) {
  const delim = (text.split("\n")[0].split(";").length > text.split("\n")[0].split(",").length) ? ";" : ",";
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === delim) { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ""));
}
// Carga SheetJS para leer .xlsx (bajo demanda)
let _xlsxLib = null;
async function arqLoadXLSX() {
  if (_xlsxLib) return _xlsxLib;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  _xlsxLib = window.XLSX;
  return _xlsxLib;
}

async function renderArqueo() {
  el("v-arqueo").innerHTML = `
    <h1>Arqueo / Conciliación bancaria</h1>
    <p class="lead">Carga el extracto del banco y el sistema lo cruza con los pagos registrados en <b>Recepción</b> por nombre de cliente, fecha e importe.</p>
    <div class="formcard" style="margin-top:14px">
      <h3 style="margin:0 0 6px">1) Cargar extracto bancario</h3>
      <p class="note" style="margin:0 0 12px">Acepta archivos <b>.csv</b> o <b>.xlsx</b> exportados desde tu banca por internet.
      La primera fila debe tener los títulos de columna (Fecha, Descripción/Glosa, Importe/Crédito).</p>
      <input type="file" id="arq_file" accept=".csv,.xlsx,.xls" style="margin-bottom:8px">
      <div class="msg" id="arq_msg"></div>
    </div>
    <div id="arq_cfg"></div>
    <div id="arq_out"></div>`;
  el("arq_file").onchange = arqOnFile;
  // si ya había un resultado en memoria, re-pintar
  if (ARQ_ROWS.length) { arqRenderMap(); if (ARQ_RESULT.length) arqRenderResult(); }
}

async function arqOnFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const msg = el("arq_msg"); msg.className = "msg"; msg.textContent = "Leyendo archivo…";
  try {
    let rows;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await arqLoadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
    } else {
      const text = await file.text();
      rows = arqParseCSV(text);
    }
    rows = rows.filter(r => r && r.some(c => String(c).trim() !== ""));
    if (rows.length < 2) { msg.className = "msg err"; msg.textContent = "El archivo no tiene filas suficientes."; return; }
    ARQ_HEADERS = rows[0].map(h => String(h).trim());
    ARQ_ROWS = rows.slice(1);
    ARQ_RESULT = [];
    // intento de auto-detección de columnas
    ARQ_MAP = { fecha: -1, desc: -1, importe: -1 };
    ARQ_HEADERS.forEach((h, i) => {
      const n = arqNorm(h);
      if (ARQ_MAP.fecha < 0 && /fecha|date|dia/.test(n)) ARQ_MAP.fecha = i;
      if (ARQ_MAP.desc < 0 && /descrip|glosa|detalle|concepto|referencia|beneficiario|ordenante|nombre/.test(n)) ARQ_MAP.desc = i;
      if (ARQ_MAP.importe < 0 && /importe|credito|abono|monto|haber|deposito|valor|ingreso/.test(n)) ARQ_MAP.importe = i;
    });
    msg.className = "msg ok"; msg.textContent = `✓ ${ARQ_ROWS.length} movimientos leídos. Revisa las columnas abajo.`;
    arqRenderMap();
  } catch (err) {
    msg.className = "msg err"; msg.textContent = "No se pudo leer el archivo: " + (err.message || err);
  }
}

function arqRenderMap() {
  const opts = (sel) => ARQ_HEADERS.map((h, i) => `<option value="${i}" ${i === sel ? "selected" : ""}>${escape(h || ("Columna " + (i + 1)))}</option>`).join("");
  const sample = ARQ_ROWS.slice(0, 4).map(r => `<tr>${ARQ_HEADERS.map((h, i) => `<td>${escape(String(r[i] == null ? "" : r[i]))}</td>`).join("")}</tr>`).join("");
  el("arq_cfg").innerHTML = `
    <div class="formcard">
      <h3 style="margin:0 0 6px">2) Indica qué columna es cada dato</h3>
      <div class="grid2" style="gap:14px">
        <div class="field"><label>Fecha</label><select id="arq_c_fecha"><option value="-1">—</option>${opts(ARQ_MAP.fecha)}</select></div>
        <div class="field"><label>Descripción / Glosa (nombre del cliente)</label><select id="arq_c_desc"><option value="-1">—</option>${opts(ARQ_MAP.desc)}</select></div>
      </div>
      <div class="grid2" style="gap:14px">
        <div class="field"><label>Importe (crédito / abono)</label><select id="arq_c_importe"><option value="-1">—</option>${opts(ARQ_MAP.importe)}</select></div>
        <div class="field"><label>Tolerancia de fecha</label><select id="arq_c_tol"><option value="0">Mismo día</option><option value="2">± 2 días</option><option value="3" selected>± 3 días</option><option value="7">± 7 días</option></select></div>
      </div>
      <div style="overflow:auto;margin:8px 0 12px"><table style="font-size:12px"><thead><tr>${ARQ_HEADERS.map(h => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${sample}</tbody></table></div>
      <button class="btn" id="arq_run">Conciliar con Recepción</button>
      <div class="msg" id="arq_runmsg"></div>
    </div>`;
  el("arq_c_fecha").value = ARQ_MAP.fecha; el("arq_c_desc").value = ARQ_MAP.desc; el("arq_c_importe").value = ARQ_MAP.importe;
  el("arq_run").onclick = arqRun;
}

async function arqRun() {
  ARQ_MAP.fecha = Number(el("arq_c_fecha").value);
  ARQ_MAP.desc = Number(el("arq_c_desc").value);
  ARQ_MAP.importe = Number(el("arq_c_importe").value);
  const tol = Number(el("arq_c_tol").value);
  const msg = el("arq_runmsg");
  if (ARQ_MAP.importe < 0) { msg.className = "msg err"; msg.textContent = "Elige al menos la columna de Importe."; return; }
  msg.className = "msg"; msg.textContent = "Cargando pagos de Recepción…";
  await recepLoad();
  // candidatos: pagos aún no conciliados
  const pagos = RECEP.map(r => ({ ...r, _imp: Number(r.importe) || 0, _nom: arqNorm(r.clienteNombre) }));

  ARQ_RESULT = ARQ_ROWS.map((row, idx) => {
    const imp = arqNum(row[ARQ_MAP.importe]);
    const fec = ARQ_MAP.fecha >= 0 ? arqDate(row[ARQ_MAP.fecha]) : "";
    const desc = ARQ_MAP.desc >= 0 ? String(row[ARQ_MAP.desc] || "") : "";
    const descN = arqNorm(desc);
    let matches = [];
    if (!isNaN(imp) && imp > 0) {
      pagos.forEach(p => {
        if (p.conciliado) return;
        const impOk = Math.abs(p._imp - imp) < 0.5;
        if (!impOk) return;
        const dd = fec ? arqDaysDiff(fec, p.fechaISO) : 0;
        const fecOk = !fec || dd <= tol;
        // nombre: alguna palabra del nombre (>=4 letras) aparece en la glosa
        let nomScore = 0;
        if (p._nom) {
          const words = p._nom.split(" ").filter(w => w.length >= 4);
          nomScore = words.filter(w => descN.includes(w)).length;
        }
        if (impOk && fecOk) {
          let score = 2 + (fec ? (tol - dd) : 0) + nomScore * 3;
          matches.push({ p, score, nomScore, dd });
        }
      });
      matches.sort((a, b) => b.score - a.score);
    }
    let estado = "sin", best = null;
    if (matches.length === 1) { estado = "ok"; best = matches[0]; }
    else if (matches.length > 1) {
      // si el mejor tiene coincidencia de nombre y es único en ese puntaje, lo tomamos
      if (matches[0].nomScore > 0 && matches[0].score > matches[1].score) { estado = "ok"; best = matches[0]; }
      else estado = "multi";
    }
    return { idx, imp, fec, desc, matches, estado, best, chosen: best ? best.p.id : "" };
  });

  const ok = ARQ_RESULT.filter(r => r.estado === "ok").length;
  const multi = ARQ_RESULT.filter(r => r.estado === "multi").length;
  const sin = ARQ_RESULT.filter(r => r.estado === "sin").length;
  msg.className = "msg ok"; msg.textContent = `✓ Conciliado: ${ok} · Varias opciones: ${multi} · Sin coincidencia: ${sin}`;
  arqRenderResult();
}

function arqRenderResult() {
  const canEdit = canEditClientes();
  const badge = { ok: '<span class="badge ok">Conciliado</span>', multi: '<span class="badge" style="background:#C77C2E;color:#fff">Varias opciones</span>', sin: '<span class="badge off">Sin coincidencia</span>' };
  const rows = ARQ_RESULT.map(r => {
    const pagosSel = RECEP.filter(p => Math.abs((Number(p.importe) || 0) - r.imp) < 50 || r.matches.some(m => m.p.id === p.id));
    const sel = canEdit ? `<select class="mini" data-arqsel="${r.idx}">
        <option value="">— sin asignar —</option>
        ${pagosSel.map(p => `<option value="${p.id}" ${r.chosen === p.id ? "selected" : ""}>${escape(p.clienteNombre || "?")} · ${money(p.importe)} · ${escape(fmtFecha(p.fechaISO))}</option>`).join("")}
      </select>` : (r.best ? escape(r.best.p.clienteNombre || "") : "—");
    return `<tr>
      <td class="mono">${escape(r.fec || "—")}</td>
      <td style="max-width:260px">${escape(r.desc || "—")}</td>
      <td class="mono" style="text-align:right">${isNaN(r.imp) ? "—" : money(r.imp)}</td>
      <td>${badge[r.estado]}</td>
      <td>${sel}</td>
      <td>${canEdit ? `<button class="mini" data-arqok="${r.idx}" ${r.chosen ? "" : "disabled"}>Marcar conciliado</button>` : ""}</td>
    </tr>`;
  }).join("");
  el("arq_out").innerHTML = `
    <div class="formcard">
      <h3 style="margin:0 0 6px">3) Resultado de la conciliación</h3>
      <p class="note" style="margin:0 0 10px">Revisa cada movimiento. Donde haya varias opciones, elige el pago correcto y pulsa <b>Marcar conciliado</b>. Esto marca el pago en Recepción como conciliado con el banco.</p>
      <div style="overflow:auto"><table>
        <thead><tr><th>Fecha banco</th><th>Descripción / Glosa</th><th style="text-align:right">Importe</th><th>Estado</th><th>Pago de Recepción</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="color:var(--muted)">Sin movimientos.</td></tr>`}</tbody>
      </table></div>
    </div>`;
  el("arq_out").querySelectorAll("[data-arqsel]").forEach(s => s.onchange = () => {
    const r = ARQ_RESULT[Number(s.dataset.arqsel)]; if (r) { r.chosen = s.value; const b = el("arq_out").querySelector(`[data-arqok="${r.idx}"]`); if (b) b.disabled = !s.value; }
  });
  el("arq_out").querySelectorAll("[data-arqok]").forEach(b => b.onclick = async () => {
    const r = ARQ_RESULT[Number(b.dataset.arqok)]; if (!r || !r.chosen) return;
    b.disabled = true; b.textContent = "Guardando…";
    try {
      await setDoc(doc(db, "recepciones", r.chosen), { conciliado: true, conciliadoFechaBanco: r.fec || "", conciliadoGlosa: r.desc || "", conciliadoPorUid: ME.uid, conciliadoAt: serverTimestamp() }, { merge: true });
      const p = RECEP.find(x => x.id === r.chosen); if (p) p.conciliado = true;
      r.estado = "ok"; b.textContent = "✓ Conciliado"; b.classList.add("ok");
    } catch (e) { b.disabled = false; b.textContent = "Marcar conciliado"; alert("No se pudo guardar: " + (e.code || e.message)); }
  });
}


// ============================================================
//  MÓDULO IMPORTAR (Administración) — historial a Firestore
//  Lee un CSV/XLSX exportado de Google Sheets y lo guarda en
//  la colección "recepciones" (historial, declaraciones, EEFF…).
// ============================================================
let IMP_ROWS = [], IMP_HEADERS = [], IMP_MAP = {}, IMP_LASTLOTE = "";
const IMP_DESTINOS = [
  ["", "Recepción (historial de pagos)"],
  ["declaracion", "Declaraciones"],
  ["tramite", "Trámites"],
  ["eeff", "Estados Financieros (EEFF)"]
];
const IMP_CAMPOS = [
  ["fecha", "Fecha"],
  ["hora", "Hora"],
  ["nrorec", "N° Recepción"],
  ["nrocom", "N° Comprobante / Recibo"],
  ["cliente", "Cliente / Razón Social"],
  ["nit", "NIT"],
  ["idcli", "ID Cliente"],
  ["rubro", "Presta servicios a / Rubro"],
  ["celular", "Celular"],
  ["correo", "Correo"],
  ["servicio", "Servicio (SERVICIOS CONTAX)"],
  ["detalle", "Detalle / Tipo de servicio"],
  ["mesrec", "Mes a recepcionar"],
  ["anio", "Año"],
  ["mespago", "Mes de pago"],
  ["importe", "Total / Importe (Bs)"],
  ["metodo", "Forma de pago"],
  ["atencion", "Atención"],
  ["comentarios", "Comentarios"],
  ["estado", "Estado (opcional)"]
];
function impEstadoNorm(v) {
  const u = String(v == null ? "" : v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/entreg|termin|complet|listo|hecho|pagad|cobrad/.test(u)) return "entregado";
  if (/proces|curso|tramit|avanz/.test(u)) return "en_proceso";
  if (/pend|debe|falta/.test(u)) return "pendiente";
  return "";
}

async function renderImportar() {
  if (!isAdmin()) { el("v-importar").innerHTML = `<h1>Importar</h1><p class="lead">Esta sección es solo para administradores.</p>`; return; }
  el("v-importar").innerHTML = `
    <h1>Importar historial</h1>
    <p class="lead">Trae tu historial desde Google Sheets (o Excel) hacia la base del sistema (Firebase), para no empezar de cero. Lo importado aparece en Recepción, Dashboard y las listas correspondientes.</p>
    <div class="formcard">
      <h3 style="margin:0 0 6px">1) ¿Qué vas a importar?</h3>
      <div class="grid2">
        <div class="field"><label>Destino</label><select id="imp_destino">${IMP_DESTINOS.map(d => `<option value="${d[0]}">${d[1]}</option>`).join("")}</select></div>
        <div class="field"><label>Estado por defecto (si una fila no trae estado)</label><select id="imp_estado"><option value="entregado">Entregado (historial ya hecho)</option><option value="pendiente">Pendiente</option><option value="en_proceso">En proceso</option></select></div>
      </div>
      <p class="note" style="margin:0">Consejo: exporta tu hoja desde Google Sheets con <b>Archivo → Descargar → CSV</b> (o Excel .xlsx). La primera fila debe tener los títulos de columna.</p>
    </div>
    <div class="formcard">
      <h3 style="margin:0 0 6px">2) Sube el archivo (.csv o .xlsx)</h3>
      <input type="file" id="imp_file" accept=".csv,.xlsx,.xls">
      <div class="msg" id="imp_msg"></div>
    </div>
    <div id="imp_cfg"></div>
    <div id="imp_result"></div>`;
  el("imp_file").onchange = impOnFile;
}

async function impOnFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const msg = el("imp_msg"); msg.className = "msg"; msg.textContent = "Leyendo archivo…";
  try {
    let rows;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await arqLoadXLSX();
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: "" });
    } else {
      rows = arqParseCSV(await file.text());
    }
    rows = rows.filter(r => r && r.some(c => String(c).trim() !== ""));
    if (rows.length < 2) { msg.className = "msg err"; msg.textContent = "El archivo no tiene filas suficientes."; return; }
    IMP_HEADERS = rows[0].map(h => String(h).trim());
    IMP_ROWS = rows.slice(1);
    IMP_MAP = {};
    IMP_HEADERS.forEach((h, i) => {
      const n = h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (IMP_MAP.nrorec == null && /n.?\s*recep|nro.?\s*recep|numero\s*recep/.test(n)) IMP_MAP.nrorec = i;
      else if (IMP_MAP.nrocom == null && /comprob|recibo/.test(n)) IMP_MAP.nrocom = i;
      else if (IMP_MAP.fecha == null && /fecha|^dia$|date/.test(n)) IMP_MAP.fecha = i;
      else if (IMP_MAP.hora == null && /hora/.test(n)) IMP_MAP.hora = i;
      else if (IMP_MAP.nit == null && /\bnit\b/.test(n)) IMP_MAP.nit = i;
      else if (IMP_MAP.idcli == null && /\bid\b|id\s*cliente|codigo/.test(n)) IMP_MAP.idcli = i;
      else if (IMP_MAP.cliente == null && /cliente|nombre|razon/.test(n)) IMP_MAP.cliente = i;
      else if (IMP_MAP.rubro == null && /rubro|presta\s*servicio/.test(n)) IMP_MAP.rubro = i;
      else if (IMP_MAP.celular == null && /celular|telefono|cel|whatsapp|movil/.test(n)) IMP_MAP.celular = i;
      else if (IMP_MAP.correo == null && /correo|email|mail/.test(n)) IMP_MAP.correo = i;
      else if (IMP_MAP.detalle == null && /detalle|tipo\s*de\s*serv/.test(n)) IMP_MAP.detalle = i;
      else if (IMP_MAP.servicio == null && /servicio|concepto|descrip/.test(n)) IMP_MAP.servicio = i;
      else if (IMP_MAP.mespago == null && /mes\s*de\s*pago|mes\s*pago/.test(n)) IMP_MAP.mespago = i;
      else if (IMP_MAP.mesrec == null && /\bmes\b|mes\s*recep|mes\s*declar/.test(n)) IMP_MAP.mesrec = i;
      else if (IMP_MAP.anio == null && /a.?o|year|gestion/.test(n)) IMP_MAP.anio = i;
      else if (IMP_MAP.importe == null && /importe|monto|total|precio|cobro/.test(n)) IMP_MAP.importe = i;
      else if (IMP_MAP.metodo == null && /metodo|forma|tipo\s*de\s*pago|transfer/.test(n)) IMP_MAP.metodo = i;
      else if (IMP_MAP.atencion == null && /atenci|atendi|responsable/.test(n)) IMP_MAP.atencion = i;
      else if (IMP_MAP.comentarios == null && /coment|observ|nota|referencia/.test(n)) IMP_MAP.comentarios = i;
      else if (IMP_MAP.estado == null && /estado|situacion|entreg/.test(n)) IMP_MAP.estado = i;
    });
    msg.className = "msg ok"; msg.textContent = `✓ ${IMP_ROWS.length} filas leídas. Revisa el emparejamiento de columnas abajo.`;
    impRenderCfg();
  } catch (err) { msg.className = "msg err"; msg.textContent = "No se pudo leer: " + (err.message || err); }
}

function impRenderCfg() {
  const opt = sel => `<option value="-1">— ninguna —</option>` + IMP_HEADERS.map((h, i) => `<option value="${i}" ${i === sel ? "selected" : ""}>${escape(h || ("Columna " + (i + 1)))}</option>`).join("");
  const sample = IMP_ROWS.slice(0, 5).map(r => `<tr>${IMP_HEADERS.map((h, i) => `<td>${escape(String(r[i] == null ? "" : r[i]))}</td>`).join("")}</tr>`).join("");
  el("imp_cfg").innerHTML = `
    <div class="formcard">
      <h3 style="margin:0 0 6px">3) Empareja las columnas</h3>
      <p class="note" style="margin:0 0 10px">Dile al sistema qué columna de tu archivo corresponde a cada dato. Lo que no tengas, déjalo en "ninguna".</p>
      <div class="grid3">
        ${IMP_CAMPOS.map(c => `<div class="field"><label>${c[1]}</label><select data-imp="${c[0]}">${opt(IMP_MAP[c[0]] == null ? -1 : IMP_MAP[c[0]])}</select></div>`).join("")}
      </div>
      <div style="overflow:auto;margin:6px 0 12px"><table style="font-size:11.5px"><thead><tr>${IMP_HEADERS.map(h => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${sample}</tbody></table></div>
      <p class="note" style="margin:0 0 10px">Vista previa de las primeras filas. La importación <b>no</b> envía recibos por correo; solo guarda el historial.</p>
      <button class="btn" id="imp_run">Importar ${IMP_ROWS.length} filas</button>
      <div class="msg" id="imp_runmsg"></div>
    </div>`;
  el("imp_cfg").querySelectorAll("[data-imp]").forEach(s => s.onchange = () => { IMP_MAP[s.dataset.imp] = Number(s.value); });
  el("imp_run").onclick = impRun;
}

async function impRun() {
  const msg = el("imp_runmsg");
  if (IMP_MAP.cliente == null || IMP_MAP.cliente < 0) { msg.className = "msg err"; msg.textContent = "Al menos empareja la columna de Cliente."; return; }
  const tipo = el("imp_destino").value;
  const estadoDef = el("imp_estado").value;
  const lote = "imp-" + Date.now();
  const get = (r, k) => (IMP_MAP[k] != null && IMP_MAP[k] >= 0) ? String(r[IMP_MAP[k]] == null ? "" : r[IMP_MAP[k]]).trim() : "";
  // Construir documentos
  const docs = [];
  IMP_ROWS.forEach(r => {
    const nombre = get(r, "cliente");
    const impTxt = get(r, "importe");
    if (!nombre && !impTxt) return; // fila vacía
    const estRaw = get(r, "estado");
    const estado = impEstadoNorm(estRaw) || estadoDef;
    const servicio = get(r, "servicio");
    const detalle = get(r, "detalle");
    const metodo = get(r, "metodo");
    const nit = get(r, "nit");
    const fechaTxt = get(r, "fecha");
    docs.push({
      nroRecepcion: get(r, "nrorec"),
      nroComprobante: get(r, "nrocom"),
      fechaISO: arqDate(fechaTxt) || "",
      fecha: fechaTxt,
      hora: get(r, "hora"),
      clienteNombre: nombre,
      nit: nit,
      ultimoDigitoNit: nitUltimo(nit),
      clienteId: get(r, "idcli"),
      rubro: get(r, "rubro"),
      clienteCelular: get(r, "celular"),
      clienteCorreo: get(r, "correo"),
      servicio: servicio,
      servicioNombre: servicio,
      detalleServicio: detalle,
      mesRecepcion: get(r, "mesrec"),
      anio: get(r, "anio"),
      mesPago: get(r, "mespago"),
      importe: arqNum(impTxt) || 0,
      metodoPago: metodo,
      tipoPago: metodo,
      atencion: get(r, "atencion"),
      comentarios: get(r, "comentarios"),
      tipo: tipo || recTipoDe(servicio, detalle),
      estado: estado,
      estadoDeuda: (/deudor/i.test(metodo) ? "con_deuda" : "sin_deuda"),
      reciboNro: get(r, "nrocom"),
      reciboEnviado: false,
      origen: "importado",
      importLote: lote,
      createdAt: serverTimestamp()
    });
  });
  if (!docs.length) { msg.className = "msg err"; msg.textContent = "No hay filas válidas para importar."; return; }
  const btn = el("imp_run"); btn.disabled = true;
  msg.className = "msg"; let done = 0;
  try {
    const CH = 20;
    for (let i = 0; i < docs.length; i += CH) {
      const chunk = docs.slice(i, i + CH);
      await Promise.all(chunk.map(d => setDoc(doc(collection(db, "recepciones")), d)));
      done += chunk.length;
      msg.textContent = `Importando… ${done}/${docs.length}`;
    }
    IMP_LASTLOTE = lote; recepLoaded = false;
    msg.className = "msg ok"; msg.textContent = `✓ ${done} registros importados correctamente.`;
    el("imp_result").innerHTML = `<div class="formcard">
      <h3 style="margin:0 0 6px">Importación lista ✓</h3>
      <p class="note" style="margin:0 0 10px">Se importaron <b>${done}</b> registros al destino elegido. Ya aparecen en Recepción, Dashboard y las listas.
      Si algo salió mal, puedes deshacer SOLO esta importación (borra exactamente esos ${done} registros).</p>
      <button class="btn danger" id="imp_undo" style="background:var(--danger);border-color:var(--danger)">Deshacer esta importación</button>
      <div class="msg" id="imp_undomsg"></div>
    </div>`;
    el("imp_undo").onclick = () => impUndo(lote, done);
  } catch (e) { msg.className = "msg err"; msg.textContent = "Error al importar: " + (e.code || e.message) + ` (se guardaron ${done}).`; }
  btn.disabled = false;
}

async function impUndo(lote, n) {
  const msg = el("imp_undomsg"); msg.className = "msg"; msg.textContent = "Deshaciendo…";
  try {
    const snap = await getDocs(collection(db, "recepciones"));
    const ids = snap.docs.filter(d => (d.data() || {}).importLote === lote).map(d => d.id);
    let done = 0;
    const CH = 20;
    for (let i = 0; i < ids.length; i += CH) {
      await Promise.all(ids.slice(i, i + CH).map(id => deleteDoc(doc(db, "recepciones", id))));
      done += Math.min(CH, ids.length - i);
      msg.textContent = `Deshaciendo… ${done}/${ids.length}`;
    }
    recepLoaded = false;
    msg.className = "msg ok"; msg.textContent = `✓ Importación deshecha (${done} registros eliminados).`;
    el("imp_undo").disabled = true;
  } catch (e) { msg.className = "msg err"; msg.textContent = "No se pudo deshacer: " + (e.code || e.message); }
}


function escape(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
