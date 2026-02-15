import type { Server, Socket } from 'socket.io';
import User from './models/User';
import Message from './models/Message';

interface OnlineUser {
  _id: { toString(): string };
  isOnline: boolean;
  lastSeen: Date;
  socketId: string | null;
  save(): Promise<unknown>;
}

interface MessagePayload {
  roomId: string;
  content: string;
  type?: string;
  file?: unknown;
}

const onlineUsers = new Map<string, string>();

function setupSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentUser: OnlineUser | null = null;

    socket.on('user:join', async ({ username }: { username: string }) => {
      if (!username?.trim()) return;

      let user = await User.findOne({ username: username.trim() });
      if (!user) {
        user = await User.create({
          username: username.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        });
      }

      user.isOnline = true;
      user.socketId = socket.id;
      user.lastSeen = new Date();
      await user.save();

      currentUser = user as unknown as OnlineUser;
      onlineUsers.set(user._id.toString(), socket.id);
      socket.join(`user:${user._id}`);

      io.emit('users:online', await getOnlineUsers());
      socket.emit('user:joined', user);
    });

    socket.on('room:join', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('room:leave', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('typing:start', ({ roomId, username: u }: { roomId: string; username: string }) => {
      socket.to(roomId).emit('typing:start', { roomId, username: u });
    });

    socket.on('typing:stop', ({ roomId, username: u }: { roomId: string; username: string }) => {
      socket.to(roomId).emit('typing:stop', { roomId, username: u });
    });

    socket.on('message:send', async (data: MessagePayload) => {
      if (!currentUser) return;

      const message = await Message.create({
        roomId: data.roomId,
        sender: currentUser._id,
        content: data.content,
        type: data.type || 'text',
        file: data.file || undefined,
      });

      const populated = await Message.findById(message._id).populate('sender', 'username avatar');
      io.to(data.roomId).emit('message:new', populated);
    });

    socket.on('disconnect', async () => {
      if (currentUser) {
        currentUser.isOnline = false;
        currentUser.lastSeen = new Date();
        currentUser.socketId = null;
        await currentUser.save();
        onlineUsers.delete(currentUser._id.toString());
        io.emit('users:online', await getOnlineUsers());
      }
    });
  });
}

async function getOnlineUsers() {
  return User.find({ isOnline: true }).select('username avatar _id');
}

export default setupSocket;
