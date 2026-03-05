export interface User {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface MessageFile {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface Message {
  _id: string;
  roomId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  file?: MessageFile;
  sender?: User;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  roomId: string;
  isGroup: boolean;
}

export interface Group {
  _id: string;
  name: string;
  members?: User[];
  isGroup?: boolean;
}

export interface AuthUser {
  _id?: string;
  username: string;
  avatar?: string;
}
