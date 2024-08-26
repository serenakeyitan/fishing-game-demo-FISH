import React from 'react';
import { useWebSocket } from './WebSocketProvider';

const TestComponent = () => {
    const { ws, playerId } = useWebSocket();

    const sendTestMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const testMessage = { type: 'test', playerId };
            ws.send(JSON.stringify(testMessage));
            console.log('Sent test message:', testMessage);
        } else {
            console.error('WebSocket is not connected or not ready');
        }
    };

    return (
        <div>
            <button onClick={sendTestMessage}>Send Test Message</button>
        </div>
    );
};

export default TestComponent;
