<template>
  <div class="chat-widget">

    <button @click="show = !show" class="chat-button" :class="{ 'no-shadow': show }">
      <!-- Si viene externalIcon se usa la URL -->
      <img v-if="externalIcon" :src="externalIcon" alt="Chat" :width="iconWidth"
      n -->
      <ChatIcon v-else-if="show" class="chat-icon" :width="iconWidth"
        :style="{ width: '100%', height: '100%', color: iconColor}" />

      <!-- Si no hay externalIcon y show es false, se muestra ChatButton -->
      <ChatButton v-else class="button-icon" :width="iconWidth"
        :style="{ width: '70%', height: '70%', color: iconColor }" />
    </button>


    <!-- <button @click="show = !show" class="chat-button">
        <ChatIcon class="icon" />
      </button> -->
    
    <div v-if="show" class="chat-box">
      <div class="chat-title">Suggero Chat</div>
      <div class="chat-status">
        <span class="status-indicator"></span>
        <span class="status-text">Online</span>
      </div>
      <div class="messages" ref="messagesContainer">

        <div v-for="(msg, i) in messages" :key="i" :class="msg.type">
          <div v-if="msg.type === 'bot'" class="message-row bot">
            <div class="bot-icon">
              <ChatIcon/>
            </div>
            <div class="bot-bubble" v-html="msg.text"></div>
          </div>


          <div v-else class="message-row user">
            <div class="user-bubble" v-html="msg.text"></div>
            <div class="user-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#01F3EA">
                <path
                  d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            </div>
          </div>

        </div>

        <div v-if="isTyping" class="bot typing">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>

      </div>

      <div class="input-wrapper">
        <input v-model="input" @keyup.enter="sendMessage" placeholder="Pregunta lo que quieras..." />
        <button class="send-button" @click="sendMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#01F3EA" viewBox="0 0 24 24">
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
import ChatButton from './assets/images/chat-button.svg'
import ChatIcon from './assets/images/chat.svg'

import './ChatWidget.css';

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
  iconWidth: {
    type: [String, Number],
    default: 50
  },
  iconColor: {
    type: String,
    required: false,
    default: null // o null si quieres que sea opcional
  },
  externalIcon: {
    type: String,
    required: false,
    default: null
  }
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

const conversationId = getOrCreateConversationId();
const authorId = window.CHAT_WIDGET_CONFIG?.userId ?? null;
const authorType = authorId ? 'user' : 'anonymous';

const scriptTag = document.currentScript || [...document.getElementsByTagName('script')].pop();
const backendUrl = scriptTag?.dataset?.backend || props.backend || 'http://localhost:3000';
const iconWidth = props.iconWidth || '50';

const sendMessage = async () => {
  if (!input.value.trim()) return;

  messages.value.push({ text: input.value, type: 'user' });
  scrollToBottom();

  input.value = '';
  isTyping.value = true;
  scrollToBottom();

  const start = Date.now();

  const res = await fetch(`${backendUrl}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: messages.value[messages.value.length - 1].text,
      authorId,
      authorType,
      conversationId
    })
  });

  const data = await res.json();

  const elapsed = Date.now() - start;
  const remaining = Math.max(2000 - elapsed, 0); // mínimo 2 segundos

  setTimeout(() => {
    isTyping.value = false;
    messages.value.push({ text: data.response || 'Parece que ha habido un error en tu respuesta. ¿Podrías revisarla o intentarlo de nuevo?', type: 'bot' });
    scrollToLastBotMessage();
  }, remaining);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const scrollToLastBotMessage = () => {
  nextTick(() => {
    const container = messagesContainer.value;
    if (!container) return;

    const botMessages = container.querySelectorAll('.bot');
    const lastBot = botMessages[botMessages.length - 1];
    if (lastBot) {
      lastBot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

// Esto no sirve si el texto tiene html ya que se rompe el html
const typeText = (fullText, delay = 20) => {
  return new Promise((resolve) => {
    debugger;
    let current = '';
    let i = 0;

    const msg = { text: '', type: 'bot' };
    messages.value.push(msg);

    const interval = setInterval(() => {
      debugger;
      current += fullText[i++];
      msg.text = current;
      if (i >= fullText.length) {
        clearInterval(interval);
        resolve();
      }
    }, delay);
  });
};

// Mensaje de bienvenida la primera vez que se abre el chatbox
watch(show, (newVal) => {
  if (newVal && messages.value.length === 0) {
    messages.value.push({
      text: "Hola, ¿en que puedo ayudarte?",
      type: "bot"
    });
    nextTick(scrollToBottom);
  }
});

</script>