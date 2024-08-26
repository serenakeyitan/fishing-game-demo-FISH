import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [playerId, setPlayerId] = useState('player_' + Math.random().toString(36).substr(2, 9));

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:8080');  // Adjust URL as needed

        websocket.onopen = () => {
            console.log('WebSocket connection established');
            setWs(websocket);  // Save the WebSocket connection in state
            websocket.send(JSON.stringify({ type: 'join', playerId }));
        };

        websocket.onmessage = (message) => {
            console.log('Received message:', message.data);
            // Handle incoming messages
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = (event) => {
            console.warn('WebSocket connection closed:', event);
        };

        return () => {
            websocket.close();
        };
    }, [playerId]);

    return (
        <WebSocketContext.Provider value={{ ws, playerId }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
