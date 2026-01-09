import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/providers/AuthProvider';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, accessToken } = useAuth(); // accessToken is the correct property name

    useEffect(() => {
        // Only connect if user is logged in
        if (!user || !accessToken) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Initialize Socket
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Socket.io expects the root URL, not the API endpoint. Strip /api if present.
        const socketUrl = apiUrl.replace(/\/api\/?$/, '');

        const socketInstance = io(socketUrl, {
            auth: {
                token: accessToken,
            },
            // Prevent automatic connection to allow easier debugging
            autoConnect: true,
            transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
            withCredentials: true
        });

        socketInstance.on('connect', () => {
            console.log('🔌 [SOCKET] Connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 [SOCKET] Disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('🔌 [SOCKET] Connection error:', err.message);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [user, accessToken]); // Re-connect if user/token changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
