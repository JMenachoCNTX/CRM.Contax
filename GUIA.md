# 📘 Guía paso a paso — SIN terminal, todo desde el navegador

Hola Jhonny 👋. Esta guía te lleva de la mano. **No vas a usar la terminal en ningún momento.**
Todo se hace con clics en dos páginas web: la **consola de Firebase** y **GitHub**.

Hazlo con calma, un paso a la vez. Cuando termines cada FASE, sigue con la siguiente.
Calcula unos 30–40 minutos la primera vez.

> Consejo: ten abiertas dos pestañas del navegador, una para Firebase y otra para GitHub,
> e ir cambiando entre ellas.

---

## 🗂️ FASE 0 — Prepara los archivos (2 min)

1. Descarga el archivo `crm-atencion.zip` que te envié.
2. Haz doble clic para descomprimirlo. Te queda una carpeta `crm-atencion` con estos archivos:
   `index.html`, `app.js`, `config.js`, `firestore-rules.txt`, `GUIA.md`, `README.md`.
3. No los muevas todavía. Solo tenlos ubicados.

---

## 🔥 FASE 1 — Crear el proyecto en Firebase (10 min)

Firebase es lo que guardará tus contactos y las cuentas de tu equipo.

### 1.1 Crear el proyecto
1. Entra a **https://console.firebase.google.com** e inicia sesión con tu cuenta de Google.
2. Clic en **"Crear un proyecto"** (o "Add project").
3. Ponle un nombre, por ejemplo **`crm-atencion`**. Clic en **Continuar**.
4. Si te pregunta por Google Analytics, puedes **desactivarlo** (no lo necesitas). Clic en **Crear proyecto**.
5. Espera a que termine y clic en **Continuar**.

### 1.2 Activar el inicio de sesión (Authentication)
1. En el menú de la izquierda, entra a **Compilación → Authentication** (Build → Authentication).
2. Clic en **"Comenzar"** (Get started).
3. En la lista de proveedores, elige **"Correo electrónico/contraseña"**.
4. **Activa** el primer interruptor (Email/Password) y clic en **Guardar**.

### 1.3 Crear la base de datos (Firestore)
1. En el menú izquierdo, entra a **Compilación → Firestore Database**.
2. Clic en **"Crear base de datos"**.
3. Elige una ubicación cercana (por ejemplo `us-central` o `southamerica-east1`) y **Siguiente**.
4. Cuando pregunte el modo, elige **"Comenzar en modo de producción"**. Clic en **Crear**.

### 1.4 Poner las reglas de seguridad
1. Ya dentro de Firestore, arriba clic en la pestaña **"Reglas"** (Rules).
2. Verás un recuadro con texto. **Borra todo** lo que haya ahí.
3. Abre el archivo **`firestore-rules.txt`** (de tu carpeta, con doble clic; se abre en TextEdit).
4. Selecciona **todo** su contenido (Cmd+A), cópialo (Cmd+C) y **pégalo** en el recuadro de reglas.
5. Clic en **"Publicar"** (Publish).

### 1.5 Obtener la configuración (los datos que van en config.js)
1. Arriba a la izquierda, clic en el **ícono de engranaje ⚙️ → "Configuración del proyecto"**.
2. Baja hasta la sección **"Tus apps"** y clic en el ícono **`</>`** (Web).
3. Ponle un apodo, por ejemplo `crm-web`, y clic en **"Registrar app"**.
   (NO marques "Firebase Hosting"; no lo usamos.)
4. Te mostrará un bloque de código con algo así:
   ```
   const firebaseConfig = {
     apiKey: "AIza.......",
     authDomain: "crm-atencion.firebaseapp.com",
     projectId: "crm-atencion",
     storageBucket: "crm-atencion.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:abcd..."
   };
   ```
5. **Deja esta pestaña abierta**: vas a copiar esos 6 valores en la FASE 2. Clic en "Continuar a la consola".

✅ Firebase quedó listo. Ahora GitHub.

---

## 🐙 FASE 2 — Subir a GitHub y publicar la página (10 min)

GitHub va a guardar los archivos y publicar tu CRM como página web online.

### 2.1 Crear el repositorio
1. Entra a **https://github.com** e inicia sesión.
2. Arriba a la derecha, clic en el **`+` → "New repository"**.
3. En **Repository name** escribe: **`crm-atencion`**.
4. Déjalo en **Public** (público). *(GitHub Pages gratis necesita que sea público.)*
5. Clic en **"Create repository"**.

### 2.2 Subir los archivos
1. En la página del repo recién creado, clic en el enlace **"uploading an existing file"**
   (o botón **"Add file" → "Upload files"**).
2. Abre tu carpeta `crm-atencion`, selecciona **TODOS los archivos** (index.html, app.js, config.js,
   firestore-rules.txt, GUIA.md, README.md) y **arrástralos** al recuadro de GitHub.
3. Abajo clic en **"Commit changes"** (botón verde).

