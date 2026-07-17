# CRM de atención (GitHub Pages + Firebase) — sin terminal

CRM web para organizar tu atención al cliente de WhatsApp, **dentro de las políticas de Meta**:
no automatiza ni envía mensajes; es un panel para gestionar contactos, equipo, notas, etiquetas
y una IA que **solo te asiste** (mejora tu redacción, sugiere, resume, clasifica). Tú siempre envías.

## 👉 Empieza aquí
Abre **`GUIA.md`** y sigue las fases 0 a 5. Todo se hace desde el navegador (Firebase + GitHub),
**sin usar la terminal**.

## Archivos
- `index.html` · `app.js` — la aplicación (se publica en GitHub Pages).
- `config.js` — **el único archivo que editas**: pegas ahí los datos de tu proyecto Firebase.
- `firestore-rules.txt` — reglas de seguridad para pegar en la consola de Firebase.
- `GUIA.md` — la guía paso a paso.

## Qué hace
- Login por usuario con roles (admin / supervisor / agente).
- Contactos con estado (nuevo / en proceso / cerrado), etiquetas, búsqueda y filtros.
- Asignación de contactos y bitácora de quién atendió.
- Notas internas por contacto.
- Respuestas rápidas compartidas.
- Asistente de IA (opcional): mejorar mensaje, sugerir, resumir, clasificar, traducir.
- Reportes de desempeño por agente.
- Botón "Abrir en WhatsApp" (wa.me) para que tú escribas y envíes.
