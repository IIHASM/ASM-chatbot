<template>
  <div class="chat-widget">

    <button @click="show = !show" class="chat-button" :class="{ 'no-shadow': show }">

      <div v-if="show && chatLogoUrl" class="chat-icon">
        <img :src="chatLogoUrl" alt="Chat Logo" />
      </div>

      <ChatLogo v-else-if="show" class="chat-icon" :style="{ color: chatButtonColor }" />

      <ChatSuggero v-else class="button-icon" :style="{ color: chatButtonColor }" />
    </button>

    <div v-if="show" class="chat-box" :style="{ backgroundColor: chatBackgroundColor }">
      <div class="chat-title" :style="{ color: titleColor }">{{ randomName }}</div>
      <div class="chat-status">
        <span class="status-indicator" :style="{ backgroundColor: statusIndicatorColor }"></span>
        <span class="status-text" :style="{ color: subtitleColor }">{{ t.online }}</span>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, i) in messages" :key="i" :class="msg.type">
          <!-- Mensaje del bot -->
          <div v-if="msg.type === 'bot' && (i !== messages.length - 1 || !isTyping)" class="message-row bot">
            <div class="bot-icon">
              <ChatSuggero :style="{ color: chatBotIconColor }" />
            </div>
            <div class="bot-bubble" v-html="msg.text" @click="handleIncidentLinkClick"
              :style="{ 
                background: chatBubbleColorBot, 
                color: textBotColor,
                '--link-color': linkBotColor 
              }">
            </div>
          </div>

          <!-- Mensaje del usuario -->
          <div v-else-if="msg.type === 'user'" class="message-row user">
            <div class="user-bubble" v-html="msg.text"
              :style="{ background: chatBubbleColorUser, color: textUserColor }"></div>
            <div class="user-icon">
              <svg xmlns="http://www.w3.org/2000/svg" :fill="chatUserIconColor">
                <path
                  d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            </div>
          </div>
        </div>


        <div v-if="isTyping" class="bot typing">
          <div class="typing-indicator">
            <span :style="{ backgroundColor: loadIndicator }"></span>
            <span :style="{ backgroundColor: loadIndicator }"></span>
            <span :style="{ backgroundColor: loadIndicator }"></span>
          </div>
        </div>

      </div>

      <!-- Formulario de Incidencias -->
      <div v-if="showIncidentForm" class="incident-form-overlay">
        <div class="incident-form-container">
          <div class="incident-form-header">
            <h3>{{ t.reportIncident }}</h3>
            <button class="close-form-btn" @click="closeIncidentForm">×</button>
          </div>

          <div class="incident-form-content">
            <div class="form-group">
              <label>{{ t.email }}:</label>
              <input type="email" v-model="incidentForm.email" disabled class="form-input disabled-input" />
            </div>

            <div class="form-group">
              <label>{{ t.orderNumber }}:</label>
              <input type="text" v-model="incidentForm.orderId" disabled class="form-input disabled-input" />
            </div>

            <div class="form-group">
              <label>{{ t.incidentReason }}:</label>
              <textarea v-model="incidentForm.reason" :placeholder="t.incidentPlaceholder"
                class="form-textarea" rows="5"></textarea>
            </div>

            <div class="form-actions">
              <button class="cancel-btn" @click="closeIncidentForm">{{ t.cancel }}</button>
              <button class="submit-btn" @click="submitIncident" :disabled="!incidentForm.reason.trim()">
                {{ t.submitIncident }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat messages y input -->
      <div class="input-wrapper" :style="{ '--focus-color': inputFocusColor }">
        <input v-model="input" @keyup.enter="sendMessage" :disabled="isTyping"
          :placeholder="t.inputPlaceholder" />
        <button class="send-button" @click="sendMessage" :disabled="isTyping">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" :fill="chatSendIconColor" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue';
import { defineProps } from 'vue'
import ChatLogo from './assets/images/chatIcon.svg'
import ChatSuggero from './assets/images/chatIcon.svg'

import './ChatWidget.css';

const randomName = ref('');

import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

// Sistema de traducciones
const translations = {
  es: {
    online: 'Online',
    reportIncident: 'Reportar Incidencia',
    email: 'Email',
    orderNumber: 'Número de Pedido',
    incidentReason: 'Motivo de la Incidencia',
    incidentPlaceholder: 'Describe el problema con tu pedido...',
    cancel: 'Cancelar',
    submitIncident: 'Enviar Incidencia',
    inputPlaceholder: 'Pregunta lo que quieras...',
    inactivityWarning: '¡Hola! Si no vemos actividad en unos minutos, cerraremos el chat para que todo siga ordenado. Si necesitas algo, escríbenos.',
    welcomeDefault: (name) => `Hola, soy ${name}, ¿en qué puedo ayudarte?`,
    welcomeWithName: (assistantName, userName) => `Hola ${userName}, soy ${assistantName}, ¿en qué puedo ayudarte?`,
    incidentReported: (orderId) => `Incidencia reportada correctamente. Nuestro equipo revisará tu reporte para el pedido ${orderId} y se pondrá en contacto contigo pronto.`,
    incidentError: 'Error al enviar la incidencia. Por favor, inténtalo de nuevo.',
    loginRequired: 'Por favor, inicia sesión para reportar una incidencia.',
    errorGeneral: 'Parece que ha habido un error. ¿Podrías intentarlo de nuevo?',
    errorResponse: 'Parece que ha habido un error en tu respuesta. ¿Podrías revisarla o intentarlo de nuevo?',
    errorConnection: 'Error de conexión. Por favor, inténtalo de nuevo.'
  },
  ca: {
    online: 'En línia',
    reportIncident: 'Reportar Incidència',
    email: 'Correu electrònic',
    orderNumber: 'Número de Comanda',
    incidentReason: 'Motiu de la Incidència',
    incidentPlaceholder: 'Descriu el problema amb la teva comanda...',
    cancel: 'Cancel·lar',
    submitIncident: 'Enviar Incidència',
    inputPlaceholder: 'Pregunta el que vulguis...',
    inactivityWarning: 'Hola! Si no veiem activitat en uns minuts, tancarem el xat per mantenir-ho tot ordenat. Si necessites alguna cosa, escriu-nos.',
    welcomeDefault: (name) => `Hola, sóc ${name}, en què et puc ajudar?`,
    welcomeWithName: (assistantName, userName) => `Hola ${userName}, sóc ${assistantName}, en què et puc ajudar?`,
    incidentReported: (orderId) => `Incidència reportada correctament. El nostre equip revisarà el teu informe per a la comanda ${orderId} i es posarà en contacte amb tu aviat.`,
    incidentError: 'Error en enviar la incidència. Si us plau, torna-ho a intentar.',
    loginRequired: 'Si us plau, inicia sessió per reportar una incidència.',
    errorGeneral: 'Sembla que hi ha hagut un error. Podries tornar-ho a intentar?',
    errorResponse: 'Sembla que hi ha hagut un error en la teva resposta. Podries revisar-la o tornar-ho a intentar?',
    errorConnection: 'Error de connexió. Si us plau, torna-ho a intentar.'
  }
};

// Computed property para obtener las traducciones según el idioma actual
const currentLanguage = computed(() => localStorage.getItem('language') || 'es');
const t = computed(() => translations[currentLanguage.value]);

// Plugin para convertir [correo@dominio.com] en <a href="mailto:correo@dominio.com">correo@dominio.com</a>
md.use((md) => {
  md.inline.ruler.after('link', 'email', (state, silent) => {
    const pos = state.pos;
    const max = state.posMax;
    const src = state.src.slice(pos, max);

    // Regex para detectar [correo@dominio.com]
    const match = src.match(/^\[([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\]/);
    if (!match) return false;

    if (!silent) {
      const email = match[1];
      const token = state.push('link_open', 'a', 1);
      token.attrs = [['href', `mailto:${email}`]];

      const textToken = state.push('text', '', 0);
      textToken.content = email;

      state.push('link_close', 'a', -1);
    }

    state.pos += match[0].length;
    return true;
  });
});



const props = defineProps({
  backend: {
    type: String,
    required: false,
    default: null
  },
  project: {
    type: String,
    required: false,
    default: null
  },
  assistantNames: {
    type: Array,
    required: false,
    default: () => []
  },
  prueba: {
    type: String,
    required: false,
    default: null
  },
  user: {
    type: String,
    required: false,
    default: null
  },
  chatLogoUrl: {
    type: String,
    default: null
  },
  chatUserIconColor: {
    type: String,
    default: '#000000'
  },
  chatBotIconColor: {
    type: String,
    default: '#000000'
  },
  chatSendIconColor: {
    type: String,
    default: '#000000'
  },
  chatButtonColor: {
    type: String,
    default: '#000000'
  },
  loadIndicator: {
    type: String,
    default: '#000000'
  },
  statusIndicatorColor: {
    type: String,
    default: '#5cd80a'
  },
  inputFocusColor: {
    type: String,
    default: '#000000'
  },
  chatBubbleColorBot: {
    type: String,
    default: '#B8B8B4'
  },
  chatBubbleColorUser: {
    type: String,
    default: '#FFFFFF'
  },
  textUserColor: {
    type: String,
    default: '#000000'
  },
  textBotColor: {
    type: String,
    default: '#000000'
  },
  titleColor: {
    type: String,
    default: '#000000'
  },
  subtitleColor: {
    type: String,
    default: '#000000'
  },
  chatBackgroundColor: {
    type: String,
    default: '#C9C9C926'
  },
  linkBotColor: {
    type: String,
    default: '#0000EE'
  },
})

const show = ref(false);
const input = ref('');
const messages = ref([]);
const isTyping = ref(false);
const showIncidentForm = ref(false);

const incidentForm = ref({
  email: '',
  orderId: '',
  reason: ''
});

const messagesContainer = ref(null);
let inactivityTimeout = null;
let warningTimeout = null;

function resetInactivityTimer() {
  // Limpiar timers existentes
  if (inactivityTimeout) clearTimeout(inactivityTimeout);
  if (warningTimeout) clearTimeout(warningTimeout);

  if (!show.value) return;

  // Timer para mostrar aviso 
  warningTimeout = setTimeout(() => {
    if (show.value && !isTyping.value) {
      messages.value.push({
        text: t.value.inactivityWarning,
        type: 'bot'
      });
      scrollToBottom();
    }
  }, 300000); // 5 minutos

  // Timer para cerrar chat 
  inactivityTimeout = setTimeout(() => {
    if (show.value) {
      show.value = false;
    }
  }, 600000); // 10 minutos
}

function getOrCreateConversationId() {
  const COOKIE_NAME = 'chat_uid';
  const existing = document.cookie.split('; ').find(row => row.startsWith(COOKIE_NAME + '='));
  if (existing) return existing.split('=')[1];
  const uid = crypto.randomUUID();
  document.cookie = `${COOKIE_NAME}=${uid}; path=/; max-age=${60 * 60 * 24 * 365}`;
  return uid;
}


function formatBotText(text) {
  return md.render(text);
}

const conversationId = getOrCreateConversationId();
const user = JSON.parse(localStorage.getItem('user'));
const authorId = user?.email || null;
const authorType = authorId ? 'user' : 'anonymous';

const scriptTag = document.currentScript || [...document.getElementsByTagName('script')].pop();
const backendUrl = props.backend || 'http://localhost:3000';
const project = props.project || '';

// console.log('[Chat] conectado con proyecto:', { project });
// console.log('PROPS', props);

const sendMessage = async () => {
  if (!input.value.trim() || isTyping.value) return;

  resetInactivityTimer();

  const userMessage = input.value;
  messages.value.push({ text: userMessage, type: 'user' });
  input.value = '';

  scrollToBottom();
  isTyping.value = true;

  await new Promise(resolve => setTimeout(resolve, 500));

  const botMessageIndex = messages.value.length;
  messages.value.push({ text: '', type: 'bot' });

  try {
    // Guardar mensaje del usuario en MongoDB
    await saveToDB('user', userMessage);

    // Obtener idioma actual en el momento del envío
    const webLanguage = localStorage.getItem('language') || 'es';

    const response = await fetch(`${backendUrl}/chat/${project}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: userMessage,
        authorId,
        authorType,
        conversationId,
        language: webLanguage // Usar idioma del localStorage
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunkCount++;
      const decoded = decoder.decode(value, { stream: true });
      buffer += decoded;

      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (!event.trim()) continue;

        const lines = event.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk' && data.content) {
                if (isTyping.value) {
                  isTyping.value = false;
                }

                accumulatedText += data.content;
                messages.value[botMessageIndex].text = formatBotText(accumulatedText);
                await nextTick();
                scrollToBottom();
              } else if (data.type === 'end') {
                // Guardar mensaje del bot en MongoDB
                await saveToDB('bot', accumulatedText);
              } else if (data.type === 'error') {
                isTyping.value = false;
                messages.value[botMessageIndex].text = t.value.errorGeneral;
              }
            } catch (e) {
              console.error('[Chat] Error parseando SSE:', e, line);
            }
          }
        }
      }
    }

    if (!accumulatedText) {
      isTyping.value = false;
      messages.value[botMessageIndex].text = t.value.errorResponse;
    }

  } catch (error) {
    console.error('[Chat] Error en sendMessage:', error);
    isTyping.value = false;
    messages.value[botMessageIndex].text = t.value.errorConnection;
  }

  scrollToBottom();
};

// Guardar mensajes en MongoDB
async function saveToDB(type, text) {
  try {
    console.log('[Chat] Enviando mensaje:', {
      type,
      content: text,
      conversationId,
      authorId,
      authorType
    });

    await fetch(`${backendUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        content: text,
        conversationId,
        authorId,
        authorType,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('[Chat] Error saving message to DB:', error);
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};


const assistantNames = ref([]);
const allAssistantNames = ref([]);

async function loadNames() {
  // Si los nombres ya vienen en props, usarlos directamente
  if (props.assistantNames && props.assistantNames.length > 0) {
    allAssistantNames.value = props.assistantNames;
    const language = currentLanguage.value === 'ca' ? 'CA' : 'ES';
    assistantNames.value = allAssistantNames.value
      .filter(item => item.origin === language)
      .map(item => item.name);
    console.log('[Chat] Names from props:', assistantNames.value);
    return;
  }
  
  // Si no vienen en props, intentar obtenerlos del backend
  try {
    const response = await fetch(`${backendUrl}/assistant-name`);
    const data = await response.json();

    // Guardar todos los nombres con su información completa
    allAssistantNames.value = data;
    
    // Filtrar nombres según el idioma actual (ES/CA)
    const language = currentLanguage.value === 'ca' ? 'CA' : 'ES';
    assistantNames.value = data
      .filter(item => item.origin === language)
      .map(item => item.name);
    console.log('[Chat] Names from backend:', assistantNames.value);
  } catch (error) {
    console.error('[Chat] Error loading names:', error);
  }
}

watch(show, async (newVal) => {
  if (newVal) {
    resetInactivityTimer();

    if (messages.value.length === 0) {
      if (allAssistantNames.value.length === 0) {
        await loadNames();
      } else {
        // Recargar nombres filtrados por idioma (ES/CA)
        const language = currentLanguage.value === 'ca' ? 'CA' : 'ES';
        assistantNames.value = allAssistantNames.value
          .filter(item => item.origin === language)
          .map(item => item.name);
      }

      randomName.value = assistantNames.value[Math.floor(Math.random() * assistantNames.value.length)];

      const userName = window.CHAT_WIDGET_CONFIG?.userName;

      let welcomeMessage = userName
        ? t.value.welcomeWithName(randomName.value, userName)
        : t.value.welcomeDefault(randomName.value);

      messages.value.push({ text: welcomeMessage, type: "bot" });
      nextTick(scrollToBottom);
    }
  } else {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    if (warningTimeout) clearTimeout(warningTimeout);
  }
});


// Funciones del formulario de incidencias
function openIncidentForm(email, orderId) {
  incidentForm.value = {
    email,
    orderId,
    reason: ''
  };
  showIncidentForm.value = true;
}

function closeIncidentForm() {
  showIncidentForm.value = false;
  incidentForm.value = {
    email: '',
    orderId: '',
    reason: ''
  };
}

async function submitIncident() {
  if (!incidentForm.value.reason.trim()) return;

  try {
    // Enviar incidencia al backend (que la reenviará a n8n)
    const response = await fetch(`${backendUrl}/${project}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: incidentForm.value.email,
        orderId: incidentForm.value.orderId,
        reason: incidentForm.value.reason,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    // Agregar mensaje al chat confirmando el envío
    messages.value.push({
      text: t.value.incidentReported(incidentForm.value.orderId),
      type: 'bot'
    });
    scrollToBottom();
    closeIncidentForm();
  } catch (error) {
    console.error('[Chat] Error submitting incident:', error);
    messages.value.push({
      text: t.value.incidentError,
      type: 'bot'
    });
  }
}

function handleIncidentLinkClick(event) {
  const target = event.target;
  if (target.tagName === 'A' && target.href.includes('#incident-')) {
    event.preventDefault();
    const orderId = target.href.split('#incident-')[1];
    if (authorId) {
      openIncidentForm(authorId, orderId);
    } else {
      messages.value.push({
        text: t.value.loginRequired,
        type: 'bot'
      });
      scrollToBottom();
    }
  }
}

// Exponer función globalmente para que el backend pueda llamarla
if (!window.CHAT_WIDGET_CONFIG) {
  window.CHAT_WIDGET_CONFIG = {};
}
window.CHAT_WIDGET_CONFIG.openIncidentForm = openIncidentForm;
</script>