// frontend/src/ChatPage.tsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Title } from "react-admin";
import { useTranslation } from "react-i18next";
import { CHAT_API_CONFIG } from "./config/chat-env";
import { decodeToken } from './utils/auth'; // 匯入我們的共用函式

// --- 1. 定義 Message 型別 ---
interface Message {
  chatId: string;
  sender: string;
  content: string;
  createdAt: string;
}

// --- 2. 聊天室 UI 組件 ---
const ChatRoom: React.FC<{ chatId: string; jwtToken: string; wsUrl: string }> = ({ chatId, jwtToken, wsUrl }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 從 JWT 解碼使用者名稱，並用 useMemo 快取結果
  const senderName = useMemo(() => {
    const payload = decodeToken(jwtToken);
    // 從 payload 中取得使用者名稱，如果沒有則預設為 'User'
    return payload?.name || "User";
  }, [jwtToken]);

  // 初始化 WebSocket 連接
  useEffect(() => {
    if (!wsUrl) {
      setConnectionError("WebSocket URL 未配置。");
      return;
    }

    const connectWebSocket = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        return;
      }

      console.log("嘗試連接 WebSocket:", wsUrl);
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log("WebSocket 已連接");
        setIsConnected(true);
        setConnectionError(null);
        if (newWs.readyState === WebSocket.OPEN) {
          newWs.send(JSON.stringify({ action: 'listMessages', chatId: chatId }));
        }
      };

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("收到 WebSocket 訊息:", data);

        if (data.type === 'newMessage') {
          setMessages(prevMessages => {
            if (!prevMessages.some(msg => msg.createdAt === data.message.createdAt && msg.sender === data.message.sender)) {
                return [...prevMessages, data.message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
            return prevMessages;
          });
        } else if (data.type === 'historicalMessages') {
          setMessages(data.messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        }
      };

      newWs.onclose = (event) => {
        setIsConnected(false);
        console.log("WebSocket 已斷開連接:", event.code, event.reason);
        if (event.code !== 1000) {
            setConnectionError("WebSocket 連接斷開，嘗試重新連接...");
            setTimeout(connectWebSocket, 3000);
        } else {
            setConnectionError("WebSocket 已斷開連接。");
        }
      };

      newWs.onerror = (error) => {
        console.error("WebSocket 錯誤:", error);
        setConnectionError("WebSocket 連接錯誤。");
        newWs.close();
      };

      ws.current = newWs;

      return () => {
        console.log("清除 WebSocket...");
        newWs.close(1000, "Component unmounted");
      };
    };

    connectWebSocket();

  }, [wsUrl, chatId]);

  // 訊息自動滾動
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 發送訊息
  const handleSend = useCallback(async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    if (!input.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messagePayload = {
      action: 'sendMessage',
      chatId: chatId,
      sender: senderName,
      content: input,
    };

    ws.current.send(JSON.stringify(messagePayload));
    setInput("");
  }, [input, chatId, senderName]);

  // 處理 Enter 鍵發送
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(e);
    }
  }, [handleSend]);

  return (
    <div>
      <h2>{t('custom.chat.title')} ({isConnected ? t('custom.chat.connected') : t('custom.chat.disconnected')})</h2>
      {connectionError && <p style={{ color: 'red' }}>{t('custom.chat.errorPrefix')} {connectionError}</p>}
      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "scroll", marginBottom: 8, padding: '8px' }}>
        {messages.length === 0 && !isConnected && !connectionError && <p>{t('custom.chat.loading')}</p>}
        {messages.map((msg, idx) => (
          <div key={`${msg.createdAt}_${idx}`} style={{ marginBottom: '4px' }}>
            <b>{msg.sender}：</b>
            <span>{msg.content}</span>
            <small style={{ marginLeft: 8, color: 'gray' }}>{new Date(msg.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={t('custom.chat.placeholder')}
        onKeyDown={handleKeyDown}
        style={{ width: 200, marginRight: 8 }}
        disabled={!isConnected}
      />
      <button onClick={handleSend} disabled={!isConnected}>{t('custom.chat.send')}</button>
    </div>
  );
};

// --- 3. 主頁面組件 ---
const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const getJwtToken = () => localStorage.getItem("cognito_id_token");
  const jwtToken = getJwtToken();
  const chatId = "test-chat";

  const webSocketApiUrl = CHAT_API_CONFIG.graphqlEndpoint;

  if (!jwtToken) {
    return <div>{t('custom.chat.loginRequired')}</div>;
  }

  return (
    <>
      <Title title={t('custom.pages.chat')} />
      <ChatRoom chatId={chatId} jwtToken={jwtToken} wsUrl={webSocketApiUrl} />
    </>
  );
};

export default ChatPage;
