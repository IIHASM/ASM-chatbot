# Chat Widget (Conversation Mode)

Vue 3 widget for chat interfaces with persistent conversation ID.

## ✨ Features

- Stores user identity via cookie (`chat_uid`)
- Sends `conversationId`, `authorId` and `authorType`
- Works with a backend that supports threaded conversations
- Two build modes:
  - **Standalone** → incluye Vue embebido (se puede usar en cualquier página sin Vue)
  - **Lite / No-Standalone** → más ligero, requiere que la página cargue Vue globalmente

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

**Uso en HTML:**

```html
<link rel="stylesheet" href="/widget/style.css">
<script src="/widget/chat-widget.standalone.iife.js"></script>
<script>
  ChatWidget.init({
    target: '#chat-widget',
    backend: 'https://your.api/message',
    user: 'DemoUser'
  })
</script>
```

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
<script src="/widget/chat-widget.iife.js"></script>

<script>
  ChatWidget.init({
    target: '#chat-widget',
    backend: 'https://your.api/message',
    user: getUserFromCookie()
  })
</script>
```

---

## 🔧 Configuración dinámica

Si el `userId` depende de cookies o de lógica de la aplicación host, se recomienda **usar siempre `ChatWidget.init()`** en lugar de atributos `data-*`, ya que permite montar el widget dinámicamente una vez que los datos estén disponibles.

Ejemplo:

```html
<script src="/widget/chat-widget.standalone.iife.js"></script>
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

<!-- Si no tienes Vue en tu proyecto, carga la versión standalone -->
<script>
(function() {
  const hasVue = !!window.Vue
  const script = document.createElement('script')
  script.src = hasVue
    ? "https://cdn.midominio.com/widget/chat-widget.iife.js"       // Lite
    : "https://cdn.midominio.com/widget/chat-widget.standalone.iife.js" // Standalone
  script.onload = function() {
    ChatWidget.init({
      target: '#chat-widget',
      backend: 'https://your.api/message',
      user: window.MY_APP_USER_ID || null
    })
  }
  document.head.appendChild(script)
})();
</script>

<div id="chat-widget"></div>
```

---

## 📖 Notas

- **Standalone** = más pesado pero autónomo. Úsalo cuando el host **no use Vue**.  
- **Lite / No-Standalone** = más liviano, ideal para proyectos que **ya usan Vue global**.  
- Siempre expone `ChatWidget.init()` como API para mayor control.