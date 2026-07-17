// ============================================================
//   CONFIGURACIÓN  —  EDITA SOLO ESTE ARCHIVO
// ============================================================
//  Aquí pegas los datos de TU proyecto de Firebase.
//  (Los sacas de la consola de Firebase; la GUIA.md te dice dónde.)
//  Estos datos de Firebase son públicos por diseño: la seguridad
//  real la dan las "reglas" de Firestore, no estas claves.
// ============================================================
window.APP_CONFIG = {

  // ---------- FIREBASE (obligatorio) ----------
  firebase: {
    apiKey: "PEGA_AQUI_TU_apiKey",
    authDomain: "PEGA_AQUI.firebaseapp.com",
    projectId: "PEGA_AQUI_tu_projectId",
    storageBucket: "PEGA_AQUI.appspot.com",
    messagingSenderId: "PEGA_AQUI",
    appId: "PEGA_AQUI"
  },

  // ---------- IA (OPCIONAL · configúrala al final, Fase 5) ----------
  // Déjalo vacío ("") por ahora. Cuando quieras activar la IA,
  // pega aquí tu clave de Google AI Studio. La GUIA lo explica.
  GEMINI_API_KEY: "",
  GEMINI_MODEL: "gemini-2.0-flash"
};
