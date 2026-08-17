# Voxa - Instant Live Video Chat Application

Voxa is a production-quality, original random live video chat web application engineered for instant face-to-face connections. Built with **React 18, TypeScript, Vite, Tailwind CSS, Node.js, Express, Socket.IO, Redis, and WebRTC**, Voxa pairs online users in sub-50ms latency with zero registrations or complicated menus.

---

## 🌟 Key Features

- **Instant Matchmaking**: High-speed queue engine backed by Redis with zero database query bottlenecks.
- **True WebRTC Video**: Direct peer-to-peer encrypted video/audio streaming using browser native `getUserMedia` and `RTCPeerConnection`.
- **Perfect Negotiation Pattern**: Implements polite/impolite WebRTC signaling to eliminate SDP offer collisions and state errors (`Failed to set remote answer SDP`, etc.).
- **Ultra-Fast NEXT Button**: Instant peer disconnection and queue re-entry without page reload or media re-prompting.
- **Safety & Moderation**: Integrated user report modal (reasons: inappropriate conduct, harassment, nudity, hate speech, spam) and permanent blocklist.
- **Original UI/UX Aesthetics**: Custom "Digital Social Lounge" aesthetic with dark slate colors, glassmorphism cards, glowing pulse indicators, floating PiP local video preview, and responsive touch controls.
- **Resilient Fallback**: Automatic in-memory matchmaking queue fallback for local development when a local Redis service is inactive.

---

## 🏗️ Architecture

```
                                  ┌─────────────────────────────┐
                                  │   Browser Client A (React)  │
                                  └──────────────┬──────────────┘
                                                 │  WebSockets (Signaling) & STUN/TURN
                                                 ▼
┌─────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────┐
│ Browser Client B (React)├─────►│  Node.js + Express +        ├─────►│ Redis / In-Memory       │
└─────────────────────────┘      │  Socket.IO Server           │      │ Matchmaking Queue       │
             ▲                   └──────────────┬──────────────┘      └─────────────────────────┘
             │                                  │
             └──────────────────────────────────┘
                 Peer-to-Peer WebRTC Audio/Video
```

---

## 📁 Repository Structure

```
project-videochat-app/
├── client/                      # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Navbar, VideoControls, RemoteVideo, LocalVideo, etc.
│   │   ├── hooks/               # useWebRTC, useMediaStream, useMatchmaking, useSocket
│   │   ├── pages/               # Home, VideoChat, Safety, Privacy
│   │   ├── services/            # Socket.IO & WebRTC services
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # WebRTC STUN/TURN config
│   ├── Dockerfile
│   └── vite.config.ts
│
├── server/                      # Node.js + Express + Socket.IO + Redis
│   ├── src/
│   │   ├── config/              # Environment configurations
│   │   ├── middleware/          # Security (Helmet, CORS) & Rate Limiting
│   │   ├── routes/              # REST Endpoints (/api/reports)
│   │   ├── services/            # Matchmaking, Room, Redis & In-Memory Fallback
│   │   ├── sockets/             # Matchmaking & Signaling handlers
│   │   ├── types/               # Server event types
│   │   └── utils/               # Clean structured logger
│   └── Dockerfile
│
├── docker-compose.yml           # Production Docker multi-container orchestration
├── .env.example                 # Example environment variables
├── package.json                 # Workspace scripts
└── README.md
```

---

## 🛠️ Quick Start & Local Setup

### Prerequisites

- Node.js `v18+` or `v20+`
- npm `v9+`
- (Optional) Redis server (if Redis is not running locally, Voxa automatically uses its high-performance in-memory queue fallback)

### Step 1: Install Dependencies

From the workspace root directory:

```bash
npm run install:all
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 3: Run Development Server

To launch both the backend server (`http://localhost:5000`) and the React client (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

---

## 🧪 Testing with Two Browsers

Voxa is designed for easy dual-browser testing:

1. Open **Chrome Window 1**: Navigate to `http://localhost:5173`.
2. Open **Chrome Window 2** (or Incognito / Firefox / Edge): Navigate to `http://localhost:5173`.
3. Click **START VIDEO CHAT** on Window 1 and grant camera/mic permissions.
4. Click **START VIDEO CHAT** on Window 2 and grant camera/mic permissions.
5. Both windows will automatically match within milliseconds:
   - Window 1 displays Window 2's live video stream.
   - Window 2 displays Window 1's live video stream.
6. Click **NEXT** on Window 1:
   - Window 1 immediately disconnects, tears down WebRTC, and re-enters `SEARCHING` state.
   - Window 2 receives a `PARTNER LEFT` state with a 1-click `NEXT PERSON` prompt.

---

## 🐳 Docker Deployment

To launch Voxa with Redis, Server, and Client containers in production mode:

```bash
docker-compose up --build -d
```

Access the application at `http://localhost:5173`.

---

## 🔒 Security & Privacy

- **No Media Recording**: Video and audio streams are strictly P2P through WebRTC. Zero video data passes through or is saved on Node.js servers.
- **IP Rate Limiting**: Abuse prevention with Express rate limiting and Socket event throttling.
- **Security Headers**: Hardened with Helmet security headers and CORS origin restrictions.
- **Reporting & Blocking**: Instant socket blocklists prevent matched peers from reconnecting.
# voxa-video-chat-
