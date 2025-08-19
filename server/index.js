



import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import multer from 'multer';
import fs from 'fs';
import authRoutes from "./routes/AuthRoutes.js";
import contactRoutes from "./routes/ContactsRoutes.js";
import setUpSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';

// Configure environment variables
dotenv.config();

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/chatdb';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

// Multer configuration (expanded to support audio, images, videos, docs)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp3', 'audio/x-m4a', 'audio/aac',
      'audio/ogg', 'audio/x-wav', 'audio/x-aiff', 'audio/x-flac',
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg',
      // Documents
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const allowedExtensions = [
      // Audio
      '.mp3', '.wav', '.webm', '.m4a', '.aac', '.ogg', '.flac', '.aif',
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      // Videos
      '.mp4', '.webm', '.ogg',
      // Documents
      '.pdf', '.doc', '.docx', '.txt'
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtValid = allowedExtensions.includes(ext);

    if (isMimeValid || isExtValid) {
      console.log(`✅ Accepting file: ${file.originalname} (${file.mimetype})`);
      cb(null, true);
    } else {
      console.warn(`❌ Rejecting file: ${file.originalname} (${file.mimetype})`);
      cb(new Error(`Unsupported format. Allowed: ${allowedExtensions.join(', ')}`));
    }
  }
});

// CORS config
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"]
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));
app.use("/uploads/files", express.static("/uploads/files"))

// Upload endpoint (changed to match constants: /api/messages/upload-file)
app.post('/api/messages/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded or file type not allowed'
      });
    }

    const fileUrl = `${process.env.HOST || 'http://localhost:' + PORT}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      duration: req.body.duration || null
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Helper: format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// MongoDB Connection
mongoose.connect(databaseURL)
.then(() => console.log('🟢 Connected to Database'))
.catch((err) => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: `${uptime.toFixed(2)} seconds`,
    memory: {
      rss: formatBytes(memoryUsage.rss),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      heapUsed: formatBytes(memoryUsage.heapUsed)
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messagesRoutes)

// FIXED 404 Handler for Express v5 (regex-safe)
app.all(/^\/api\//, (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message,
      code: err.code,
      field: err.field
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'Unexpected error'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🌐 CORS allowed origin: ${process.env.ORIGIN || 'http://localhost:5173'}`);
});

// Socket.io setup
try {
  const io = setUpSocket(server);
  console.log('🟢 Socket.io server initialized');

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });
} catch (err) {
  console.error('❌ Socket.io init failed:', err);
  process.exit(1);
}

// Process signals
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
  // Removed server.close and process.exit to prevent crashes in development
  // In production, you might want to restart or handle differently
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('🔴 MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('🔴 MongoDB connection closed');
      process.exit(0);
    });
  });
});

