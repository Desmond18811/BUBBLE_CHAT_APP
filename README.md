# Bubble ChatApp 💬

A modern, real-time chat application built with Node.js, Express, MongoDB, Socket.IO, and React. Features seamless messaging with support for text, audio, images, videos, and documents with intuitive inline previews and download options.

![ChatApp Demo](https://img.shields.io/badge/Demo-Live%20Preview-green) ![GitHub last commit](https://img.shields.io/github/last-commit/Desmond18811/BUBBLE_CHAT_APP) ![GitHub issues](https://img.shields.io/github/issues/Desmond18811/BUBBLE_CHAT_APP)

## ✨ Features

- **Real-time messaging** powered by Socket.IO for instant communication
- **Multi-format support**: Text, audio, images, videos, and documents
- **Inline media preview** for images, videos, and audio playback
- **Forced download option** for all media and documents
- **User authentication** with secure JWT-based sessions
- **Responsive design** optimized for both desktop and mobile devices
- **Modern UI/UX** with intuitive navigation and clean interface

## 🖼️ Screenshots

| Chat Interface | File Upload | Mobile View |
|----------------|-------------|-------------|
| ![Chat Interface](/screenshots/chat-interface.png) | ![File Upload](/screenshots/file-upload.png) | ![Mobile View](/screenshots/mobile-view.png) |

## 🚀 Quick Start

### Prerequisites

- Node.js (v16.x or later)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Desmond18811/BUBBLE_CHAT_APP.git
   cd BUBBLE_CHAT_APP
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   JWT_KEY=your-super-secure-jwt-key-here
   ORIGIN=http://localhost:5173
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
   ```

5. **Start the application**
   ```bash
   # Start the backend server (from server directory)
   npm start
   
   # Start the frontend (from client directory in a new terminal)
   npm run dev
   ```

6. **Open your browser** at `http://localhost:5173`

## 📖 Usage

1. **Sign up** for a new account or **log in** with existing credentials
2. **Start a conversation** by selecting a contact from your list
3. **Send messages** using text, audio recordings, or file uploads
4. **Preview media** directly in the chat interface
5. **Download files** using the download option for any media

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/messages/upload-file` | Upload media files |
| GET | `/api/messages/get-messages` | Retrieve message history |
| GET | `/api/users` | Fetch user list |

## 🏗️ Project Structure

```
BUBBLE_CHAT_APP/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend application
│   ├── models/           # MongoDB models
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Server utilities
│   └── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions to improve Bubble ChatApp! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication capabilities
- React team for the excellent frontend framework
- MongoDB for reliable data storage
- Vite for fast development build tools

---

⭐ Star this repository if you found it helpful!
```