### 2.3 Pegar la configuración de Firebase en config.js (¡importante!)
1. En la lista de archivos del repo, clic en **`config.js`**.
2. Arriba a la derecha del archivo, clic en el **ícono de lápiz ✏️** ("Edit this file").
3. Reemplaza cada `PEGA_AQUI...` por el valor correspondiente de tu `firebaseConfig`
   (el que dejaste abierto en Firebase). Copia el valor **entre las comillas**, respétalas.
   - `apiKey` → tu apiKey
   - `authDomain` → tu authDomain
   - `projectId` → tu projectId
   - `storageBucket` → tu storageBucket
   - `messagingSenderId` → tu messagingSenderId
   - `appId` → tu appId
4. Deja `GEMINI_API_KEY: ""` vacío por ahora.
5. Arriba a la derecha, clic en **"Commit changes..."** y confirma.

### 2.4 Encender GitHub Pages (publicar)
1. En el repo, arriba clic en **"Settings"** (Configuración).
2. En el menú izquierdo, clic en **"Pages"**.
3. En **"Branch"**, elige **`main`** y carpeta **`/ (root)`**. Clic en **"Save"**.
4. Espera 1–2 minutos y recarga. Aparecerá:
   **"Your site is live at https://TU_USUARIO.github.io/crm-atencion/"**
5. **Copia esa dirección**: es la URL de tu CRM. 🎉

---

## 🔐 FASE 3 — Autorizar tu página en Firebase (2 min)

Para que el login funcione en tu URL de GitHub, hay que autorizarla.

1. Vuelve a Firebase → **Authentication** → pestaña **"Settings"** (Configuración) →
   **"Dominios autorizados"** (Authorized domains).
2. Clic en **"Agregar dominio"** y escribe SOLO: **`TU_USUARIO.github.io`**
   (sin `https://` y sin `/crm-atencion`; solo la parte del dominio).
3. Clic en **Agregar**.

---

## 👤 FASE 4 — Entrar y volverte administrador (3 min)

1. Abre tu URL `https://TU_USUARIO.github.io/crm-atencion/` en el navegador.
2. Clic en **"¿No tienes cuenta? Regístrate"**.
3. Escribe tu nombre, tu correo y una contraseña (mínimo 6 caracteres). Clic en **"Crear cuenta"**.
4. Te dirá que tu cuenta quedó **pendiente**. Es normal: el primer usuario se activa a mano una sola vez.

### Convertirte en administrador (solo la primera vez)
5. Ve a Firebase → **Firestore Database** → pestaña **"Datos"**.
6. Verás una colección **`users`**. Clic en ella y clic en el documento que tiene tu correo.
7. Verás campos `role` y `active`. Clic en el lápiz ✏️ de cada uno y cámbialos:
   - `role`: escribe **`admin`**
   - `active`: cámbialo a **`true`** (verdadero)
8. Guarda.
9. Vuelve a tu página del CRM y **inicia sesión** con tu correo y contraseña. ¡Ya entras como administrador! 🎉

A partir de aquí, cuando otra persona de tu equipo se registre, tú entras a la pestaña
**👥 Equipo** dentro del CRM, la **activas** y le pones su rol (agente / supervisor / admin).
Ya no necesitas volver a tocar Firestore.

---

## 🤖 FASE 5 — Activar la IA (OPCIONAL — hazlo cuando el CRM ya funcione)

El CRM funciona perfecto sin esto. La IA solo te ayuda a mejorar/redactar; nunca envía sola.

1. Entra a **https://aistudio.google.com/app/apikey** con tu cuenta de Google.
2. Clic en **"Create API key"** y copia la clave que te da.
3. Ve a tu repo de GitHub → archivo **`config.js`** → lápiz ✏️.
4. En la línea `GEMINI_API_KEY: ""` pega tu clave entre las comillas:
   `GEMINI_API_KEY: "AIza....tu_clave"`.
5. **Commit changes**. Espera 1 minuto y recarga tu CRM. Los botones de IA ya funcionarán.

> ⚠️ Nota de seguridad honesta: como la página es pública, esa clave queda visible en el código.
> Para un uso pequeño está bien, pero conviene **limitar la clave**: en
> https://console.cloud.google.com/apis/credentials abres tu clave y en "Restricciones de
> aplicación" eliges "Sitios web" y agregas `TU_USUARIO.github.io`. Así solo funciona desde tu página.
> Si más adelante quieres máxima seguridad, se puede mover la IA a un servidor; te ayudo cuando quieras.

---

## 🆘 Si algo no funciona

- **La página dice "Falta configurar Firebase"** → revisa que en `config.js` reemplazaste TODOS los
  `PEGA_AQUI` por tus valores reales (y que hiciste "Commit changes").
- **Al iniciar sesión no pasa nada / error de dominio** → te faltó la FASE 3 (autorizar tu dominio).
- **"Activa Correo/contraseña"** → te faltó activar ese método en la FASE 1.2.
- **No veo mis contactos / permiso denegado** → revisa que pegaste bien las reglas (FASE 1.4) y que
  tu usuario tiene `active: true`.
- **La página tarda en aparecer** → GitHub Pages puede demorar 1–2 minutos tras guardar.

Cualquier paso en el que te trabes, dime en qué FASE y número estás y lo resolvemos juntos.
