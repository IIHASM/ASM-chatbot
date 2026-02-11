<template>
    <div class="commercial-form">
        <form @submit.prevent="handleSubmit" v-if="!submitted">
            <div class="form-group">
                <label for="companyName">{{ t.companyName }}</label>
                <input type="text" id="companyName" v-model="form.companyName" required
                    :placeholder="t.companyPlaceholder" />
            </div>

            <div class="form-group">
                <label for="contactName">{{ t.contactName }}</label>
                <input type="text" id="contactName" v-model="form.contactName" required
                    :placeholder="t.namePlaceholder" />
            </div>

            <div class="form-group">
                <label for="email">{{ t.email }}</label>
                <input type="email" id="email" v-model="form.email" required :placeholder="t.emailPlaceholder" />
            </div>

            <div class="form-group">
                <label for="phone">{{ t.phone }}</label>
                <input type="tel" id="phone" v-model="form.phone" required placeholder="+34 600 000 000" />
            </div>

            <div class="form-group">
                <label for="message">{{ t.messageLabel }}</label>
                <textarea id="message" v-model="form.message" rows="3" required
                    :placeholder="messagePlaceholder"></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span v-if="!isSubmitting">{{ t.submit }}</span>
                <div v-else class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>
            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>
        </form>


    </div>
</template>

<script setup>
import { reactive, ref, computed, defineProps } from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: 'commercial'
    },
    language: {
        type: String,
        default: 'es'
    },
    backend: {
        type: String,
        default: 'http://127.0.0.1:3002'
    }
});

const translations = {
    es: {
        companyName: 'Nombre empresa',
        companyPlaceholder: 'Tu empresa',
        contactName: 'Persona de contacto',
        namePlaceholder: 'Tu nombre',
        email: 'Email de contacto',
        emailPlaceholder: 'nombre@empresa.com',
        phone: 'Tel de contacto',
        messageLabel: '¿En qué te podemos ayudar?',
        messagePlaceholderSupport: 'Describe tu incidencia lo más detalladamente posible...',
        messagePlaceholderCommercial: 'Cuéntanos tu proyecto...',
        submit: 'Enviar consulta',
        submitting: 'Enviando...',
        success: '¡Gracias! Hemos recibido tu consulta.',
        error: 'Ha ocurrido un error al enviar el formulario. Por favor, inténtalo de nuevo.',
        technicians: 'técnicos',
        commercials: 'comerciales',
        contactSoon: 'Uno de nuestros {role} se pondrá en contacto contigo pronto.'
    },
    ca: {
        companyName: 'Nom empresa',
        companyPlaceholder: 'La teva empresa',
        contactName: 'Persona de contacte',
        namePlaceholder: 'El teu nom',
        email: 'Email de contacte',
        emailPlaceholder: 'nom@empresa.com',
        phone: 'Tel de contacte',
        messageLabel: 'En què et podem ajudar?',
        messagePlaceholderSupport: 'Descriu la teva incidència el més detalladament possible...',
        messagePlaceholderCommercial: 'Explica\'ns el teu projecte...',
        submit: 'Enviar consulta',
        submitting: 'Enviant...',
        success: 'Gràcies! Hem rebut la teva consulta.',
        error: 'Hi ha hagut un error en enviar el formulari. Si us plau, torna-ho a provar.',
        technicians: 'tècnics',
        commercials: 'comercials',
        contactSoon: 'Un dels nostres {role} es posarà en contacte amb tu aviat.'
    },
    en: {
        companyName: 'Company Name',
        companyPlaceholder: 'Your company',
        contactName: 'Contact Person',
        namePlaceholder: 'Your name',
        email: 'Contact Email',
        emailPlaceholder: 'name@company.com',
        phone: 'Contact Phone',
        messageLabel: 'How can we help you?',
        messagePlaceholderSupport: 'Describe your issue in as much detail as possible...',
        messagePlaceholderCommercial: 'Tell us about your project...',
        submit: 'Send inquiry',
        submitting: 'Sending...',
        success: 'Thank you! We have received your inquiry.',
        error: 'An error occurred while sending the form. Please try again.',
        technicians: 'technicians',
        commercials: 'sales representatives',
        contactSoon: 'One of our {role} will contact you soon.'
    }
};

const t = computed(() => translations[props.language] || translations['es']);

const form = reactive({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    message: ''
});

const messagePlaceholder = computed(() => {
    return props.type === 'support'
        ? t.value.messagePlaceholderSupport
        : t.value.messagePlaceholderCommercial;
});

const successMessageDetails = computed(() => {
    const role = props.type === 'support' ? t.value.technicians : t.value.commercials;
    return t.value.contactSoon.replace('{role}', role);
});

const isSubmitting = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

const emit = defineEmits(['success']);

const handleSubmit = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        const url = 'https://www.asmtch.com/wp-json/bot-relay/v1/send';

        let department = 'info';
        if (props.type === 'commercial') {
            department = 'info';
        } else if (props.type === 'support') {
            department = 'servicedesk';
        }

        const payload = {
            department: department,
            ...form
        };

        console.log('Sending email to:', url);
        console.log('Payload:', payload);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Error al enviar el formulario');
        }

        const result = await response.json();
        console.log(`--- ${props.type.toUpperCase()} FORM DATA SENT ---`, result);

        // Emit success instead of setting submitted locally
        const successMsg = `${t.value.success}<br>${successMessageDetails.value}`;
        console.log('Emitting success event:', successMsg);
        emit('success', successMsg);

    } catch (error) {
        console.error('Error submitting form:', error);
        errorMessage.value = t.value.error;
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.commercial-form {
    background-color: transparent;
    padding: 10px 0 0 0;
    border-radius: 0;
    margin-top: 10px;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #555;
    text-align: left;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--primary-color, #ff0066);
    outline: none;
}

.submit-btn {
    background-color: var(--primary-color, #ff0066);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;
    transition: opacity 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.success-message {
    text-align: center;
    color: #000000;
    padding: 20px 0;
}

.error-message {
    color: #ff3b30;
    font-size: 12px;
    margin-top: 10px;
    text-align: center;
    font-weight: 500;
}

/* Loading Animation */
.typing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background-color: #ffffff;
    border-radius: 50%;
    margin: 0 3px;
    animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}
</style>
