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
const LOGO_BYC = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" zoomAndPan="magnify" viewBox="11 100 132 40" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><g/><clipPath id="c73c86b7c9"><path d="M 42 24 L 88 24 L 88 37.578125 L 42 37.578125 Z M 42 24 " clip-rule="nonzero"/></clipPath><clipPath id="8b639d37ef"><path d="M 0.542969 4 L 8 4 L 8 13 L 0.542969 13 Z M 0.542969 4 " clip-rule="nonzero"/></clipPath><clipPath id="3c14d60791"><path d="M 4 3 L 7.496094 3 L 7.496094 8 L 4 8 Z M 4 3 " clip-rule="nonzero"/></clipPath><clipPath id="b0db276849"><rect x="0" width="8" y="0" height="9"/></clipPath><clipPath id="ec4969832e"><path d="M 39 4 L 45.378906 4 L 45.378906 11 L 39 11 Z M 39 4 " clip-rule="nonzero"/></clipPath><clipPath id="cd5bf04f37"><rect x="0" width="46" y="0" height="14"/></clipPath><clipPath id="f202c15746"><rect x="0" width="132" y="0" height="38"/></clipPath></defs><g transform="matrix(1, 0, 0, 1, 11, 101)"><g clip-path="url(#f202c15746)"><g fill="currentColor" fill-opacity="1"><g transform="translate(0.701317, 19.527358)"><g><path d="M 10.59375 0 L 4.0625 -11.5625 C 4.1875 -10.4375 4.25 -9.53125 4.25 -8.84375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.046875 -15 L 11.6875 -3.359375 C 11.550781 -4.429688 11.484375 -5.40625 11.484375 -6.28125 L 11.484375 -15 L 14.28125 -15 L 14.28125 0 Z M 10.59375 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(16.44427, 19.527358)"><g><path d="M 7.703125 0.21875 C 5.628906 0.21875 4.046875 -0.285156 2.953125 -1.296875 C 1.859375 -2.304688 1.3125 -3.75 1.3125 -5.625 L 1.3125 -15 L 4.453125 -15 L 4.453125 -5.875 C 4.453125 -4.6875 4.734375 -3.785156 5.296875 -3.171875 C 5.859375 -2.554688 6.6875 -2.25 7.78125 -2.25 C 8.90625 -2.25 9.769531 -2.566406 10.375 -3.203125 C 10.976562 -3.847656 11.28125 -4.769531 11.28125 -5.96875 L 11.28125 -15 L 14.421875 -15 L 14.421875 -5.78125 C 14.421875 -3.875 13.832031 -2.394531 12.65625 -1.34375 C 11.476562 -0.300781 9.828125 0.21875 7.703125 0.21875 Z M 7.703125 0.21875 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(32.187223, 19.527358)"><g><path d="M 13.921875 0 L 13.921875 -9.09375 C 13.921875 -9.300781 13.921875 -9.503906 13.921875 -9.703125 C 13.929688 -9.910156 13.96875 -10.796875 14.03125 -12.359375 C 13.519531 -10.453125 13.144531 -9.125 12.90625 -8.375 L 10.203125 0 L 7.96875 0 L 5.265625 -8.375 L 4.125 -12.359375 C 4.207031 -10.710938 4.25 -9.625 4.25 -9.09375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.671875 -15 L 8.34375 -6.609375 L 8.578125 -5.796875 L 9.09375 -3.796875 L 9.765625 -6.203125 L 12.53125 -15 L 16.703125 -15 L 16.703125 0 Z M 13.921875 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(50.346431, 19.527358)"><g><path d="M 13.921875 0 L 13.921875 -9.09375 C 13.921875 -9.300781 13.921875 -9.503906 13.921875 -9.703125 C 13.929688 -9.910156 13.96875 -10.796875 14.03125 -12.359375 C 13.519531 -10.453125 13.144531 -9.125 12.90625 -8.375 L 10.203125 0 L 7.96875 0 L 5.265625 -8.375 L 4.125 -12.359375 C 4.207031 -10.710938 4.25 -9.625 4.25 -9.09375 L 4.25 0 L 1.453125 0 L 1.453125 -15 L 5.671875 -15 L 8.34375 -6.609375 L 8.578125 -5.796875 L 9.09375 -3.796875 L 9.765625 -6.203125 L 12.53125 -15 L 16.703125 -15 L 16.703125 0 Z M 13.921875 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(68.505639, 19.527358)"><g><path d="M 1.453125 0 L 1.453125 -15 L 13.265625 -15 L 13.265625 -12.578125 L 4.59375 -12.578125 L 4.59375 -8.8125 L 12.609375 -8.8125 L 12.609375 -6.375 L 4.59375 -6.375 L 4.59375 -2.421875 L 13.703125 -2.421875 L 13.703125 0 Z M 1.453125 0 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(83.045778, 19.527358)"><g><path d="M 11.765625 0 L 8.28125 -5.703125 L 4.59375 -5.703125 L 4.59375 0 L 1.453125 0 L 1.453125 -15 L 8.953125 -15 C 10.742188 -15 12.125 -14.613281 13.09375 -13.84375 C 14.070312 -13.082031 14.5625 -11.976562 14.5625 -10.53125 C 14.5625 -9.476562 14.257812 -8.570312 13.65625 -7.8125 C 13.0625 -7.050781 12.257812 -6.550781 11.25 -6.3125 L 15.3125 0 Z M 11.390625 -10.40625 C 11.390625 -11.84375 10.46875 -12.5625 8.625 -12.5625 L 4.59375 -12.5625 L 4.59375 -8.140625 L 8.71875 -8.140625 C 9.59375 -8.140625 10.253906 -8.335938 10.703125 -8.734375 C 11.160156 -9.128906 11.390625 -9.6875 11.390625 -10.40625 Z M 11.390625 -10.40625 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(98.788732, 19.527358)"><g><path d="M 16.046875 -7.578125 C 16.046875 -6.015625 15.738281 -4.640625 15.125 -3.453125 C 14.507812 -2.265625 13.625 -1.351562 12.46875 -0.71875 C 11.320312 -0.09375 9.984375 0.21875 8.453125 0.21875 C 6.085938 0.21875 4.234375 -0.472656 2.890625 -1.859375 C 1.554688 -3.253906 0.890625 -5.160156 0.890625 -7.578125 C 0.890625 -9.984375 1.554688 -11.859375 2.890625 -13.203125 C 4.234375 -14.554688 6.09375 -15.234375 8.46875 -15.234375 C 10.84375 -15.234375 12.695312 -14.550781 14.03125 -13.1875 C 15.375 -11.820312 16.046875 -9.953125 16.046875 -7.578125 Z M 12.84375 -7.578125 C 12.84375 -9.191406 12.457031 -10.457031 11.6875 -11.375 C 10.925781 -12.300781 9.851562 -12.765625 8.46875 -12.765625 C 7.0625 -12.765625 5.972656 -12.304688 5.203125 -11.390625 C 4.441406 -10.472656 4.0625 -9.203125 4.0625 -7.578125 C 4.0625 -5.929688 4.453125 -4.632812 5.234375 -3.6875 C 6.015625 -2.738281 7.085938 -2.265625 8.453125 -2.265625 C 9.859375 -2.265625 10.941406 -2.722656 11.703125 -3.640625 C 12.460938 -4.566406 12.84375 -5.878906 12.84375 -7.578125 Z M 12.84375 -7.578125 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(115.745137, 19.527358)"><g><path d="M 13.703125 -4.328125 C 13.703125 -2.859375 13.15625 -1.734375 12.0625 -0.953125 C 10.96875 -0.171875 9.367188 0.21875 7.265625 0.21875 C 5.335938 0.21875 3.828125 -0.117188 2.734375 -0.796875 C 1.640625 -1.484375 0.9375 -2.519531 0.625 -3.90625 L 3.65625 -4.40625 C 3.863281 -3.613281 4.265625 -3.035156 4.859375 -2.671875 C 5.460938 -2.316406 6.289062 -2.140625 7.34375 -2.140625 C 9.539062 -2.140625 10.640625 -2.804688 10.640625 -4.140625 C 10.640625 -4.566406 10.515625 -4.914062 10.265625 -5.1875 C 10.015625 -5.46875 9.660156 -5.703125 9.203125 -5.890625 C 8.742188 -6.078125 7.863281 -6.300781 6.5625 -6.5625 C 5.4375 -6.820312 4.65625 -7.03125 4.21875 -7.1875 C 3.78125 -7.351562 3.382812 -7.539062 3.03125 -7.75 C 2.675781 -7.96875 2.375 -8.226562 2.125 -8.53125 C 1.875 -8.84375 1.675781 -9.203125 1.53125 -9.609375 C 1.394531 -10.023438 1.328125 -10.5 1.328125 -11.03125 C 1.328125 -12.382812 1.835938 -13.421875 2.859375 -14.140625 C 3.878906 -14.867188 5.363281 -15.234375 7.3125 -15.234375 C 9.164062 -15.234375 10.554688 -14.941406 11.484375 -14.359375 C 12.421875 -13.773438 13.023438 -12.8125 13.296875 -11.46875 L 10.25 -11.0625 C 10.09375 -11.707031 9.773438 -12.191406 9.296875 -12.515625 C 8.816406 -12.835938 8.132812 -13 7.25 -13 C 5.34375 -13 4.390625 -12.40625 4.390625 -11.21875 C 4.390625 -10.820312 4.488281 -10.5 4.6875 -10.25 C 4.894531 -10.007812 5.195312 -9.800781 5.59375 -9.625 C 5.988281 -9.445312 6.796875 -9.226562 8.015625 -8.96875 C 9.453125 -8.664062 10.476562 -8.382812 11.09375 -8.125 C 11.71875 -7.863281 12.210938 -7.5625 12.578125 -7.21875 C 12.941406 -6.875 13.21875 -6.460938 13.40625 -5.984375 C 13.601562 -5.503906 13.703125 -4.953125 13.703125 -4.328125 Z M 13.703125 -4.328125 "/></g></g></g><g clip-path="url(#c73c86b7c9)"><g transform="matrix(1, 0, 0, 1, 42, 24)"><g clip-path="url(#cd5bf04f37)"><g clip-path="url(#8b639d37ef)"><g transform="matrix(1, 0, 0, 1, -0.000000000000021316, 4)"><g clip-path="url(#b0db276849)"><g fill="currentColor" fill-opacity="1"><g transform="translate(0.725152, 6.153239)"><g><path d="M 0.359375 -3.046875 L 0.359375 -4.234375 L 1.328125 -4.234375 L 1.328125 -3.046875 Z M 1.328125 0 L 0.359375 0 L 0.359375 -3.0625 L 1.328125 -3.0625 Z M 3.0625 -1.140625 L 2.078125 -1.140625 L 2.078125 -1.921875 L 3.0625 -1.921875 Z M 2.078125 -1.921875 C 2.078125 -2.078125 2.046875 -2.195312 1.984375 -2.28125 C 1.929688 -2.375 1.847656 -2.421875 1.734375 -2.421875 L 2.03125 -3.15625 C 2.226562 -3.15625 2.40625 -3.097656 2.5625 -2.984375 C 2.71875 -2.878906 2.835938 -2.734375 2.921875 -2.546875 C 3.015625 -2.367188 3.0625 -2.160156 3.0625 -1.921875 Z M 1.0625 -1.859375 C 1.0625 -2.109375 1.101562 -2.332031 1.1875 -2.53125 C 1.269531 -2.726562 1.382812 -2.878906 1.53125 -2.984375 C 1.675781 -3.097656 1.84375 -3.15625 2.03125 -3.15625 L 1.734375 -2.421875 C 1.609375 -2.421875 1.507812 -2.367188 1.4375 -2.265625 C 1.363281 -2.171875 1.328125 -2.035156 1.328125 -1.859375 Z M 2.078125 -1.140625 L 3.0625 -1.140625 C 3.0625 -0.910156 3.015625 -0.703125 2.921875 -0.515625 C 2.835938 -0.328125 2.71875 -0.175781 2.5625 -0.0625 C 2.40625 0.0390625 2.226562 0.09375 2.03125 0.09375 L 1.734375 -0.640625 C 1.847656 -0.640625 1.929688 -0.679688 1.984375 -0.765625 C 2.046875 -0.859375 2.078125 -0.984375 2.078125 -1.140625 Z M 1.0625 -1.203125 L 1.328125 -1.203125 C 1.328125 -1.023438 1.363281 -0.882812 1.4375 -0.78125 C 1.507812 -0.6875 1.609375 -0.640625 1.734375 -0.640625 L 2.03125 0.09375 C 1.84375 0.09375 1.675781 0.0351562 1.53125 -0.078125 C 1.382812 -0.191406 1.269531 -0.34375 1.1875 -0.53125 C 1.101562 -0.726562 1.0625 -0.953125 1.0625 -1.203125 Z M 1.0625 -1.203125 "/></g></g></g><g clip-path="url(#3c14d60791)"><g fill="currentColor" fill-opacity="1"><g transform="translate(4.049206, 6.153239)"><g><path d="M 0.453125 1.0625 L 0.671875 0.3125 C 0.835938 0.351562 0.96875 0.359375 1.0625 0.328125 C 1.15625 0.304688 1.21875 0.242188 1.25 0.140625 L 2.0625 0.140625 C 1.9375 0.566406 1.738281 0.851562 1.46875 1 C 1.207031 1.15625 0.867188 1.175781 0.453125 1.0625 Z M 1.25 0.140625 L 2.03125 -3.0625 L 3.015625 -3.0625 L 2.0625 0.140625 Z M 1.25 0.53125 L 0.171875 -3.0625 L 1.15625 -3.0625 L 1.703125 -0.84375 Z M 1.25 0.53125 "/></g></g></g></g></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(8.028157, 10.61739)"><g><path d="M 3.875 0.15625 C 3.195312 0.15625 2.597656 0.0078125 2.078125 -0.28125 C 1.554688 -0.570312 1.148438 -0.976562 0.859375 -1.5 C 0.566406 -2.019531 0.421875 -2.609375 0.421875 -3.265625 C 0.421875 -3.929688 0.578125 -4.519531 0.890625 -5.03125 C 1.210938 -5.550781 1.632812 -5.953125 2.15625 -6.234375 C 2.6875 -6.523438 3.265625 -6.671875 3.890625 -6.671875 C 4.421875 -6.671875 4.929688 -6.554688 5.421875 -6.328125 C 5.910156 -6.097656 6.332031 -5.773438 6.6875 -5.359375 L 5.8125 -4.53125 C 5.519531 -4.84375 5.210938 -5.078125 4.890625 -5.234375 C 4.566406 -5.398438 4.222656 -5.484375 3.859375 -5.484375 C 3.453125 -5.484375 3.078125 -5.382812 2.734375 -5.1875 C 2.398438 -5 2.132812 -4.734375 1.9375 -4.390625 C 1.738281 -4.054688 1.640625 -3.679688 1.640625 -3.265625 C 1.640625 -2.816406 1.734375 -2.425781 1.921875 -2.09375 C 2.117188 -1.757812 2.390625 -1.5 2.734375 -1.3125 C 3.078125 -1.125 3.460938 -1.03125 3.890625 -1.03125 C 4.273438 -1.03125 4.613281 -1.101562 4.90625 -1.25 C 5.207031 -1.40625 5.523438 -1.644531 5.859375 -1.96875 L 6.703125 -1.09375 C 6.398438 -0.789062 6.109375 -0.550781 5.828125 -0.375 C 5.554688 -0.195312 5.257812 -0.0664062 4.9375 0.015625 C 4.625 0.109375 4.269531 0.15625 3.875 0.15625 Z M 3.875 0.15625 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(14.911591, 10.61739)"><g><path d="M 3.828125 0.15625 C 3.191406 0.15625 2.613281 0.00390625 2.09375 -0.296875 C 1.582031 -0.609375 1.175781 -1.023438 0.875 -1.546875 C 0.570312 -2.066406 0.421875 -2.640625 0.421875 -3.265625 C 0.421875 -3.890625 0.570312 -4.460938 0.875 -4.984375 C 1.1875 -5.503906 1.601562 -5.914062 2.125 -6.21875 C 2.644531 -6.519531 3.207031 -6.671875 3.8125 -6.671875 C 4.414062 -6.671875 4.972656 -6.519531 5.484375 -6.21875 C 6.003906 -5.914062 6.421875 -5.503906 6.734375 -4.984375 C 7.046875 -4.460938 7.203125 -3.878906 7.203125 -3.234375 C 7.203125 -2.609375 7.050781 -2.035156 6.75 -1.515625 C 6.445312 -1.003906 6.039062 -0.597656 5.53125 -0.296875 C 5.019531 0.00390625 4.453125 0.15625 3.828125 0.15625 Z M 3.828125 -1.03125 C 4.210938 -1.03125 4.566406 -1.128906 4.890625 -1.328125 C 5.210938 -1.523438 5.46875 -1.789062 5.65625 -2.125 C 5.84375 -2.46875 5.9375 -2.84375 5.9375 -3.25 C 5.9375 -3.644531 5.84375 -4.007812 5.65625 -4.34375 C 5.476562 -4.6875 5.222656 -4.960938 4.890625 -5.171875 C 4.566406 -5.378906 4.207031 -5.484375 3.8125 -5.484375 C 3.414062 -5.484375 3.054688 -5.382812 2.734375 -5.1875 C 2.410156 -5 2.148438 -4.734375 1.953125 -4.390625 C 1.765625 -4.054688 1.671875 -3.671875 1.671875 -3.234375 C 1.671875 -2.804688 1.769531 -2.425781 1.96875 -2.09375 C 2.164062 -1.757812 2.425781 -1.5 2.75 -1.3125 C 3.082031 -1.125 3.441406 -1.03125 3.828125 -1.03125 Z M 3.828125 -1.03125 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(22.519645, 10.61739)"><g><path d="M 4.71875 -6.5 L 5.96875 -6.5 L 5.96875 0 L 4.765625 0 L 1.984375 -4.265625 L 1.984375 0 L 0.75 0 L 0.75 -6.5 L 1.9375 -6.5 L 4.71875 -2.234375 Z M 4.71875 -6.5 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(29.221978, 10.61739)"><g><path d="M 1.265625 -5.296875 L 0.09375 -5.296875 L 0.09375 -6.5 L 3.703125 -6.5 L 3.703125 -5.296875 L 2.5 -5.296875 L 2.5 0 L 1.265625 0 Z M 1.265625 -5.296875 "/></g></g></g><g fill="currentColor" fill-opacity="1"><g transform="translate(32.935411, 10.61739)"><g><path d="M 4.984375 0 L 4.484375 -1.34375 L 1.78125 -1.34375 L 1.28125 0 L 0 0 L 2.515625 -6.5 L 3.765625 -6.5 L 6.265625 0 Z M 2.25 -2.5625 L 4.03125 -2.5625 L 3.140625 -4.953125 Z M 2.25 -2.5625 "/></g></g></g><g clip-path="url(#ec4969832e)"><g fill="currentColor" fill-opacity="1"><g transform="translate(39.202998, 10.61739)"><g><path d="M 2.390625 -3.359375 L 0.3125 -6.5 L 1.71875 -6.5 L 3.078125 -4.421875 L 4.453125 -6.5 L 5.84375 -6.5 L 3.78125 -3.359375 L 5.96875 0 L 4.578125 0 L 3.078125 -2.296875 L 1.59375 0 L 0.1875 0 Z M 2.390625 -3.359375 "/></g></g></g></g></g></g></g></g></g></svg>`;
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
  // Mostrar solo las pestañas que el rol puede ver; elegir la primera visible como activa
  let first = null;
  document.querySelectorAll('nav.tabs button').forEach(b => {
    const ok = access.groups.includes(b.dataset.grp);
    b.classList.toggle("hidden", !ok);
    b.classList.remove("active");
    b.onclick = () => switchView(b.dataset.v, b);
    if (ok && !first) first = b;
  });
  if (first) switchView(first.dataset.v, first);
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
  if (v === "inicio") renderInicio();
  if (v === "clientes") renderClientes();
  if (v === "presence") renderPresence();
  if (v === "historial") renderHistorial();
  if (v === "bandeja") renderBandeja();
  if (v === "respuestas") renderRespuestas();
  if (v === "reports") renderReports();
  if (v === "users") renderUsers();
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
  QR = []; snap.forEach(d => QR.push({ id: d.id, ...d.data() }));
  QR.sort((a, b) => (a.category || "General").localeCompare(b.category || "General") || (Number(a.nro) || 9999) - (Number(b.nro) || 9999) || (a.title || "").localeCompare(b.title || ""));
  const cats = [...new Set(QR.map(q => q.category || "General"))];
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
  try { (await getDocs(collection(db, "clientes"))).forEach(d => CLIENTES.push({ id: d.id, ...d.data() })); } catch (e) {}
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
  const ingreso = CLIENTES.filter(cliIsActivo).reduce((s, c) => s + cliMoney(c.costoMensual), 0);

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
      <input id="cli_search" class="mini" style="padding:9px;min-width:240px" placeholder="🔎 Buscar por nombre, NIT, código, teléfono…" value="${escape(cliFilter)}">
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
      ${canEdit ? '<button class="btn sec" id="cli_import" style="border:1px solid var(--line)">⬇️ Importar CSV</button>' : ""}
      <button class="btn sec" id="cli_export" style="border:1px solid var(--line)">⬆️ Exportar CSV</button>
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
  if (el("cli_new")) el("cli_new").onclick = () => openClienteModal(null);
  if (el("cli_import")) el("cli_import").onclick = importClientesCSV;
  el("cli_export").onclick = exportClientesCSV;
  el("v-clientes").querySelectorAll("[data-edit]").forEach(b => b.onclick = (e) => { e.stopPropagation(); openClienteModal(CLIENTES.find(x => x.id === b.dataset.edit)); });
  el("v-clientes").querySelectorAll("[data-del]").forEach(b => b.onclick = (e) => { e.stopPropagation(); delCliente(CLIENTES.find(x => x.id === b.dataset.del)); });
  el("v-clientes").querySelectorAll("[data-open]").forEach(r => r.onclick = () => openClienteModal(CLIENTES.find(x => x.id === r.dataset.open)));
}

