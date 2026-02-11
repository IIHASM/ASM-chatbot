# Chat Widget (Conversation Mode)

Vue 3 widget for chat interfaces with persistent conversation ID, multilingual support, and email integration via SMTP2GO.

## ✨ Features

- **Persistent Identity**: Stores user identity via cookie (`chat_uid`).
- **Multilingual**: Supports Spanish (es), Catalan (ca), and English (en).
- **Email Integration**: Sends contact forms using SMTP2GO via a Node.js backend.
- **Embeddable**: Can be used on any website via a simple script tag.
- **Responsive**: Mobile-friendly design with smooth animations.

---

## 🚀 Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd chatbot-asm
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    - Rename `.env.example` to `.env`.
    - Fill in your SMTP2GO credentials:
      ```env
      SMTP_HOST=mail.smtp2go.com
      SMTP_PORT=2525
      SMTP_USER=your_smtp2go_username
      SMTP_PASS=your_smtp2go_password
      ```

---

## 🛠️ Development

To run the project locally, you need to start **both** the backend and the frontend.

1.  **Start the Backend** (handles emails):
    ```bash
    # Terminal 1
    node server.js
    ```
    Runs on `http://localhost:3002`.

2.  **Start the Frontend** (UI development):
    ```bash
    # Terminal 2
    npm run dev
    ```
    Runs on `http://localhost:5173` (proxies API requests to port 3002).

---

## 🏗️ Production Build

To generate the files for embedding on a website:

```bash
npm run build
```

This will create a `dist/` folder containing:
- `chat-widget.standalone.iife.js`: The main script bundle (includes Vue).
- `style.css`: The widget styles.

---

## 🌐 Deployment & Embedding

### 1. Build the Project
First, generate the production-ready files:

```bash
npm run build
```

This creates a `dist/` folder with:
- `chat-widget.standalone.iife.js`: The self-contained widget script.
- `style.css`: The widget styles.

### 2. Host the Backend & Files
You need a server (VPS, Heroku, etc.) to:
1.  **Run the Backend**:
    - Upload `server.js` and `package.json`.
    - Run `npm install --production`.
    - Start the server: `node server.js` (or use PM2: `pm2 start server.js`).
    - ensure it's accessible via a public URL (e.g., `https://api.yourdomain.com`).

2.  **Host the Static Files**:
    - Upload the `dist/` folder to your web server or CDN.
    - Ensure `chat-widget.standalone.iife.js` and `style.css` are accessible via URL.

### 3. Embed on Your Website (HTML)
Add this code to your website's HTML (inside `<body>` or `<head>`):

```html
<!-- 1. Load the CSS -->
<link rel="stylesheet" href="https://yourdomain.com/dist/style.css">

<!-- 2. Load the Widget Script -->
<script src="https://yourdomain.com/dist/chat-widget.standalone.iife.js"></script>

<!-- 3. Initialize the Widget -->
<script>
  window.onload = function() {
    if (window.ChatWidget) {
      window.ChatWidget.init({
        // REQUIRED: The URL where your server.js is running
        backend: 'https://api.yourdomain.com',

        // OPTIONAL: Override default options if needed
        automatedOptions: {
           es: [ { label: 'Ayuda', answer: '...' } ]
        }
      });
    }
  };
</script>
```

npm start

### Configuration Options (`init`)

| Option | Type | Description |
| :--- | :--- | :--- |
| `backend` | String | **Required**. URL of your backend server (e.g., `https://api.yourdomain.com`). |
| `project` | String | (Optional) Client UUID for loading specific config. |
| `chatLogoUrl`| String | (Optional) URL for a custom chat logo. |
| `automatedOptions` | Object | (Optional) Override default questions/answers. Keyed by language (`es`, `ca`, `en`). |

---

## 📂 Project Structure

- `src/ChatWidget.vue`: Main chat component.
- `src/ChatForm.vue`: Contact form component.
- `server.js`: Node.js/Fastify backend for handling emails.
- `src/mount.js`: Entry point for the standalone build.
- `vite.config.js`: Vite configuration (proxy, build settings).