

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "audio", "image", "video", "file"],
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.messageType !== 'text';
    }
  },
  fileName: {
    type: String,
    required: function() {
      return ['image', 'video', 'file'].includes(this.messageType);
    }
  },
  fileType: {
    type: String,
    required: function() {
      return ['image', 'video', 'file'].includes(this.messageType);
    }
  },
  fileSize: {
    type: Number,
    required: function() {
      return ['image', 'video', 'file'].includes(this.messageType);
    }
  },
  duration: {
    type: Number,
    required: function() {
      return this.messageType === 'audio';
    }
  },
  delivered: {
    type: Boolean, 
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;

