import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [inputName, setInputName] = useState('');
  const { login, username } = useAuth();
  const navigate = useNavigate();

  if (username) return <Navigate to="/" replace />;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputName.trim()) return;
    login(inputName.trim());
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-chat-bg">
      <form
        onSubmit={handleLogin}
        className="bg-chat-panel p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-chat-sidebar"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-chat-accent flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">WhisperNet</h1>
            <p className="text-chat-muted text-sm">Realtime messaging</p>
          </div>
        </div>
        <input
          className="w-full bg-chat-sidebar rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-chat-accent"
          placeholder="Enter your username"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-chat-accent hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
}
