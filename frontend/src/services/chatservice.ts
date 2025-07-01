// chatservice.ts
// 不再需要 CHAT_API_CONFIG
// import { CHAT_API_CONFIG } from "../config/chat-env";

interface Message {
    chatId: string;
    sender: string;
    content: string;
    createdAt: string;
}

let ws: WebSocket | null = null;
let messageListeners: ((message: Message) => void)[] = [];
let historicalMessageListeners: ((messages: Message[]) => void)[] = [];
let isConnected = false;

export const connectWebSocket = (websocketUrl: string, onOpen: () => void, onClose: () => void, onError: (error: Event) => void) => {
    if (ws && isConnected) {
        console.log("WebSocket is already connected.");
        return;
    }

    ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
        console.log("WebSocket connected!");
        isConnected = true;
        onOpen();
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'newMessage') {
                console.log("New message received:", data.message);
                messageListeners.forEach(listener => listener(data.message));
            } else if (data.type === 'historicalMessages') {
                console.log("Historical messages received:", data.messages);
                historicalMessageListeners.forEach(listener => listener(data.messages));
            }
        } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
        }
    };

    ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event);
        isConnected = false;
        onClose();
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnected = false;
        onError(error);
    };
};

export const disconnectWebSocket = () => {
    if (ws) {
        ws.close();
        ws = null;
        isConnected = false;
    }
};

export const sendMessageViaWebSocket = (chatId: string, sender: string, content: string) => {
    if (ws && isConnected) {
        const message = {
            action: 'sendMessage', // WebSocket API Gateway 的 $default 路由會處理這個 action
            chatId,
            sender,
            content,
        };
        ws.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not connected. Message not sent.");
        throw new Error("WebSocket is not connected.");
    }
};

export const requestHistoricalMessages = (chatId: string) => {
    if (ws && isConnected) {
        const message = {
            action: 'listMessages', // WebSocket API Gateway 的 $default 路由會處理這個 action
            chatId,
        };
        ws.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not connected. Cannot request historical messages.");
        throw new Error("WebSocket is not connected.");
    }
}

export const addMessageListener = (listener: (message: Message) => void) => {
    messageListeners.push(listener);
};

export const removeMessageListener = (listener: (message: Message) => void) => {
    messageListeners = messageListeners.filter(l => l !== listener);
};

export const addHistoricalMessageListener = (listener: (messages: Message[]) => void) => {
    historicalMessageListeners.push(listener);
};

export const removeHistoricalMessageListener = (listener: (messages: Message[]) => void) => {
    historicalMessageListeners = historicalMessageListeners.filter(l => l !== listener);
};

export const isWebSocketConnected = () => isConnected;