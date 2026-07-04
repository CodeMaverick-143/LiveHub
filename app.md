# LiveHub Application Architecture & Workings

LiveHub is a next-generation real-time live streaming platform that allows creators to broadcast video, interact with viewers via live chat, and manage stream sessions with offline resilience.

---

## 1. Technology Stack

### Frontend (Mobile App)
- **Framework**: Expo / React Native (TypeScript)
- **State Management**: Zustand (for auth, active stream state, and duration tracking)
- **Network & Caching**: TanStack React Query (for api endpoints caching)
- **Real-Time Layer**: Socket.io-client (for chat messages, live viewer counts, and stream state events)
- **Routing**: Expo Router (file-based navigation)
- **Video Processing**: LiveKit React Native SDK (WebRTC for real video publishing and rendering)

### Backend (API & Socket Server)
- **Runtime**: Node.js with Express (TypeScript)
- **Database Engine**: PostgreSQL or SQLite (managed via Prisma ORM)
- **Real-Time Engine**: Socket.io (handling room-based socket subscriptions)
- **Video Engine**: LiveKit Server SDK (generating secure access tokens for publisher/viewer roles)

---

## 2. Core Workflows & Logic

### 2.1 Starting a Stream (Creator)
1. The creator enters a title and clicks **Go Live**.
2. A POST request is sent to `/streams/start`.
3. The backend generates a unique `roomName`, queries LiveKit to create/verify the WebRTC room, and generates a publisher `livekitToken` with join and publish permissions.
4. The database creates a `Stream` record with status `live`.
5. The mobile client updates the Zustand `streamStore` with `activeStream` details and navigates the creator to the `creator/live` screen.

### 2.2 Watching a Stream (Viewer)
1. The viewer selects an active stream from the dashboard list.
2. The viewer navigates to `/stream/[id]`.
3. The screen fetches the stream detail including a viewer-role `livekitToken` (with read-only permissions).
4. The LiveKit room initializes, connects to the server, and renders the creator's video track in real-time.

### 2.3 Real-Time Chat & Message Deduplication
1. When entering a stream screen (creator or viewer), the `useChat` hook initiates:
   - Calls `socketService.connect()` to initialize the Socket.io connection.
   - Emits `join-stream` containing the `streamId` to join the room on the backend.
2. When a user types a message and clicks **Send**:
   - The message is immediately appended to the local messages list **optimistically** with a client-generated UUID as the key (`id: uuid`, `pending: true`).
   - The message is POSTed to the backend `/chat` endpoint.
   - The backend saves the message in the database and broadcasts `receive-message` to all sockets in the room.
3. To avoid double-rendering when the sender receives its own broadcast:
   - The hook's `handleMessage` checks if the message's `id` or `uuid` already exists.
   - If a match is found, the optimistic item is updated with the backend-assigned database ID (`id: db-uuid`) and marked as `synced: true, pending: false`, rather than appending a duplicate entry.

### 2.4 Offline Queueing & Syncing
If a viewer sends a message while offline:
1. The message is queued locally in the `OfflineQueueService`.
2. Once connection is restored, the queue syncs all pending messages to the backend in sequence, marking them as synced.

### 2.5 Ending a Stream
1. The creator clicks **End Stream**, which POSTs to `/streams/end`.
2. The backend updates the stream's status to `ended`, updates `endedAt`, and resets `viewerCount` to `0`.
3. The backend broadcasts a `stream-ended` socket event to all clients in the stream's room.
4. Viewers' clients receive the `stream-ended` event, display a "Stream has ended" overlay, and automatically redirect back to the home screen after a 3-second delay.

---

## 3. Database Schema

### Stream
- `id` (UUID, Primary Key)
- `creatorId` (String, User Relation)
- `creatorName` (String)
- `title` (String)
- `roomName` (String)
- `livekitRoom` (String)
- `status` (String, e.g., "live", "ended")
- `viewerCount` (Integer)
- `startedAt` (DateTime)
- `endedAt` (DateTime, Optional)
- `category` (String)

### ChatMessage
- `id` (UUID, Primary Key)
- `uuid` (String, Unique Client Identifier)
- `deviceId` (String, Optional)
- `streamId` (String, Stream Relation)
- `senderId` (String)
- `senderName` (String)
- `message` (String)
- `createdAt` (DateTime)
