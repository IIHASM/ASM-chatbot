<template>
  <div class="chat-widget">

    <button @click="show = !show" class="chat-button">
      <img src="/images/chat-button.svg" alt="Chat" :width="iconWidth" />
    </button>    
    <div v-if="show" class="chat-box">
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, i) in messages" :key="i" :class="msg.type" v-html="msg.text"></div>
        <div v-if="isTyping" class="bot typing">✍️ Escribiendo</div>
      </div>
      <input v-model="input" @keyup.enter="sendMessage" placeholder="Pregunta lo que quieras..." />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { defineProps } from 'vue'

const props = defineProps({
  user: {
    type: String,
    required: false,
    default: null
  },
  iconWidth: {
    type: [String, Number],
    default: 50
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
const backendUrl = scriptTag?.dataset?.backend || 'http://localhost:3000';
const iconWidth = props.iconWidth || '50';

const sendMessage = async () => {
  if (!input.value.trim()) return;
  messages.value.push({ text: input.value, type: 'user' });
  scrollToBottom(); // Desplaza después de enviar
  // mostrar mensaje "escribiendo..."
  setTimeout(() => {
    isTyping.value = true;
    scrollToBottom(); // Desplaza después de enviar
  }, 1000); // espera 1 segundo (1000 ms)


  const res = await fetch(`${backendUrl}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: input.value,
      authorId,
      authorType,
      conversationId
    })
  });

  const data = await res.json();
  isTyping.value = false; // ocultar "escribiendo..."
  input.value = '';
  messages.value.push({ text: data.response || 'Error', type: 'bot' });
  // await typeText(data.response || 'Error');
  scrollToLastBotMessage(); // tras recibir
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

</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-family: sans-serif;
}
.chat-button {
  /* background-color: #007bff; */
  background: none;
  /* color: white; */
  border: none;
  /* border-radius: 50%;
  width: 50px;
  height: 50px; */
}
.chat-box {
  width: 340px;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.messages {
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 10px;
}
.user {
  text-align: right;
  color: #007bff;
}
.bot {
  text-align: left;
  color: #333;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 1rem;
  border: 1px solid #ccc;
}

.bot.typing::after {
  content: '';
  display: inline-block;
  width: 1ch;
  animation: dots 1s steps(3, end) infinite;
}

@keyframes dots {
  0%   { content: ''; }
  33%  { content: '.'; }
  66%  { content: '..'; }
  100% { content: '...'; }
}
</style>
