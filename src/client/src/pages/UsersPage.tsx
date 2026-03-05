import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Circle, MessageCircle, Search } from 'lucide-react';
import { fetchUsers } from '../api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export default function UsersPage() {
  const { user, username } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const me = user?.username || username;

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
    const interval = setInterval(() => {
      fetchUsers().then(setUsers).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username !== me &&
      u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-6 py-4 bg-chat-panel border-b border-chat-sidebar">
        <h1 className="text-xl font-bold">People</h1>
        <p className="text-sm text-chat-muted">Browse users and start direct chats</p>
      </header>

      <div className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-chat-muted" />
          <input
            className="w-full bg-chat-sidebar rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-chat-accent"
            placeholder="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 && (
          <p className="text-chat-muted text-sm text-center py-8">No users found</p>
        )}
        {filtered.map((u) => (
          <Link
            key={u._id}
            to={`/chat?dm=${encodeURIComponent(u.username)}`}
            className="flex items-center gap-4 p-4 bg-chat-panel rounded-xl border border-chat-sidebar hover:border-chat-accent/40 transition"
          >
            <img
              src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
              alt=""
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{u.username}</p>
              <p className="text-xs text-chat-muted flex items-center gap-1">
                {u.isOnline ? (
                  <>
                    <Circle className="w-2 h-2 fill-chat-accent text-chat-accent" />
                    Online
                  </>
                ) : (
                  `Last seen ${u.lastSeen ? new Date(u.lastSeen).toLocaleString() : '—'}`
                )}
              </p>
            </div>
            <MessageCircle className="w-5 h-5 text-chat-accent shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
