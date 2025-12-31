# 🎵 Spotify Clone

A full-stack Spotify-like music streaming application built with **React**, **Node.js/Express**, and **PostgreSQL**. This project demonstrates the use of custom data structures for efficient data management and search functionality.

![Spotify Clone](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?logo=postgresql)

## ✨ Features

### Core Features

- 🎧 **Music Streaming** - Play songs with a fully functional audio player
- 🔍 **Real-time Search** - Autocomplete search using Trie data structure
- 📚 **Personal Library** - Save favorite songs to your library
- 📜 **Play History** - Track recently played songs with Stack (LIFO)
- 🎨 **Artist Pages** - Browse artists and their discography
- 🎭 **Category Browsing** - Explore music by genre/category

### Authentication

- 📧 **Email/Password Login** - Traditional authentication with bcrypt
- 🔐 **Google OAuth** - Sign in with Google
- ✉️ **Email Verification** - OTP-based email verification
- 🔑 **Password Reset** - Forgot password with email recovery
- 🛡️ **Session Management** - Secure session-based authentication

### User Experience

- 📱 **Responsive Design** - Works on desktop and mobile
- 🎚️ **Audio Controls** - Play, pause, seek, volume, shuffle, repeat
- 💾 **Persistent State** - Player state maintained across navigation
- ⚡ **Fast Search** - Sub-millisecond autocomplete with Trie

## 🏗️ Architecture

### Data Structures Used

This project implements custom data structures for efficient operations:

| Data Structure | Use Case                                | Time Complexity          |
| -------------- | --------------------------------------- | ------------------------ |
| **HashMap**    | O(1) lookup for songs, artists, users   | O(1) get/set             |
| **Trie**       | Autocomplete search for songs & artists | O(m) prefix search       |
| **Stack**      | User play history (LIFO)                | O(1) push/pop            |
| **LinkedList** | User library, artist songs grouping     | O(1) append, O(n) search |
| **BST**        | Sorted data traversal                   | O(log n) search          |

### Tech Stack

**Frontend:**

- React 18 with Vite
- React Router v6
- Context API for state management
- CSS Modules & custom styling

**Backend:**

- Node.js with Express
- PostgreSQL database
- Passport.js (Google OAuth)
- Express Session
- Nodemailer for emails

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database, passport, mailer config
│   │   ├── controllers/     # Route handlers
│   │   ├── dataStructures/  # Custom DS implementations
│   │   │   ├── HashMap.js
│   │   │   ├── Trie.js
│   │   │   ├── Stack.js
│   │   │   ├── LinkedList.js
│   │   │   ├── BinarySearchTree.js
│   │   │   └── Queue.js
│   │   ├── middlewares/     # Auth, rate limiting, session
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic, caching
│   │   └── store/           # In-memory data store
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Shared components
│   │   ├── context/         # Auth & Player context
│   │   ├── features/        # Feature-based modules
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── home/        # Home page
│   │   │   ├── search/      # Search functionality
│   │   │   ├── library/     # User library
│   │   │   ├── history/     # Play history
│   │   │   ├── artist/      # Artist pages
│   │   │   ├── songs/       # Playlist/songs
│   │   │   └── player/      # Audio player
│   │   └── styles/          # Global styles
│   └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**backend/.env:**

```env
# Server
SERVER_PORT=3000
SERVER_BASE_URL=http://localhost:3000
CLIENT_BASE_URL=http://localhost:5175

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotify_db
DB_USER=postgres
DB_PASSWORD=your_password

# Session
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="Spotify Clone <your_email@gmail.com>"
```

**frontend/.env:**

```env
VITE_API_URL=http://localhost:3000/api
```

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE spotify_db;
```

2. Run the schema (tables for users, artists, songs, etc.)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/spotify-clone.git
cd spotify-clone
```

2. **Install backend dependencies:**

```bash
cd backend
npm install
```

3. **Install frontend dependencies:**

```bash
cd ../frontend
npm install
```

4. **Start the backend server:**

```bash
cd backend
npm run dev
```

5. **Start the frontend dev server:**

```bash
cd frontend
npm run dev
```

6. **Open in browser:**

```
http://localhost:5175
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/auth/register`        | Register new user        |
| POST   | `/api/auth/login`           | Login user               |
| POST   | `/api/auth/logout`          | Logout user              |
| GET    | `/api/auth/me`              | Get current user         |
| POST   | `/api/auth/verify-otp`      | Verify email OTP         |
| POST   | `/api/auth/resend-otp`      | Resend OTP               |
| POST   | `/api/auth/forgot-password` | Request password reset   |
| POST   | `/api/auth/reset-password`  | Reset password           |
| GET    | `/api/auth/google`          | Google OAuth             |
| GET    | `/api/auth/check-email`     | Check email availability |

### Songs & Artists

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/songs`               | Get all songs         |
| GET    | `/api/songs/:id`           | Get song by ID        |
| GET    | `/api/artists`             | Get all artists       |
| GET    | `/api/artists/:id`         | Get artist with songs |
| GET    | `/api/artists/:id/related` | Get related artists   |

### Search

| Method | Endpoint                            | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/search?q=query`               | Search songs & artists |
| GET    | `/api/search/autocomplete?q=prefix` | Autocomplete search    |

### Library & History

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| GET    | `/api/library`              | Get user library    |
| POST   | `/api/library/:songId`      | Add song to library |
| DELETE | `/api/library/:songId`      | Remove from library |
| GET    | `/api/library/history`      | Get play history    |
| DELETE | `/api/library/history`      | Clear history       |
| POST   | `/api/library/play/:songId` | Record song play    |

## 🔧 Available Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎯 Data Structure Implementation Details

### Trie (Prefix Tree)

Used for autocomplete search functionality:

- Case-insensitive search
- Returns matching songs/artists as user types
- O(m) time complexity where m = prefix length

### HashMap

Custom implementation for O(1) lookups:

- Songs indexed by song_id
- Artists indexed by artist_id
- Users indexed by user_id

### Stack

Used for play history (LIFO):

- Most recently played songs on top
- Configurable maximum size (default: 100)
- Efficient push/pop operations

### LinkedList

Used for ordered collections:

- User library songs
- Songs grouped by artist
- Songs grouped by category

## 📝 License

This project is for educational purposes. All music content should be properly licensed for production use.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ using React, Node.js, and PostgreSQL
