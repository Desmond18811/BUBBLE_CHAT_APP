// client/AudioRecorder.jsx
import { useState, useRef, useEffect } from 'react';
import { FaStop, FaMicrophone, FaPlay, FaPause, FaTrash } from 'react-icons/fa';

const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSend = () => {
    if (audioURL) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
      const audioFile = new File([audioBlob], `recording-${Date.now()}.mp3`, {
        type: 'audio/mp3'
      });
      onRecordingComplete(audioFile, duration); // Updated to pass duration without type
      setAudioURL('');
      setDuration(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="bg-[#2a2b33] p-4 rounded-lg shadow-lg w-full max-w-md">
      {!audioURL ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-white font-mono">{formatTime(duration)}</span>
            </div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white flex items-center justify-center`}
            >
              {isRecording ? <FaStop size={16} /> : <FaMicrophone size={16} />}
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={togglePlayback}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </button>
            <span className="text-white font-mono">{formatTime(duration)}</span>
            <button
              onClick={() => setAudioURL('')}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <FaTrash size={16} />
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAudioURL('')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Re-record
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;


