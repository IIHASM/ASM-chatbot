import { createApp } from 'vue'
import ChatWidget from './ChatWidget.vue'
import { defaultOptions } from './chatOptions.js'

/**
 * Obtiene la configuración del cliente desde el backend
 * @param {string} backendUrl - URL del backend
 * @param {string} clientId - UUID del cliente
 * @returns {Promise<Object>} - Configuración del cliente (estilos y nombres)
 */
async function fetchClientConfig(backendUrl, clientId) {
  try {
    console.log('[Chat Widget] Fetching client config from:', `${backendUrl}/chat/${clientId}/config`)

    const response = await fetch(`${backendUrl}/chat/${clientId}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[Chat Widget] Error response:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Chat Widget] Client config loaded:', JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('[Chat Widget] Error fetching client config:', error)
    return { styles: {}, assistantNames: [] }
  }
}

/**
 * Obtiene la configuración de estilos desde la API
 * @param {string} apiUrl - URL del endpoint que devuelve la configuración
 * @returns {Promise<Object>} - Objeto con la configuración de estilos
 */
async function fetchStyleConfig(apiUrl) {
  try {
    console.log('[Chat Widget] Fetching styles from:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Extraer features si existe, sino usar directamente los datos
    const styles = data.features || data.styleConfig || data
    console.log('[Chat Widget] Styles loaded:', styles)

    return styles
  } catch (error) {
    console.error('[Chat Widget] Error fetching style config:', error)
    return {}
  }
}

/**
 * Extrae la URL del backend desde styleApiUrl
 * Ejemplo: 'http://localhost:3010/chatbot-feature/2' -> 'http://localhost:3010'
 * @param {string} styleApiUrl - URL completa del endpoint de estilos
 * @returns {string} - URL base del backend
 */
function extractBackendUrl(styleApiUrl) {
  try {
    const url = new URL(styleApiUrl)
    return `${url.protocol}//${url.host}`
  } catch (error) {
    console.error('[Chat Widget] Error extracting backend URL:', error)
    return null
  }
}

/**
 * Inicializa el widget de chat con integración NestJS
 * @param {Object} config - Configuración del widget
 * @param {string} config.project - UUID del cliente (REQUERIDO)
 * @param {string} config.backend - URL del backend (opcional, usa http://localhost:3000 por defecto)
 * @param {string} config.styleApiUrl - URL alternativa para obtener los estilos (obsoleto, usa el backend)
 * @param {string} config.user - ID del usuario (opcional)
 * @param {string} config.chatLogoUrl - URL del logo personalizado (opcional)
 * @param {Object} config.styles - Estilos directos como fallback (opcional)
 */
export async function init(config = {}) {
  const container = document.getElementById('chat-widget') || createContainer()

  // Estilos por defecto
  const defaultStyles = {
    chatUserIconColor: '#000000',
    chatBotIconColor: '#000000',
    chatSendIconColor: '#000000',
    chatButtonColor: '#000000',
    statusIndicatorColor: '#5cd80a',
    loadIndicator: '#000000',
    inputFocusColor: '#000000',
    chatBubbleColorBot: '#B8B8B4',
    chatBubbleColorUser: '#FFFFFF',
    textBotColor: '#000000',
    textUserColor: '#000000',
    titleColor: '#000000',
    subtitleColor: '#000000',
    chatBackgroundColor: '#C9C9C926',
    linkBotColor: '#0000EE',
  }

  // Combinar: defaults < config.styles < configClientStyles < styleApiUrl
  let styleConfig = { ...defaultStyles, ...config.styles }
  let assistantNames = []

  // Determinar la URL del backend
  let backendUrl = config.backend || 'http://127.0.0.1:3002'

  // Si se proporciona project (clientId), obtener la configuración del cliente
  if (config.project) {
    const clientConfig = await fetchClientConfig(backendUrl, config.project)
    if (clientConfig.styles && Object.keys(clientConfig.styles).length > 0) {
      styleConfig = { ...styleConfig, ...clientConfig.styles }
    }
    if (clientConfig.assistantNames && clientConfig.assistantNames.length > 0) {
      assistantNames = clientConfig.assistantNames
    }
  }

  // Si se proporciona styleApiUrl (fallback para retrocompatibilidad), obtener estilos desde la API
  if (config.styleApiUrl) {
    const apiStyles = await fetchStyleConfig(config.styleApiUrl)
    // Los estilos de la API tienen máxima prioridad
    styleConfig = { ...styleConfig, ...apiStyles }
  }

  // Crear la aplicación Vue con la configuración combinada
  const app = createApp(ChatWidget, {
    backend: backendUrl,
    project: config.project,
    user: config.user,
    chatLogoUrl: config.chatLogoUrl || styleConfig.chatLogoUrl,
    assistantNames: assistantNames,
    automatedOptions: config.automatedOptions || defaultOptions,
    ...styleConfig
  })

  console.log('[Chat Widget] Initialized with config:', {
    backend: backendUrl,
    project: config.project,
    styleApiUrl: config.styleApiUrl,
    user: config.user,
    hasCustomStyles: !!config.styles,
    assistantNamesCount: assistantNames.length
  })

  app.mount(container)
}

function createContainer() {
  const div = document.createElement('div')
  div.id = 'chat-widget'
  document.body.appendChild(div)
  return div
}

// Export para uso directo en navegador
if (typeof window !== 'undefined') {
  window.ChatWidget = { init }
}