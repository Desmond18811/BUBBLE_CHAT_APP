// routes/MessagesRoutes.js
import { Router } from "express";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ 
  dest: "uploads/files",
  // limits: {
  //   fileSize: 10 * 1024 * 1024 // 10MB limit
  // }
});

messagesRoutes.post('/get-messages', verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

export default messagesRoutes;

