import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/chat', label: 'Messages', icon: MessageCircle },
  { to: '/users', label: 'People', icon: Users },
];

export default function Layout() {
  const { user, username, logout } = useAuth();
  const displayName = user?.username || username;

  return (
    <div className="h-screen flex bg-chat-bg">
      <nav className="w-20 lg:w-64 bg-chat-panel border-r border-chat-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b border-chat-sidebar flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chat-accent flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="font-bold text-sm truncate">WhisperNet</p>
            <p className="text-xs text-chat-muted truncate">{displayName}</p>
          </div>
        </div>

        <div className="flex-1 py-3 space-y-1 px-2">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                  isActive
                    ? 'bg-chat-sidebar text-chat-accent'
                    : 'text-chat-muted hover:bg-chat-sidebar hover:text-chat-text'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline font-medium">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-3 border-t border-chat-sidebar">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
            alt=""
            className="w-10 h-10 rounded-full mx-auto lg:mx-0 mb-2"
          />
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-2 text-chat-muted hover:text-white text-xs py-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
