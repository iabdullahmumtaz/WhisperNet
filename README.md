# WhisperNet

Realtime messaging app with online presence, typing indicators, group chats, and file sharing — inspired by WhatsApp.

## Features

- Instant messaging via Socket.io
- Live online status and typing indicators
- Group chat creation and membership
- File uploads up to 10MB (Multer)
- Message history persisted in MongoDB
- Multi-page UI: login, dashboard, chat, users

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Language | **TypeScript** (strict)                         |
| Backend  | Node.js, Express, Socket.io, tsx                |
| Database | MongoDB, Mongoose                               |
| Frontend | React, Vite, Socket.io-client, TypeScript       |
| Uploads  | Multer                                          |
| Styling  | Tailwind CSS                                    |

## Ports

| Service | Port |
|---------|------|
| UI      | 5011 |
| API     | 6011 |

## Quick Start

```bash
cp .env.example .env
npm run install:all
npm run dev
```

- **UI:** http://localhost:5011
- **API:** http://localhost:6011

## Project Structure

```
WhisperNet/
├── src/
│   ├── server/       # Express + Socket.io
│   └── client/       # React chat UI
├── uploads/
├── docker-compose.yml
└── package.json
```

## License

MIT
