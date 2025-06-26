import React, { useEffect, useState } from "react";
import { listMessages, sendMessage } from "./services/chatservice";
import { CHAT_API_CONFIG } from "../config/chat-env";

// 假設你已經有 Cognito 登入流程，jwtToken 是登入後取得的 token
const jwtToken = localStorage.getItem("cognito_id_token") || "";

const chatId = "test-chat";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim() || !jwtToken) return;
    try {
      console.log("Sending:", input);
      await sendMessage(chatId, "User", input, jwtToken);
      setInput("");
      const msgs = await listMessages(chatId, jwtToken);
      setMessages(msgs);
    } catch (err) {
      console.error("送出訊息失敗", err);
      alert("送出訊息失敗：" + (err?.message || err));
    }
  }
  
  useEffect(() => {
    async function fetchMessages() {
      if (!jwtToken) return;
      try {
        const msgs = await listMessages(chatId, jwtToken);
        setMessages(msgs);
      } catch (err) {
        console.error("取得訊息失敗", err);
      }
    }
    fetchMessages();
  }, [jwtToken]);

  return (
    <div>
      <h2>聊天室</h2>
      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "scroll" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>{msg.sender}：</b>
            <span>{msg.content}</span>
            <small style={{ marginLeft: 8 }}>{msg.createdAt}</small>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="輸入訊息"
      />
      <button onClick={handleSend}>送出</button>
    </div>
  );
};

export default ChatPage;
