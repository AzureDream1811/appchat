# AppChat

AppChat is a modern real-time chat client for private conversations and community rooms. It is a **frontend-only** application: it connects to an external REST/WebSocket backend and uses Cloudinary for avatar and attachment storage.

> This repository contains no backend source code and no database. You must provide a compatible backend (see [Backend requirements](#backend-requirements)).

> This project is independently designed and implemented. LongChat is used only as feature inspiration.

## Features

### Accounts and profiles

- User registration and login
- Protected routes
- Profile avatar and personal information
- Profile editing
- Account settings
- Light and dark themes

### Conversations and rooms

- One-to-one conversations
- Group chat rooms
- Create and join rooms
- Join rooms through invite links
- Room member list
- Conversation previews
- Responsive conversation sidebar

### Messaging

- Real-time text messages
- Message timestamps
- Markdown-style formatting
- Emoji picker
- Custom stickers
- Image and file attachments
- Attachment previews
- Message editing and deletion
- Reply and reaction support
- Typing indicators
- Read-status indicators

### User experience

- Desktop, tablet, and mobile layouts
- Toast notifications
- Loading and empty states
- Connection status indicators
- Reconnection after temporary network failure
- Error pages and fallback states
- Accessible keyboard-friendly controls

## Technology stack

- React 19 and TypeScript
- Vite 7
- React Router 7 (`react-router-dom`)
- Redux Toolkit and React Redux for state management
- Tailwind CSS 4 (`@tailwindcss/vite`, `tw-animate-css`)
- Radix UI primitives (Popover, Slot), `class-variance-authority`, `clsx`, and `tailwind-merge`
- Axios for REST requests
- Lucide React for icons
- Framer Motion for animations
- `emoji-picker-react` for the emoji picker
- `simple-customize-markdown-converter` for Markdown-style message formatting
- `locale-time-diff` for relative timestamps
- WebSocket for real-time events
- Cloudinary for avatar and attachment uploads
- ESLint for linting

## Architecture

### Main layers

```text
UI components
    │
    ▼
React Router + pages
    │
    ▼
Redux Toolkit state
    │
    ▼
Services and middleware
    ├── Axios API calls
    └── WebSocket communication
    │
    ▼
External backend services
```

### Frontend responsibilities

- **React + TypeScript:** user interface
- **React Router:** page navigation
- **Redux Toolkit:** global state
- **Axios:** HTTP/API requests
- **Native WebSocket:** real-time chat
- **Cloudinary:** images and attachments
- **Tailwind CSS / custom CSS:** styling
- **GitHub Actions + GitHub Pages:** frontend deployment

### Request flows

Sending a message:

```text
Chat component
  → Redux action
  → WebSocket middleware
  → WebSocket server
  → Redux state update
  → UI displays message
```

Loading user data:

```text
React component
  → Axios service
  → External API server
  → Redux state
  → UI displays data
```

Uploading an image:

```text
File input
  → Upload hook
  → Cloudinary
  → Image URL
  → Message sent through WebSocket
```

### Repository boundary

This repository contains the **frontend only**. It does not contain:

- Backend API source
- WebSocket server
- Database
- Authentication server
- Server deployment configuration

The complete application therefore depends on external infrastructure:

```text
Frontend + API server + WebSocket server + storage service
```

## Backend requirements

The client expects an external backend that provides authentication, conversation and message APIs, and a WebSocket endpoint.

### Likely data model

The backend schema is not included in this repository. The model below is inferred from how the frontend uses the data, so treat it as a guide rather than a specification.

```text
User
 ├── has many direct messages
 ├── belongs to many rooms
 └── sends many room messages

Room
 ├── has many members
 └── has many messages

Message
 ├── belongs to a sender
 ├── belongs to a user conversation or room
 └── may contain an attachment
```

**User**

```text
User
- id
- username
- password or authentication credential
- description
- avatarUrl
- status
- createdAt
- updatedAt
```

The frontend stores the current user locally and uses fields such as `username`.

**Direct conversation**

```text
DirectConversation
- id
- userOneId
- userTwoId
- createdAt
```

A direct conversation contains messages between two users.

**Room**

```text
Room
- id
- name
- inviteCode
- ownerId
- createdAt
```

Rooms can be created, joined directly, or accessed through an invite link.

**Room membership**

```text
RoomMember
- roomId
- userId
- role
- joinedAt
```

This represents the many-to-many relationship between users and rooms.

**Message**

```text
Message
- id
- senderId
- roomId          nullable
- receiverId      nullable
- content
- messageType     // people, room, image, sticker
- createdAt
- updatedAt
- deletedAt
```

A message is either:

```text
Direct message:
senderId + receiverId

Room message:
senderId + roomId
```

The frontend uses data resembling:

```json
{
  "name": "senderUsername",
  "to": "roomName or receiverUsername",
  "mes": "message content",
  "type": "people or room"
}
```

**Attachment**

```text
Attachment
- id
- messageId
- url
- fileName
- fileType
- fileSize
- createdAt
```

Files are stored externally, such as in Cloudinary. The database stores the resulting URL and metadata.

**Sticker**

```text
Sticker
- id
- name
- imageUrl
- category
```

A sticker message can store either a sticker ID or its image URL in the message content.

**Relationships**

```text
User 1 ──── * Message
User * ──── * Room
Room 1 ──── * Message
Message 1 ──── * Attachment
User 1 ──── * DirectConversation
```

A more complete relational design:

```text
users
  │
  ├── messages.sender_id
  ├── room_members.user_id
  └── direct_conversations.user_one_id/user_two_id

rooms
  │
  ├── room_members.room_id
  └── messages.room_id

messages
  │
  └── attachments.message_id
```

### Real-time events

The client expects the WebSocket server to support events such as:

```text
message:send
message:new
message:update
message:delete
message:react
conversation:join
conversation:leave
user:typing
user:presence
message:read
```

The backend is responsible for authenticating users and authorizing every REST request and WebSocket event. The client never relies on knowing a conversation or user ID for access control.

## Project structure

```text
src/
├── api/
├── components/
│   ├── auth/
│   ├── chat/
│   ├── rooms/
│   ├── profile/
│   └── ui/
├── hooks/
├── pages/
├── routes/
├── services/
├── state/
├── types/
└── utils/
```

## Environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000
VITE_WEBSOCKET_URL=ws://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Only public configuration belongs here. Never put API secrets or Cloudinary API secrets in frontend environment variables.

## Local development

```bash
npm install
npm run dev
```

Make sure your backend is running and reachable at the URLs configured above.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check with `tsc -b`, build with Vite, and copy `dist/index.html` to `dist/404.html` (SPA fallback for static hosting) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Frontend security notes

- Sanitize rendered message content
- Validate attachment size and MIME types before upload
- Use an unsigned Cloudinary upload preset restricted to allowed formats and sizes
- Keep secrets out of the client bundle
- Handle expired sessions and `401`/`403` responses gracefully
- Use HTTPS/WSS in production

## Deployment

- The frontend is deployed to GitHub Pages with GitHub Actions
- The static `dist/` output can also be hosted on Vercel, Netlify, or Cloudflare Pages
- The build copies `index.html` to `404.html`, so client-side routes keep working on GitHub Pages
- Set the environment variables above in your hosting provider
- Point `VITE_API_URL` and `VITE_WEBSOCKET_URL` at your production backend
- Configure CORS on the backend to allow the deployed frontend origin