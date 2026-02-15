import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import multer from 'multer';
import fs from 'fs';
import User from './models/User';
import Message from './models/Message';
import Group from './models/Group';
import setupSocket from './socket';
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 6011;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5011', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5011' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../', UPLOAD_DIR)));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

app.get('/api/groups', async (_req, res) => {
  try {
    const groups = await Group.find().populate('members', 'username avatar isOnline').sort({ updatedAt: -1 });
    res.json(groups);
  } catch {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, memberUsernames } = req.body;
    const members = await User.find({ username: { $in: memberUsernames || [] } });
    const group = await Group.create({ name, members: members.map((m) => m._id) });
    res.status(201).json(group);
  } catch {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.find().select('username avatar isOnline lastSeen');
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'WhisperNet' }));

setupSocket(io);

async function start() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whispernet';
  await mongoose.connect(uri);
  console.log('WhisperNet connected to MongoDB');
  server.listen(PORT, () => console.log(`WhisperNet running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start WhisperNet:', err);
  process.exit(1);
});
