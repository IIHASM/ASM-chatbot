# Chat Widget (Conversation Mode)

Vue 3 widget for chat interfaces with persistent conversation ID.

## ✨ Features

- Stores user identity via cookie (`chat_uid`)
- Sends `conversationId`, `authorId` and `authorType`
- Works with a backend that supports threaded conversations
- Two build modes:
  - **Standalone** → incluye Vue embebido (se puede usar en cualquier página sin Vue)
  - **Lite / No-Standalone** → más ligero, requiere que la página cargue Vue globalmente
- Permite configurar props tanto por:
  - Atributos `data-*` en la etiqueta `<script>` que carga el widget
  - Props pasados directamente en la llamada a `ChatWidget.init({...})`
  - Objeto global opcional `window.CHAT_WIDGET_CONFIG`

---

## 🚀 Instalación & Desarrollo

Clona el repositorio e instala dependencias:

```bash
npm install
```

Modo desarrollo con recarga en caliente:

```bash
npm run dev
```

Abrir en navegador:  
```
http://localhost:5173
```

---

## 🏗️ Builds de Producción

### 1. Build Standalone (con Vue embebido)

Este build incluye Vue dentro del bundle, por lo que se puede usar en cualquier web sin dependencias externas.

```bash
npm run build
```

Genera:

```
dist/chat-widget.standalone.iife.js
dist/style.css
```

**Uso en HTML (con `data-*` + `init()`):**

```html
<link rel="stylesheet" href="/widget/style.css">

<script src="/widget/chat-widget.standalone.iife.js"
        data-chat-widget="1"
        data-icon-width="60"
        data-backend="https://your.api/message">
</script>

<script>
  // Props en data-* se mezclarán automáticamente con los pasados aquí
  ChatWidget.init({
    target: '#chat-widget',
    user: 'DemoUser'
  })
</script>
```

En este ejemplo:
- `data-icon-width="60"` y `data-backend="https://your.api/message"` vienen del `dataset`.
- `user: 'DemoUser'` viene de los props pasados manualmente.
- Ambos se combinan, dando flexibilidad al integrador.

---

### 2. Build No-Standalone (lite, externaliza Vue)

Este build es más liviano pero **requiere que la página incluya Vue globalmente** antes de cargar el widget.

```bash
npm run build:no-standalone
```

Genera:

```
dist/chat-widget.iife.js
dist/style.css
```

**Uso en HTML:**

```html
<link rel="stylesheet" href="/widget/style.css">

<!-- Vue debe estar cargado globalmente -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- Widget bundle -->
<script src="/widget/chat-widget.iife.js" 
        data-chat-widget="1"
        data-icon-width="60"
        data-backend="https://your.api/message">
</script>


<script>
  // En lite también puedes pasar props por dataset + init
  ChatWidget.init({
    target: '#chat-widget',
    user: getUserFromCookie()
  })
</script>
```

---

## 🔧 Configuración dinámica

Cuando los datos dependen de cookies, login u otra lógica de la aplicación host, como el `userId`, se recomienda **usar siempre `ChatWidget.init()`** en lugar de atributos `data-*`, ya que permite montar el widget dinámicamente una vez que los datos estén disponibles.

Ejemplo:

```html
<script src="/widget/chat-widget.standalone.iife.js" data-chat-widget="1" data-icon-width="60"></script>
<script>
  const userId = getUserFromCookie()

  ChatWidget.init({
    target: '#chat-widget',
    backend: 'https://your.api/message',
    user: userId
  })
</script>
```

---

## 📦 Snippet universal para integradores

Este snippet detecta si Vue ya está cargado globalmente y decide qué versión del widget usar.  
Sirve para documentar a terceros cómo incluir tu widget sin preocuparse de los detalles.

```html
<link rel="stylesheet" href="https://cdn.midominio.com/widget/style.css">

<div id="chat-widget"></div>

<script>
(function() {
  const hasVue = !!window.Vue
  const script = document.createElement('script')
  script.src = hasVue
    ? "https://cdn.midominio.com/widget/chat-widget.iife.js"       // Lite
    : "https://cdn.midominio.com/widget/chat-widget.standalone.iife.js" // Standalone
  script.setAttribute('data-chat-widget', '1')
  script.setAttribute('data-backend', 'https://your.api/message')
  script.onload = function() {
    ChatWidget.init({
      target: '#chat-widget',
      iconWdith: 60,
      user: window.MY_APP_USER_ID || null
    })
  }
  document.head.appendChild(script)
})();
</script>
```

---

## 📖 Notas

- **Standalone** = más pesado pero autónomo. Úsalo cuando el host **no use Vue**.  
- **Lite / No-Standalone** = más liviano, ideal para proyectos que **ya usan Vue global**.  
- Siempre expone `ChatWidget.init()` como API para mayor control.  
- Los props se pueden pasar de **tres maneras**:
  1. Atributos `data-*` en el `<script data-chat-widget="1">`
  2. Objeto global opcional `window.CHAT_WIDGET_CONFIG`
  3. Props directos en `ChatWidget.init({...})` (los de mayor prioridad)