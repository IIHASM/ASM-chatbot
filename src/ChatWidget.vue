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
        <span class="status-text" :style="{ color: subtitleColor }">Online</span>
      </div>
      <div class="messages" ref="messagesContainer">


        <div v-for="(msg, i) in messages" :key="i" :class="msg.type">
          <!-- Mensaje del bot -->
          <div v-if="msg.type === 'bot' && (i !== messages.length - 1 || !isTyping)" class="message-row bot">
            <div class="bot-icon">
              <ChatSuggero :style="{ color: chatBotIconColor }" />
            </div>
            <div class="bot-bubble" v-html="msg.text" :style="{ background: chatBubbleColorBot, color: textBotColor }">
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

      <div class="input-wrapper" :style="{ '--focus-color': inputFocusColor }">
        <input v-model="input" @keyup.enter="sendMessage" :disabled="isTyping"
          placeholder="Pregunta lo que quieras..." />
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
import { ref, nextTick, watch } from 'vue';
import { defineProps } from 'vue'
import ChatLogo from './assets/images/chatIcon.svg'
import ChatSuggero from './assets/images/chatIcon.svg'

import './ChatWidget.css';

const randomName = ref('');

import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();


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
})

const show = ref(false);
const input = ref('');
const messages = ref([]);
const isTyping = ref(false);

const messagesContainer = ref(null);

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
const authorId = window.CHAT_WIDGET_CONFIG?.userId ?? null;
const authorType = authorId ? 'user' : 'anonymous';

const scriptTag = document.currentScript || [...document.getElementsByTagName('script')].pop();
const backendUrl = scriptTag?.dataset?.backend || props.backend || 'http://localhost:3000';

const sendMessage = async () => {
  if (!input.value.trim() || isTyping.value) return;

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

    const response = await fetch(`${backendUrl}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: userMessage,
        authorId,
        authorType,
        conversationId
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
                messages.value[botMessageIndex].text = 'Parece que ha habido un error. ¿Podrías intentarlo de nuevo?';
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
      messages.value[botMessageIndex].text = 'Parece que ha habido un error en tu respuesta. ¿Podrías revisarla o intentarlo de nuevo?';
    }

  } catch (error) {
    console.error('[Chat] Error en sendMessage:', error);
    isTyping.value = false;
    messages.value[botMessageIndex].text = 'Error de conexión. Por favor, inténtalo de nuevo.';
  }

  scrollToBottom();
};

// Guardar mensajes en MongoDB
async function saveToDB(type, text) {
  try {
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

async function loadNames() {
  const response = await fetch('src/assets/namesList/nombres_propios.csv'); 
  const csvText = await response.text();

  // Dividir en líneas
  const lines = csvText.trim().split('\n');

  // Ignorar la primera línea (cabecera) y extraer la primera columna (Nombre)
  assistantNames.value = lines.slice(1).map(line => line.split(',')[0]).filter(Boolean);
}

watch(show, async (newVal) => {
  if (newVal && messages.value.length === 0) {
    if (assistantNames.value.length === 0) {
      await loadNames();
    }
    randomName.value = assistantNames.value[Math.floor(Math.random() * assistantNames.value.length)];
    messages.value.push({
      text: `Hola, soy ${randomName.value}, ¿en qué puedo ayudarte?`,
      type: "bot"
    });
    nextTick(scrollToBottom);
  }
});

</script>