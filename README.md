# 🗨️ ChatApp - Telegram-like Real-time Chat PWA

A full-featured, production-ready chat application built with **Vue.js 3** + **Laravel Reverb** (WebSockets). Telegram-inspired UI with amber/warm color palette.

---

## ✨ Features

### 💬 Messaging
- **Real-time messaging** via Laravel Reverb WebSockets
- **Text, Image, Video, Audio, File** message support (up to 10MB)
- **Reply to specific messages** (swipe on mobile)
- **Edit & Delete** your messages
- **Message reactions** with emoji (👍 ❤️ 😂 😮 😢 👏)
- **Read receipts** with double checkmark
- **Copy message** content

### 🏠 Conversations
- **Private** 1-on-1 chats
- **Group chats** with admin controls
- Create group with avatar, name, description
- Add/remove members, promote to admin
- Mute & Archive conversations
- Real-time last message preview
- Unread message count badges
- Right-click context menu on conversations

### 👤 Users & Presence
- **Online/Away/Offline** status with colored dots
- **Typing indicators** in both chat list AND inbox
- Last seen timestamps
- User search & discovery
- Heartbeat system for presence

### 🎨 UI/UX
- **Amber/warm color theme** (#F8D299 + #F5A151)
- **Dark/Light mode** toggle
- Smooth animations & micro-interactions
- **Fully mobile responsive** (iOS/Android PWA ready)
- Conversation date separators
- Infinite scroll (load older messages)
- Media viewer (fullscreen image/video)
- In-chat message search

### 🔔 Notifications
- **Message sound effects** (Web Audio API)
- Toggleable sounds from profile settings
- **PWA push notification** ready
- Unread count in browser tab title

### 📱 PWA
- Installable on iOS & Android
- Works offline (cached assets)
- App-like fullscreen experience
- Service worker with Workbox

---

## 📁 Project Structure

```
src/
├── main.js                    # App entry point
├── App.vue                    # Root component + PWA banner
├── style.css                  # Global styles + Tailwind
├── router/
│   └── index.js               # Routes (login, register, chat)
├── stores/
│   ├── auth.js                # Authentication state (Pinia)
│   ├── chat.js                # Conversations & messages state
│   └── theme.js               # Dark/light theme state
├── services/
│   ├── api.js                 # Axios API service (all endpoints)
│   ├── echo.js                # Laravel Echo / Reverb WebSocket
│   └── sound.js               # Web Audio API sound effects
├── utils/
│   └── helpers.js             # Date formatting, file helpers, etc.
├── views/
│   ├── LoginView.vue          # Login page
│   ├── RegisterView.vue       # Registration page
│   ├── ChatView.vue           # Main chat layout
│   └── ProfileView.vue        # Profile page
└── components/
    ├── chat/
    │   ├── ConversationItem.vue    # Sidebar chat list item
    │   ├── ChatWindow.vue          # Main chat area (header + messages + input)
    │   ├── MessageBubble.vue       # Individual message bubble
    │   └── ConversationContextMenu.vue  # Right-click menu
    ├── modals/
    │   ├── NewChatModal.vue        # Start chat / create group
    │   ├── ProfileModal.vue        # User profile & settings
    │   └── ConversationInfoModal.vue    # Group/contact info
    └── ui/
        ├── MediaViewer.vue         # Fullscreen media viewer
        └── ConfirmDialog.vue       # Delete confirmation dialog
```

---

## 🚀 Setup

### 1. Clone & Install

```bash
# Clone
git clone <repo>
cd chatapp

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://your-laravel-api.com/api/v1
VITE_REVERB_APP_KEY=your-reverb-key
VITE_REVERB_HOST=your-reverb-host
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### 3. Laravel Backend Setup

In your Laravel `.env`:
```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=chatapp
REVERB_APP_KEY=chatapp-key
REVERB_APP_SECRET=chatapp-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

Run Reverb:
```bash
php artisan reverb:start
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production (PWA)

```bash
npm run build
```

---

## 🌐 API Endpoints Used

All endpoints are prefixed with `/api/v1/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| GET/POST | `/profile` | View/update profile |
| POST | `/profile/status` | Update online status |
| GET | `/users` | List all users |
| GET | `/users/search?query=` | Search users |
| GET | `/conversations` | List conversations |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/{id}/messages` | Get messages |
| POST | `/messages` | Send message |
| PUT | `/messages/{id}` | Edit message |
| DELETE | `/messages/{id}` | Delete message |
| POST | `/messages/mark-as-read` | Mark as read |
| POST | `/messages/{id}/reaction` | Toggle reaction |
| POST | `/conversations/{id}/typing` | Typing indicator |

---

## 📡 WebSocket Events

Events via Laravel Reverb on `conversation.{id}` presence channel:

| Event | Description |
|-------|-------------|
| `message.sent` | New message received |
| `message.updated` | Message edited |
| `message.deleted` | Message deleted |
| `message.read` | Messages marked as read |
| `message.reaction` | Reaction toggled |
| `user.typing` | Typing indicator |

User status on public `users` channel:
| Event | Description |
|-------|-------------|
| `user.status.changed` | User online/offline status |

---

## 🎨 Color Palette

| Variable | Value | Use |
|----------|-------|-----|
| `--primary` | `#F5A151` | Buttons, accents |
| `--primary-light` | `#F8D299` | Message bubbles (outgoing) |
| `--primary-dark` | `#e07a1f` | Hover states |

---

## 📱 PWA Icons

Generate PWA icons and place in `/public/`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png`
- `favicon.svg`

Use tools like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator).

---

## 🔧 Tech Stack

- **Vue 3** (Composition API)
- **Pinia** (State management)
- **Vue Router 4**
- **Tailwind CSS 3** (Custom config with warm palette)
- **Axios** (HTTP client)
- **Laravel Echo + Pusher.js** (WebSocket client)
- **Vite** + **vite-plugin-pwa** (Build + PWA)
- **Web Audio API** (Message sounds)
- **emoji-picker-element** (Emoji selection)
- **dayjs** (Date formatting)

---

## 🤝 Contributing

Pull requests welcome! Please follow the existing code style.

---

## 📄 License

MIT
