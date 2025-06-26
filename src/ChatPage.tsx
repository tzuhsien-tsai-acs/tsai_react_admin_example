import React, { useEffect, useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  useQuery,
  gql,
} from "@apollo/client";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloLink, HttpLink } from "@apollo/client";
import { sendMessage } from "./services/chatservice";

// 1. GraphQL 訂閱與查詢語法
const LIST_MESSAGES = gql`
  query ListMessages($chatId: String!) {
    listMessages(chatId: $chatId) {
      chatId
      sender
      content
      createdAt
    }
  }
`;

const ON_MESSAGE_SENT = gql`
  subscription OnMessageSent($chatId: String!) {
    onMessageSent(chatId: $chatId) {
      chatId
      sender
      content
      createdAt
    }
  }
`;

// 2. chatId & 取得 Cognito token
const chatId = "test-chat";
const getJwtToken = () => localStorage.getItem("cognito_id_token") || "";

// 3. Apollo Client 設定（使用 aws-appsync-auth-link & subscription-link）
const httpUrl = "https://m7qp2gpfobcsppplzainjstpn4.appsync-api.ap-northeast-1.amazonaws.com/graphql";
const region = "ap-northeast-1";
const auth = {
  type: "AMAZON_COGNITO_USER_POOLS",
  jwtToken: async () => localStorage.getItem("cognito_id_token"),
};

const httpLink = new HttpLink({ uri: httpUrl });

const client = new ApolloClient({
  link: ApolloLink.from([
    createAuthLink({ url: httpUrl, region, auth }),
    createSubscriptionHandshakeLink({ url: httpUrl, region, auth }, httpLink),
  ]),
  cache: new InMemoryCache(),
});

// 4. Chat UI
const ChatInner: React.FC<{ jwtToken: string }> = ({ jwtToken }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const payload = jwtToken ? JSON.parse(atob(jwtToken.split('.')[1])) : {};
  const senderName = payload["name"] || "User";

  // 初次載入
  const { data: queryData } = useQuery(LIST_MESSAGES, {
    variables: { chatId },
    fetchPolicy: "network-only",
  });

  // 即時訂閱
  const { data: subData } = useSubscription(ON_MESSAGE_SENT, {
    variables: { chatId },
    onSubscriptionData: ({ subscriptionData }) => {
      console.log("收到訂閱推播：", subscriptionData);
    },
  });

  // 初次載入訊息
  useEffect(() => {
    if (queryData?.listMessages) {
      setMessages(queryData.listMessages);
    }
  }, [queryData]);

  // 有新訊息推播時加入
  useEffect(() => {
    if (subData?.onMessageSent) {
      setMessages(prev => {
        // 避免重複訊息
        if (prev.find(m => m.createdAt === subData.onMessageSent.createdAt)) return prev;
        return [...prev, subData.onMessageSent];
      });
      console.log("訊息推播已加入畫面：", subData.onMessageSent);
    }
  }, [subData]);

  // 送出訊息，仍用你原本的 sendMessage API
  async function handleSend(e?: React.FormEvent | React.KeyboardEvent) {
    e?.preventDefault?.();
    if (!input.trim() || !jwtToken) {
      alert("請先登入或輸入訊息");
      return;
    }
    try {
      await sendMessage(chatId, senderName, input, jwtToken);
      setMessages(prev => [
        ...prev,
        {
          chatId,
          sender: senderName,
          content: input,
          createdAt: new Date().toISOString(),
        }
      ]);
      setInput("");
    } catch (err: any) {
      alert("送出訊息失敗：" + (err?.message || JSON.stringify(err)));
      console.error("送出訊息失敗", err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSend(e);
    }
  }

  return (
    <div>
      <h2>聊天室</h2>
      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "scroll", marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={msg.createdAt + "_" + idx}>
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
        onKeyDown={handleKeyDown}
        style={{ width: 200, marginRight: 8 }}
      />
      <button onClick={handleSend}>送出</button>
    </div>
  );
};

// 5. 包裝 ApolloProvider
const ChatPage: React.FC = () => {
  const jwtToken = getJwtToken();
  if (!jwtToken) return <div>請先登入</div>;

  return (
    <ApolloProvider client={client}>
      <ChatInner jwtToken={jwtToken} />
    </ApolloProvider>
  );
};

export default ChatPage;