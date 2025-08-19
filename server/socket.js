// server/socket.js
import { Server as SocketIoServer } from "socket.io";
import Message from "./models/Messages.js";

const setUpSocket = (server) => {
    const io = new SocketIoServer(server, {
        cors: {
            origin: process.env.ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    const userSocketMap = new Map();
    const messageQueue = new Map(); // Stores messages for offline users

    // Get message history between two users
    const getMessageHistory = async (userId1, userId2, limit = 50) => {
        try {
            return await Message.find({
                $or: [
                    { sender: userId1, recipient: userId2 },
                    { sender: userId2, recipient: userId1 }
                ]
            })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color");
        } catch (error) {
            console.error('Error fetching message history:', error);
            throw error;
        }
    };

    const sendMessage = async (data) => {
      try {
        console.log("Received message data:", data); // Debug log
        
        // Basic validation (no token; trust data.sender for now)
        if (!data.sender || !data.recipient || !data.messageType) {
          throw new Error('Missing required fields: sender, recipient, messageType');
        }
        if (data.messageType === 'text' && !data.content) {
          throw new Error('Content required for text messages');
        }
        if (data.messageType !== 'text' && !data.fileUrl) {
          throw new Error('fileUrl required for non-text messages');
        }
        
        // Prepare message data
        const messageData = {
          sender: data.sender,
          recipient: data.recipient,
          messageType: data.messageType,
          content: data.messageType === 'text' ? data.content : undefined,
        };

        // Add file-specific fields for non-text messages
        if (data.messageType !== "text") {
          messageData.fileUrl = data.fileUrl;
          messageData.fileName = data.fileName;
          messageData.fileSize = data.fileSize;
          messageData.fileType = data.fileType || data.mimetype;
          
          // Add duration for audio (required by schema)
          if (data.messageType === 'audio') {
            if (!data.duration) throw new Error('Duration required for audio');
            messageData.duration = data.duration;
          }
        }

        console.log("Processed message data:", messageData); // Debug log

        // Save to database
        const message = await Message.create(messageData);
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "id email firstName lastName image color")
          .populate("recipient", "id email firstName lastName image color");

        // Emit to recipient and sender
        io.to(data.recipient).emit("receiveMessage", populatedMessage);
        io.to(data.sender).emit("receiveMessage", populatedMessage);

        console.log("✅ Message sent successfully:", populatedMessage._id);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", { 
          error: "Failed to send message", 
          details: error.message 
        });
      }
    };

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        
        if (!userId) {
            console.log('Connection rejected: No userId provided');
            return socket.disconnect(true);
        }

        // Clean up previous connection
        if (userSocketMap.has(userId)) {
            const oldSocketId = userSocketMap.get(userId);
            io.to(oldSocketId).disconnectSockets(true);
        }

        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);

        // Send queued messages if any exist
        if (messageQueue.has(userId)) {
            const queuedMessages = messageQueue.get(userId);
            queuedMessages.forEach(msg => {
                socket.emit("receiveMessage", msg);
            });
            messageQueue.delete(userId);
        }

        socket.join(userId);

        // Handle message history request
        socket.on('requestMessageHistory', async ({ otherUserId, limit }, callback) => {
            try {
                const messages = await getMessageHistory(userId, otherUserId, limit);
                callback({ success: true, messages });
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('disconnect', () => {
            userSocketMap.delete(userId);
            console.log(`User ${userId} disconnected`);
        });
        
        socket.on("sendMessage", sendMessage);
        
        socket.on('error', (err) => {
            console.error(`Socket error for user ${userId}:`, err);
        });
    });

    return io;
};

export default setUpSocket;

