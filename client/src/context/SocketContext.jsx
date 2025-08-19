
//working code 
// client/SocketProvider.jsx (assuming this is the file for SocketContext, as per import in MessageBar)
import { createContext, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAppStore } from '@/store';
import { HOST } from '@/utills/constants';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo?.id) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            const handleReceiveMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState();
                
                // Add message to store if it belongs to current chat
                if (selectedChatData && selectedChatType) {
                    const isCurrentChatMessage = 
                        (selectedChatType === 'contact' && 
                        (message.sender._id === selectedChatData._id || 
                         message.recipient._id === selectedChatData._id)) ||
                        (selectedChatType === 'channel' && 
                         message.recipient._id === selectedChatData._id);
                    
                    if (isCurrentChatMessage) {
                        addMessage(message);
                    }
                }
            };

            socket.current.on('connect', () => {
                console.log('Connected to socket server');
            });

            socket.current.on("receiveMessage", handleReceiveMessage);

            socket.current.on('messageError', (error) => {
                console.error('Message error:', error);
            });

            return () => {
                if (socket.current?.connected) {
                    socket.current.disconnect();
                }
            };
        }
    }, [userInfo?.id]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};


