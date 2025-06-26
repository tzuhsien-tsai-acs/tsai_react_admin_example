import { CHAT_API_CONFIG } from "../config/chat-env";

// 查詢聊天室訊息
export async function listMessages(chatId: string, jwtToken: string) {
  const res = await fetch(CHAT_API_CONFIG.graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
    },
    body: JSON.stringify({
      query: `
        query ListMessages($chatId: String!) {
          listMessages(chatId: $chatId) {
            chatId
            sender
            content
            createdAt
          }
        }
      `,
      variables: { chatId },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} ${errText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data?.listMessages || [];
}

// 發送訊息
export async function sendMessage(chatId: string, sender: string, content: string, jwtToken: string) {
  const res = await fetch(CHAT_API_CONFIG.graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwtToken,
    },
    body: JSON.stringify({
      query: `
        mutation SendMessage($chatId: String!, $sender: String!, $content: String!) {
          sendMessage(chatId: $chatId, sender: $sender, content: $content) {
            chatId
            sender
            content
            createdAt
          }
        }
      `,
      variables: { chatId, sender, content },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error: ${res.status} ${errText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data?.sendMessage;
}