# LiveHub — Assignment TODO List

This list tracks the pending tasks required to build out the backend services, integrate video/audio streaming, and connect the mobile client to complete **Phase 1** and **Phase 2** of the assignment.

---

## 🖥️ 1. Backend Server Setup
Create a new Node.js/Express server (e.g., in a `/backend` directory) using **Prisma** and **Neon DB**.

- [x] **1.1. Initialize Project**
  - [x] Run `npm init` and configure Express + TypeScript + Socket.IO.
  - [x] Add `@livekit/server-sdk` to manage token generation.
- [x] **1.2. Database & Data Models**
  - [x] Set up Neon DB connection in `.env`.
  - [x] Create schemas/models for Users, Streams (rooms), and Chat Messages in `prisma/schema.prisma`.
- [x] **1.3. REST Authentication API**
  - [x] `POST /auth/login` — Sign JWT token, accept role selection, return user metadata.
- [x] **1.4. REST Stream Management API**
  - [x] `POST /streams/start` — Creator goes live: generate unique room name, create LiveKit room, generate token.
  - [x] `GET /streams` — Viewers browse: list active rooms with started status.
  - [x] `GET /streams/:id` — Fetch details for a specific active stream.
  - [x] `POST /streams/end` — Creator ends stream: mark room inactive.
- [x] **1.5. REST Chat API**
  - [x] `GET /chat/:streamId` — Fetch chat message history for room.
  - [x] `POST /chat` — Send chat message (used for offline synchronization).
- [x] **1.6. Socket.IO Server & Broadcasts**
  - [x] Listen for connection authentication with client JWT.
  - [x] `join-stream` — Join room, increment viewer count, broadcast updated count to room.
  - [x] `leave-stream` — Leave room, decrement viewer count, broadcast updated count to room.
  - [x] `send-message` — Broadcast new chat message to all room sockets.
  - [x] `end-stream` — Broadcast stream ended event to viewers in room.
- [x] **1.7. Chat Message Deduplication (Phase 2)**
  - [x] Store `uuid` and `deviceId` with every chat message.
  - [x] In `POST /chat` and socket `send-message` handler, verify if `uuid` already exists. If yes, skip DB insert/broadcast to prevent duplicate postings.

---

## 📽️ 2. Live Video & Streaming Integration (Mobile)
Integrate real-time video/audio streaming using the LiveKit React Native SDK.

- [x] **2.1. Install LiveKit SDKs**
  - [x] Installed `@livekit/react-native` and `@livekit/react-native-webrtc`.
  - [x] Configured native setup (Android permissions and iOS camera/mic description strings in `app.json` + registered config plugin).
- [x] **2.2. Integrate Creator Video Publisher**
  - [x] Opened `mobile/app/creator/live.tsx`.
  - [x] Replaced dummy camera placeholder with the `<LiveKitRoom>` and `<VideoView>` components.
  - [x] Used `useLocalParticipant` to resolve local camera video publication tracks.
- [x] **2.3. Integrate Viewer Video Player**
  - [x] Opened `mobile/app/stream/[id].tsx`.
  - [x] Replaced static thumbnail `<Image>` with `<LiveKitRoom>` subscriber playback and remote `<VideoView>` rendering remote participant tracks.

---

## 🔌 3. Mobile Networking Integration (Mobile)
Replace mock client services with real REST/Socket network requests.

- [x] **3.1. Configure Environment**
  - [x] Set `BASE_URL` (REST) and `SOCKET_URL` (WebSockets) in `mobile/constants/config.ts` to point to backend server (localhost:3000).
- [x] **3.2. Implement Real apiService.ts**
  - [x] Replaced mock functions in `mobile/services/apiService.ts` with real `fetch()` calls.
- [x] **3.3. Implement Real socketService.ts**
  - [x] Replaced mock interval events with real `socket.io-client` socket listeners (`on`, `emit`).
- [x] **3.4. Update Offline Queue Sync**
  - [x] Verified `sync()` inside `mobile/services/offlineQueue.ts` routes requests to the real API endpoints.
