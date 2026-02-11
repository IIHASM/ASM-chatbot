<template>
  <div class="chat-widget">
    <Transition name="icon-transition">
      <button v-if="!show" @click="show = true" class="chat-button">
        <div class="chat-button-bubble">
          <ChatLogo class="bubble-logo" />
        </div>
      </button>
    </Transition>

    <Transition name="chat-box">
      <div v-if="show" class="chat-box">
        <div class="chat-header">
          <button class="header-close-btn" @click="show = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ChatHeaderLogo class="header-logo" />
        </div>
        <div class="messages" ref="messagesContainer">
          <div v-for="(msg, i) in messages" :key="i" :class="msg.type" :ref="(el) => setMessageRef(el, i)">
            <!-- Mensaje del bot -->
            <div v-if="msg.type === 'bot'" class="message-row bot">
              <div class="bot-icon">
                <ChatIcon />
              </div>
              <div class="bot-bubble">
                <div v-html="formatBotText(msg.text)"></div>
                <ChatForm v-if="msg.hasForm" :type="msg.formType" :language="currentLanguage" :backend="backend"
                  @success="(text) => handleFormSuccess(i, text)" />
              </div>
            </div>

            <!-- Mensaje del usuario -->
            <div v-else-if="msg.type === 'user'" class="message-row user">
              <div class="user-bubble" v-html="msg.text"></div>
              <div class="user-icon">
                <!-- Inline SVG for user icon to avoid extra file dependency if not needed, or keep simpler -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="typing-container">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <!-- Opciones automatizadas -->
          <div v-if="!isTyping && currentOptions.length > 0" class="automated-options">
            <button v-for="(option, idx) in currentOptions" :key="idx" class="option-chip"
              @click="handleOptionClick(option)">
              {{ option.label }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed, defineProps, onBeforeUpdate } from 'vue';
import ChatLogo from './assets/images/AAFF_LOGO_ASMTG_X.svg';
import ChatHeaderLogo from './assets/images/asmtch_full.svg';
import ChatIcon from './assets/images/asmtch_icon.svg';
import ChatForm from './ChatForm.vue';
import MarkdownIt from 'markdown-it';
import './ChatWidget.css';

const md = new MarkdownIt({ html: true, breaks: true });

// Sistema de traducciones
const translations = {
  es: { welcomeDefault: 'Bienvenido a ASM Tech Growth, ¿En qué puedo ayudarte?', chatWithUs: 'Hablemos' },
  ca: { welcomeDefault: 'Benvingut a ASM Tech Growth, en què et puc ajudar?', chatWithUs: 'Parlem' },
  en: { welcomeDefault: 'Welcome to ASM Tech Growth, how can I help you?', chatWithUs: 'Let\'s Chat' }
};

const currentLanguage = computed(() => {
  if (typeof window === 'undefined') return 'es';
  const stored = localStorage.getItem('language');
  if (stored) return stored;

  const docLang = document.documentElement.lang;
  if (docLang && translations[docLang]) return docLang;

  return 'es';
});
const t = computed(() => translations[currentLanguage.value] || translations['es']);

const props = defineProps({
  automatedOptions: {
    type: [Array, Object],
    required: false,
    default: () => []
  }
});

const currentOptions = computed(() => {
  if (Array.isArray(props.automatedOptions)) {
    return props.automatedOptions;
  }
  return props.automatedOptions[currentLanguage.value] || props.automatedOptions['es'] || [];
});

const show = ref(false);
const messages = ref([]);
const isTyping = ref(false);
const messagesContainer = ref(null);
const messageRefs = ref([]);

const setMessageRef = (el, index) => {
  if (el) {
    messageRefs.value[index] = el;
  }
};

onBeforeUpdate(() => {
  messageRefs.value = [];
});

function formatBotText(text) {
  return md.render(text || '');
}

const handleOptionClick = async (option) => {
  if (isTyping.value) return;

  // User "says" the label
  messages.value.push({ text: option.label, type: 'user' });
  const userMsgIndex = messages.value.length - 1;
  scrollToBottom();

  isTyping.value = true;
  const delay = Math.floor(Math.random() * 1000) + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  isTyping.value = false;

  // Bot "answers"
  messages.value.push({
    text: option.answer,
    type: 'bot',
    hasForm: option.hasForm,
    formType: option.formType
  });

  // Scroll so the user message is at the top
  nextTick(() => {
    scrollToMessage(userMsgIndex);
  });
};

const handleFormSuccess = (index, successText) => {
  console.log('handleFormSuccess called', index, successText);
  // Remove the message containing the form
  if (messages.value[index]) {
    console.log('Removing message at index', index);
    messages.value.splice(index, 1);
  } else {
    console.warn('Message not found at index', index);
  }

  // Add the success message from the bot
  messages.value.push({
    text: successText,
    type: 'bot'
  });

  // Scroll to bottom to show the new message
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const scrollToMessage = (index) => {
  const el = messageRefs.value[index];
  if (el && messagesContainer.value) {
    const top = el.offsetTop - 20;
    messagesContainer.value.scrollTo({ top, behavior: 'smooth' });
  }
};

watch(show, async (newVal) => {
  if (newVal) {
    if (messages.value.length === 0) {
      messages.value.push({ text: t.value.welcomeDefault, type: "bot" });
    }
    // Always scroll to bottom when opening
    nextTick(scrollToBottom);
  }
});
</script>