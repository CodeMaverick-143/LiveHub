# LiveHub — Real-Time Live Event Broadcasting Platform

MVP built with React Native (Expo) + TypeScript.

## Demo

[Watch the Demo Video](https://drive.google.com/file/d/1CVax-ELf2DwP9T9jpAdtJSGfjTIFOwKD/view?usp=sharing)

## Architecture

```
Data Layer        →  services/     (API calls, Socket, Offline Queue)
State Layer       →  store/        (Zustand stores)
Logic Layer       →  hooks/        (React Query + custom hooks)
UI Layer          →  components/   (Reusable, typed)
Screens           →  app/          (Expo Router pages)
```

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | React Native + Expo SDK       |
| Navigation | Expo Router (file-based)      |
| State      | Zustand                       |
| Data       | TanStack React Query          |
| Offline    | AsyncStorage + NetInfo        |
| Real-time  | Socket.IO (mocked in MVP)     |
| Streaming  | LiveKit Cloud (mocked in MVP) |
| Forms      | React Hook Form               |
| Animations | React Native Reanimated       |

## Screens

### Authentication

- `/login` — Role selection (Creator / Viewer) + mock login

### Viewer Flow

- `/(tabs)` — Browse live streams with search + category filter
- `/stream/[id]` — Full-screen watch view + live chat

### Creator Flow

- `/(tabs)/creator` — Creator dashboard + start stream
- `/creator/live` — Live stream management (mic/cam controls, end stream, chat)

### Shared

- `/(tabs)/profile` — User stats + logout

## Phase 1 Features (Implemented)

- [x] Login with role selection (Creator / Viewer)
- [x] Browse live streams list
- [x] Category filter + search
- [x] Join stream + watch
- [x] Real-time chat (send/receive)
- [x] Live viewer count (simulated)
- [x] Creator: Start stream
- [x] Creator: Manage live (mic/cam toggle, end stream)
- [x] Creator: Read + respond to live chat
- [x] Loading skeletons
- [x] Toast notifications
- [x] Empty states
- [x] Offline message queue foundation (Phase 2)

## Phase 2 Features (Implemented)

- [x] `offlineQueue.ts` — AsyncStorage-backed queue
- [x] `useOfflineQueue.ts` — NetInfo listener + auto-sync
- [x] Pending message state in ChatBubble
- [x] UUID + deviceId per message for deduplication

## Replacing Mocks with Real Backend

### 1. REST API

Edit `services/apiService.ts` → replace `delay()` mock functions with real `fetch()` calls to your Express backend at `Config.BASE_URL`.

### 2. Socket.IO

Edit `services/socketService.ts` → replace mock interval logic with real `socket.io-client` connection to `Config.SOCKET_URL`.

```typescript
import { io } from "socket.io-client";
const socket = io(Config.SOCKET_URL, { auth: { token } });
```

### 3. LiveKit Video

In `app/creator/live.tsx` → replace the camera placeholder view with LiveKit React Native SDK's `<VideoView>` using the `livekitToken` from `startStreamApi()`.

## Backend API Contract

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| POST   | /auth/login     | Login             |
| GET    | /streams        | List live streams |
| GET    | /streams/:id    | Get stream detail |
| POST   | /streams/start  | Creator: go live  |
| POST   | /streams/end    | Creator: end      |
| GET    | /chat/:streamId | Chat history      |
| POST   | /chat           | Send message      |

## Socket.IO Events

| Direction     | Event           | Payload                            |
| ------------- | --------------- | ---------------------------------- |
| Client→Server | join-stream     | `{ streamId, userId }`             |
| Client→Server | leave-stream    | `{ streamId, userId }`             |
| Client→Server | send-message    | `{ streamId, message, uuid, ... }` |
| Client→Server | start-stream    | `{ creatorId, title }`             |
| Client→Server | end-stream      | `{ streamId, creatorId }`          |
| Server→Client | viewer-count    | `{ streamId, count }`              |
| Server→Client | receive-message | `ChatMessage`                      |
| Server→Client | stream-started  | `{ streamId }`                     |
| Server→Client | stream-ended    | `{ streamId }`                     |

## Demo Credentials

Any username + password (min 4 chars) works in demo mode.

- Creator: Select "Creator" role → access Go Live tab
- Viewer: Select "Viewer" role → browse and watch streams
