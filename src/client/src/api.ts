import { io, Socket } from 'socket.io-client';
import type { Group, Message, User } from './types';

const socket: Socket = io('/', { autoConnect: false });

export default socket;

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch('/api/groups');
  if (!res.ok) throw new Error('Failed to fetch groups');
  return res.json() as Promise<Group[]>;
}

export async function createGroup(name: string, memberUsernames: string[]): Promise<Group> {
  const res = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, memberUsernames }),
  });
  if (!res.ok) throw new Error('Failed to create group');
  return res.json() as Promise<Group>;
}

export async function fetchMessages(roomId: string): Promise<Message[]> {
  const res = await fetch(`/api/messages/${roomId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json() as Promise<Message[]>;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json() as Promise<User[]>;
}

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json() as Promise<{ status: string; service: string }>;
}

export interface UploadResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json() as Promise<UploadResult>;
}