function openClienteModal(c) {
  const canEdit = canEditClientes();
  const bg = document.createElement("div");
  bg.style = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px";
  const groupsHtml = CLI_GROUPS.map(g => {
    const fields = CLI_FIELDS.filter(f => f[2] === g);
    const inputs = fields.map(([key, label, , type]) => {
      const val = escape(c ? (c[key] != null ? c[key] : "") : "");
      const dis = canEdit ? "" : "disabled";
      if (type === "textarea") return `<div class="field" style="grid-column:1/-1"><label>${label}</label><textarea id="cf_${key}" style="min-height:70px" ${dis}>${val}</textarea></div>`;
      if (type === "secret") return `<div class="field"><label>${label}</label><input id="cf_${key}" type="password" value="${val}" ${dis}><span class="reveal note" data-rev="cf_${key}" style="font-size:11px">👁 mostrar</span></div>`;
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
    ${c && c.fileUrl ? `<div class="note" style="margin-top:10px">📁 <a href="${escape(c.fileUrl)}" target="_blank" style="color:var(--green)">Abrir carpeta de archivos</a></div>` : ""}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px">
      <button class="btn sec" id="cf_cancel" style="border:1px solid var(--line)">Cerrar</button>
      ${canEdit ? '<button class="btn" id="cf_save">Guardar</button>' : ""}
    </div>
    <div class="msg" id="cf_msg"></div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = (e) => { if (e.target === bg) close(); };
  bg.querySelector("#cf_x").onclick = close;
  bg.querySelector("#cf_cancel").onclick = close;
  bg.querySelectorAll("[data-rev]").forEach(s => s.onclick = () => { const i = bg.querySelector("#" + s.dataset.rev); if (i) { i.type = i.type === "password" ? "text" : "password"; s.textContent = i.type === "password" ? "👁 mostrar" : "🙈 ocultar"; } });
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
        const rows = parseCSV(String(rd.result)).filter(r => r.some(x => (x || "").trim() !== ""));
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
  const cols = CLI_FIELDS.map(f => f[0]);
  const labels = CLI_FIELDS.map(f => f[1]);
  const esc = v => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [labels.map(esc).join(",")];
  CLIENTES.forEach(c => lines.push(cols.map(k => esc(c[k])).join(",")));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "clientes-contax.csv"; a.click(); URL.revokeObjectURL(a.href);
}

function escape(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
