import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Users, Zap, Type, FolderOpen, Upload, Database, Circle, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGroups, fetchUsers, fetchHealth } from '../api';

interface DashboardStats {
  users: number;
  online: number;
  groups: number;
  health: { status: string; service: string } | null;
}

const features = [
  { icon: Zap, title: 'Realtime Messaging', desc: 'Instant delivery via Socket.io' },
  { icon: Circle, title: 'Online Status', desc: 'Live presence for every user' },
  { icon: Type, title: 'Typing Indicators', desc: 'See when others are typing' },
  { icon: Users, title: 'Group Chats', desc: 'Create and join group rooms' },
  { icon: Upload, title: 'File Sharing', desc: 'Upload files up to 10MB' },
  { icon: Database, title: 'Message History', desc: 'Messages persisted in MongoDB' },
];

export default function Dashboard() {
  const { user, username } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ users: 0, online: 0, groups: 0, health: null });

  useEffect(() => {
    Promise.all([
      fetchUsers().catch(() => []),
      fetchGroups().catch(() => []),
      fetchHealth().catch(() => null),
    ]).then(([users, groups, health]) => {
      setStats({
        users: users.length,
        online: users.filter((u) => u.isOnline).length,
        groups: groups.length,
        health,
      });
    });
  }, []);

  const displayName = user?.username || username;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="px-6 py-5 bg-chat-panel border-b border-chat-sidebar">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-chat-muted mt-1">
          Welcome back, {displayName}. Your messaging hub is ready.
        </p>
      </header>

      <div className="p-6 space-y-6 max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users, icon: Users },
            { label: 'Online Now', value: stats.online, icon: Circle, accent: true },
            { label: 'Groups', value: stats.groups, icon: FolderOpen },
            {
              label: 'API Status',
              value: stats.health?.status === 'ok' ? 'Online' : '—',
              icon: Zap,
            },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="bg-chat-panel rounded-xl p-4 border border-chat-sidebar"
            >
              <Icon className={`w-5 h-5 mb-2 ${accent ? 'text-chat-accent' : 'text-chat-muted'}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-chat-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Link
          to="/chat"
          className="flex items-center justify-between bg-chat-accent/10 border border-chat-accent/30 rounded-xl p-5 hover:bg-chat-accent/20 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-chat-accent flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">Open Messages</p>
              <p className="text-sm text-chat-muted">Jump into chats, groups, and file sharing</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-chat-accent group-hover:translate-x-1 transition" />
        </Link>

        <div>
          <h2 className="text-sm font-semibold text-chat-muted uppercase tracking-wide mb-3">
            Features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-chat-panel rounded-xl p-4 border border-chat-sidebar"
              >
                <Icon className="w-5 h-5 text-chat-accent mb-2" />
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-chat-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
