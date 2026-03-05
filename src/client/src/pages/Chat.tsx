import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import socket, { fetchGroups, fetchMessages, uploadFile, createGroup, type UploadResult } from '../api';
import { useAuth } from '../context/AuthContext';
import type { ChatRoom, Message, User } from '../types';
import {
  Send, Paperclip, Users, Circle, Search, Plus, X,
} from 'lucide-react';

const DEFAULT_ROOMS = [
  { _id: 'general', name: 'General', isGroup: true, roomId: 'general' },
  { _id: 'random', name: 'Random', isGroup: true, roomId: 'random' },
  { _id: 'dev-team', name: 'Dev Team', isGroup: true, roomId: 'dev-team' },
];

function dmRoomId(a: string, b: string) {
  return ['dm', ...[a, b].sort()].join(':');
}

export default function Chat() {
  const { user, username, setUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<ChatRoom[]>(DEFAULT_ROOMS);
  const [activeRoom, setActiveRoom] = useState<ChatRoom>(DEFAULT_ROOMS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRoomIdRef = useRef(activeRoom.roomId);
  activeRoomIdRef.current = activeRoom.roomId;

  const displayName = user?.username || username;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit('user:join', { username: user.username });

    socket.on('user:joined', (u) => setUser(u));
    socket.on('users:online', setOnlineUsers);
    socket.on('message:new', (msg) => {
      setMessages((prev) => {
        if (msg.roomId !== activeRoomIdRef.current) return prev;
        return [...prev, msg];
      });
    });
    socket.on('typing:start', ({ roomId, username: u }) => {
      if (roomId === activeRoomIdRef.current) {
        setTypingUsers((prev) => [...new Set([...prev, u])]);
      }
    });
    socket.on('typing:stop', ({ roomId, username: u }) => {
      if (roomId === activeRoomIdRef.current) {
        setTypingUsers((prev) => prev.filter((n) => n !== u));
      }
    });

    fetchGroups()
      .then((g) => {
        const mapped = g.map((gr) => ({ ...gr, roomId: gr._id.toString(), isGroup: true }));
        setRooms((prev) => {
          const ids = new Set(prev.map((r) => r.roomId));
          return [...prev, ...mapped.filter((m) => !ids.has(m.roomId))];
        });
      })
      .catch(() => {});

    return () => {
      socket.off('user:joined');
      socket.off('users:online');
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.disconnect();
    };
  }, [user?.username, setUser]);

  useEffect(() => {
    if (!user) return;
    socket.emit('room:join', activeRoom.roomId);
    fetchMessages(activeRoom.roomId).then(setMessages).catch(() => setMessages([]));
    setTypingUsers([]);
    return () => {
      socket.emit('room:leave', activeRoom.roomId);
    };
  }, [activeRoom.roomId, user]);

  useEffect(() => {
    const dm = searchParams.get('dm');
    if (!dm || !displayName) return;
    const roomId = dmRoomId(displayName, dm);
    const room = {
      _id: roomId,
      name: dm,
      isGroup: false,
      roomId,
    };
    setRooms((prev) => (prev.some((r) => r.roomId === roomId) ? prev : [...prev, room]));
    setActiveRoom(room);
    setSearchParams({}, { replace: true });
  }, [searchParams, displayName, setSearchParams]);

  function handleTyping(value: string) {
    setText(value);
    socket.emit('typing:start', { roomId: activeRoom.roomId, username: displayName });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', { roomId: activeRoom.roomId, username: displayName });
    }, 1500);
  }

  function sendMessage(content: string, type: 'text' | 'file' | 'system' = 'text', file: UploadResult | null = null) {
    if (!content?.trim() && !file) return;
    socket.emit('message:send', {
      roomId: activeRoom.roomId,
      content: content || '',
      type,
      file,
    });
    setText('');
    socket.emit('typing:stop', { roomId: activeRoom.roomId, username: displayName });
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(text);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      sendMessage(file.name, 'file', uploaded);
    } catch {
      alert('File upload failed');
    }
    e.target.value = '';
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      const group = await createGroup(groupName.trim(), []);
      const room = { ...group, roomId: group._id.toString(), isGroup: true };
      setRooms((prev) => [...prev, room]);
      setActiveRoom(room);
      setShowNewGroup(false);
      setGroupName('');
    } catch {
      alert('Failed to create group');
    }
  }

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="h-full flex">
      <aside className="w-80 bg-chat-panel border-r border-chat-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b border-chat-sidebar">
          <h2 className="font-semibold">Chats</h2>
          <p className="text-xs text-chat-muted flex items-center gap-1 mt-1">
            <Circle className="w-2 h-2 fill-chat-accent text-chat-accent" />
            {onlineUsers.length} online
          </p>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-chat-muted" />
            <input
              className="w-full bg-chat-sidebar rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
              placeholder="Search chats"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-3 flex items-center justify-between mb-2">
          <span className="text-xs text-chat-muted uppercase tracking-wide">Rooms</span>
          <button
            type="button"
            onClick={() => setShowNewGroup(true)}
            className="text-chat-accent hover:text-emerald-400"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map((room) => (
            <button
              key={room.roomId}
              type="button"
              onClick={() => setActiveRoom(room)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-chat-sidebar transition ${
                activeRoom.roomId === room.roomId ? 'bg-chat-sidebar' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-chat-sidebar flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-chat-muted" />
              </div>
              <div className="text-left min-w-0">
                <p className="font-medium text-sm truncate">{room.name}</p>
                <p className="text-xs text-chat-muted">{room.isGroup ? 'Group' : 'Direct'}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-chat-sidebar">
          <p className="text-xs text-chat-muted mb-2">Online — {onlineUsers.length}</p>
          <div className="flex flex-wrap gap-1">
            {onlineUsers.slice(0, 8).map((u) => (
              <span key={u._id} className="text-xs bg-chat-sidebar px-2 py-1 rounded-full">
                {u.username}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 bg-chat-panel border-b border-chat-sidebar flex items-center gap-3">
          <Users className="w-5 h-5 text-chat-accent" />
          <div>
            <h2 className="font-semibold">{activeRoom.name}</h2>
            <p className="text-xs text-chat-muted">
              {typingUsers.length > 0
                ? `${typingUsers.join(', ')} typing...`
                : `${onlineUsers.length} online`}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-chat-muted text-sm py-12">
              No messages yet. Say hello in {activeRoom.name}.
            </p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender?.username === displayName;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMine
                      ? 'bg-chat-bubble-sent rounded-br-sm'
                      : 'bg-chat-bubble-received rounded-bl-sm'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs text-chat-accent mb-1">{msg.sender?.username}</p>
                  )}
                  {msg.type === 'file' ? (
                    <a
                      href={msg.file?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Paperclip className="w-4 h-4" />
                      {msg.file?.originalName || msg.content}
                    </a>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className="text-[10px] text-chat-muted text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="px-4 py-3 bg-chat-panel border-t border-chat-sidebar flex items-center gap-3"
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-chat-muted hover:text-chat-accent p-2"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            className="flex-1 bg-chat-sidebar rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-chat-accent"
            placeholder="Type a message"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
          />
          <button
            type="submit"
            className="bg-chat-accent hover:bg-emerald-600 p-2.5 rounded-full transition"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </main>

      {showNewGroup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateGroup}
            className="bg-chat-panel p-6 rounded-xl w-full max-w-sm border border-chat-sidebar"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">New Group</h3>
              <button type="button" onClick={() => setShowNewGroup(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              className="w-full bg-chat-sidebar rounded-lg px-4 py-2 mb-4 focus:outline-none"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-chat-accent py-2 rounded-lg font-medium">
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
