# LiveHub — Pending Launch & Verification Tasks 🚀

To fully run, test, and complete the Real-Time Live Event Broadcasting assignment (Phase 1 & Phase 2), execute the following configuration and deployment steps on your local system:

---

## 🔌 1. Backend Environment Configurations
Update the database connection details and keys:
- [x] Open the [backend/.env](file:///Users/yaannko/Desktop/internship/LiveHub/backend/.env) file.
- [x] Replace `DATABASE_URL` with your live **Neon DB (PostgreSQL)** connection string.
- [x] If using a live **LiveKit** account, replace the following keys:
  - `LIVEKIT_URL` (e.g. `wss://your-project.livekit.cloud`)
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`
  > [!NOTE]
  > If LiveKit keys are left blank, the backend will gracefully fall back to generating secure mock tokens, allowing full development sandbox testing.

---

## 🗄️ 2. Database Schema Initialization
Sync your PostgreSQL database with the defined schema models:
- [x] Open a terminal in the `/backend` directory.
- [x] Install dependencies:
  ```bash
  npm install
  ```
- [x] Push the Prisma schema to Neon DB:
  ```bash
  npx prisma db push
  ```
  This creates the `User`, `Stream`, and `ChatMessage` tables on Neon DB automatically.

---

## 🌐 3. Mobile Device Network Configuration
Ensure the mobile app can reach the local server:
- [ ] If testing on a **physical device** (iOS/Android) instead of a simulator, determine your computer's local IP address (e.g., `192.168.1.50`).
- [ ] Open [mobile/constants/config.ts](file:///Users/yaannko/Desktop/internship/LiveHub/mobile/constants/config.ts).
- [ ] Swap `localhost` with your local IP address for both endpoints:
  - `BASE_URL`: `http://192.168.1.50:3000`
  - `SOCKET_URL`: `http://192.168.1.50:3000`

---

## 🏃 4. Launching the Services

### Start the Backend Server
- [ ] From the `/backend` directory, run:
  ```bash
  npm run dev
  ```
  The server starts listening on `http://localhost:3000` and initializes Socket.IO.

### Start the Mobile Client
- [ ] From the `/mobile` directory, run:
  ```bash
  npx expo start
  ```
- [ ] Open the app in iOS/Android simulator or via the Expo Go app.

---

## 🧪 5. Manual Testing Verification Loop
Follow this flow to verify all features:
- [ ] **Login & Auto-registration**: Enter a username and password. On the first login, the user will be auto-created in Postgres and logged in.
- [ ] **Creator Session**: Toggle the camera, enter a stream title, and click **Start Broadcast** to spin up the LiveKit room.
- [ ] **Viewer Playback**: Log in on a second device or simulator as a viewer, click the active stream in the Browse feed, and verify that the viewer connects successfully, increments the live viewer count, and shows system messages in the chat window.
- [ ] **Offline Chat Sync**: Set your emulator to airplane mode (offline), submit a chat message, verify it shows an "offline/pending" icon, go back online, and verify it automatically pushes the message to the database and broadcasts it in real-time.
