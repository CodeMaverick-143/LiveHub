import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

import { login } from './controllers/authController';
import {
  startStream,
  listStreams,
  getStreamDetail,
  endStream,
  setStreamIo,
} from './controllers/streamController';
import {
  fetchChatHistory,
  sendChatMessage,
  setChatIo,
} from './controllers/chatController';
import { registerSocketHandlers } from './sockets/socketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


app.post('/auth/login', login);

app.get('/streams', listStreams);
app.get('/streams/:id', getStreamDetail);
app.post('/streams/start', startStream);
app.post('/streams/end', endStream);

app.get('/chat/:streamId', fetchChatHistory);
app.post('/chat', sendChatMessage);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});


setStreamIo(io);
setChatIo(io);


registerSocketHandlers(io);


server.listen(PORT, () => {
  console.log(`LiveHub Backend running on port ${PORT}`);
});
