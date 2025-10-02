# Chat Widget (Conversation Mode)

Vue 3 widget for chat interfaces with persistent conversation ID.

## Features

- Stores user identity via cookie (`chat_uid`)
- Sends `conversationId`, `authorId` and `authorType`
- Works with a backend that supports threaded conversations

## Usage

```js
<script src="chat-widget.js" data-backend="https://your.api/message"></script>
```

If `CHAT_WIDGET_CONFIG.userId` is defined globally, it will be sent as `authorId`.

## Development

```bash
npm install
npm run dev
```
