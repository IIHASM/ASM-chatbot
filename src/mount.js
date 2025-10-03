import { createApp } from 'vue'
import ChatWidget from './ChatWidget.vue'


/** Encuentra el <script> que carga el widget */
function findWidgetScript() {
  // Opción fiable: marcar el tag en el HTML con data-chat-widget="1"
  let el = document.querySelector('script[data-chat-widget]')
  if (el) return el

  // Fallback: buscar por nombre de archivo (ajústelo si cambia el nombre)
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  return scripts.reverse().find(s =>
    (s.src || '').includes('chat-widget.standalone') ||
    (s.src || '').includes('chat-widget.iife')
  ) || null
}

/** Lee defaults desde 1) objeto global, 2) data-* del script */
function readDefaults() {
  const fromGlobal = (window.CHAT_WIDGET_CONFIG || {}) // opcional
  const s = findWidgetScript()
  const fromDataset = s ? s.dataset : {}
  // Nota: si usa data-iconwidth="10", en JS llegará como { iconwidth: "10" }
  return { ...fromGlobal, ...fromDataset }
}

function doMount(target, props) {
  let el = document.querySelector(target)
  if (!el) {
    el = document.createElement('div')
    el.id = target.replace('#', '')
    document.body.appendChild(el)
  }
  const app = createApp(ChatWidget, props)
  app.mount(el)
}

/** API pública */
function init(config = {}) {
  // Mezcla: defaults (global+data-*) < parámetros de init()
  const defaults = readDefaults()
  const merged = { ...defaults, ...config }

  const { target = '#chat-widget', ...props } = merged
  // Si quiere ver qué llega:
  // console.debug('defaults:', defaults)
  // console.debug('config  :', config)
  // console.debug('merged  :', merged)

  doMount(target, props)
}

// Exponer API global
if (typeof window !== 'undefined') {
  window.ChatWidget = { init }
}

export { init }
