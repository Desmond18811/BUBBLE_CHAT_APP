
// client/MessageBar.jsx
import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment, GrMicrophone } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import AudioRecorder from "@/components/AudioRecorder";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { UPLOAD_FILE_ROUTE } from '@/utills/constants';

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const emojiRef = useRef(null);
  const { selectedChatType, selectedChatData, userInfo } = useAppStore();
  const socket = useSocket();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (selectedChatType === 'contact' && socket && selectedChatData) {
      const messageData = {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text"
      };
      
      socket.emit("sendMessage", messageData);
      setMessage("");
    }
  };

  const handleRecordingComplete = async (audioFile, duration) => {
    if (selectedChatType === 'contact' && socket && selectedChatData) {
      try {
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('duration', duration); // Fix: Append duration for backend/schema

        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const { fileUrl, filename, size, mimetype } = response.data;

        const messageData = {
          sender: userInfo.id,
          fileUrl,
          fileName: filename,
          fileSize: size,
          fileType: mimetype,
          recipient: selectedChatData._id,
          messageType: "audio",
          duration
        };
        
        socket.emit("sendMessage", messageData);
      } catch (error) {
        console.error('Audio upload failed:', error);
        toast.error("Failed to send audio. Please try again.");
      }
    }
    setShowAudioRecorder(false);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", response.data); // 🔍 Debug log

      if (response.data?.success) { // Changed from status to success to match backend
        const { fileUrl, filename, size, mimetype } = response.data;

        let messageType = "file";
        if (mimetype.startsWith("image/")) {
          messageType = "image";
        } else if (mimetype.startsWith("video/")) {
          messageType = "video";
        }

        if (selectedChatType === "contact" && socket && selectedChatData) {
          socket.emit("sendMessage", {
            sender: userInfo.id,
            recipient: selectedChatData._id,
            messageType,
            fileUrl,
            fileName: filename,
            fileSize: size,
            fileType: mimetype
          });
        }
        toast.success("File sent successfully");
      }
    } catch (error) {
      console.error("File upload failed:", error.response?.data || error.message);
      toast.error("Failed to send file. Please try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex items-center px-6 gap-4 border-t border-gray-800 relative">
      {/* Audio Recorder */}
      {showAudioRecorder && (
        <div className="absolute bottom-16 left-6 z-10">
          <AudioRecorder 
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {/* Input container */}
      <div className="flex items-center flex-1 bg-[#2a2b33] rounded-lg px-4 py-2 gap-3">
        <div className="flex gap-2">
          <button 
            className="text-neutral-500 hover:text-white transition-colors duration-200"
            onClick={() => setShowAudioRecorder(true)}
          >
            <GrMicrophone className="text-xl" />
          </button>
          <button className="text-neutral-500 hover:text-white transition-colors duration-200" onClick={handleAttachmentClick}>
            <GrAttachment className="text-xl" />
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleAttachmentChange}
            accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
        </div>

        <input
          type="text"
          className="flex-1 bg-transparent text-white placeholder-neutral-400 focus:outline-none"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />

        <button
          className="text-neutral-500 hover:text-white transition-colors duration-300"
          onClick={() => setEmojiPickerOpen((prev) => !prev)}
        >
          <RiEmojiStickerLine className="text-xl" />
        </button>

        {/* Emoji picker */}
        {emojiPickerOpen && (
          <div ref={emojiRef} className="absolute bottom-16 right-20 z-10">
            <EmojiPicker
              theme="dark"
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors duration-200"
        onClick={handleSendMessage}
      >
        <IoSend className="text-xl" />
      </button>
    </div>
  );
};

export default MessageBar;

