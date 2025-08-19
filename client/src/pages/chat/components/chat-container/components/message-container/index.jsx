// client/MessageContainer.jsx
import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic, Image as ImageIcon, File, Video, Download } from "lucide-react";
import apiClient from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE } from "@/utills/constants";

const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatMessages, selectedChatData, userInfo, selectedChatType, setSelectedChatMessages } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { userId: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    if (selectedChatData?._id && selectedChatType === "contact") {
      getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  // Audio logic
  const [currentAudio, setCurrentAudio] = useState(null);

  const handlePlayPause = (fileUrl) => {
    if (currentAudio && !currentAudio.paused && currentAudio.src === fileUrl) {
      currentAudio.pause();
      setCurrentAudio(null);
    } else {
      if (currentAudio) currentAudio.pause();
      const audio = new Audio(fileUrl);
      audio.play();
      setCurrentAudio(audio);
      audio.onended = () => setCurrentAudio(null);
    }
  };

  const renderDMMessage = (message) => {
    const isSender = message.sender === userInfo?.id;
    const fileExtension = message.fileType ? message.fileType.split('/')[1] : '';

    return (
      <div
        key={message._id}
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isSender
              ? "bg-[#4169E1]/5 text-[#4169E1]/90 border border-[#4169E1]/50"
              : "bg-[#2a2b33]/5 text-white/90 border border-[#ffff]/20 break-words"
          }`}
        >
          {message.messageType === "text" ? (
            <span>{message.content}</span>
          ) : (
            <div className="space-y-2">
              {/* Icon and Label */}
              <div className="flex items-center gap-2">
                {message.messageType === "image" ? <ImageIcon className="h-5 w-5 text-[#4169E1]" /> :
                 message.messageType === "video" ? <Video className="h-5 w-5 text-[#4169E1]" /> :
                 message.messageType === "audio" ? <Mic className="h-5 w-5 text-[#4169E1]" /> :
                 <File className="h-5 w-5 text-[#4169E1]" />}
                <span className="font-medium capitalize">{message.messageType}</span>
              </div>

              {/* Inline Preview where possible */}
              {message.messageType === "image" && (
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName || "Image"} 
                  className="max-w-full max-h-64 rounded-lg object-contain"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available"; }}
                />
              )}
              {message.messageType === "video" && (
                <video 
                  src={message.fileUrl} 
                  controls
                  className="max-w-full max-h-64 rounded-lg"
                />
              )}
              {message.messageType === "audio" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayPause(message.fileUrl)}
                    className="p-2 rounded-full bg-[#4169E1]/10 hover:bg-[#4169E1]/20 transition"
                  >
                    {currentAudio && currentAudio.src === message.fileUrl && !currentAudio.paused ? (
                      <Pause className="h-5 w-5 text-[#4169E1]" />
                    ) : (
                      <Play className="h-5 w-5 text-[#4169E1]" />
                    )}
                  </button>
                  <span className="text-xs text-gray-400">
                    {message.duration ? moment.duration(message.duration, "seconds").humanize() : "Audio"}
                  </span>
                </div>
              )}
              {message.messageType === "file" && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="truncate max-w-[150px]">{message.fileName}</span>
                  <span>{(message.fileSize / 1024).toFixed(1)} KB</span>
                </div>
              )}

              {/* Download Link (forces download on click) */}
              <a 
                href={message.fileUrl} 
                download={message.fileName || `${message.messageType}.${fileExtension}`}
                className="flex items-center gap-1 text-sm text-[#4169E1] hover:underline mt-1"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs mt-1 ${
              isSender ? "text-[#4169E1]/70" : "text-gray-500"
            }`}
          >
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    let lastDate = null;

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {renderDMMessage(message)}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageContainer;

