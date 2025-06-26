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
            id
            sender
            content
            createdAt
          }
        }
      `,
      variables: { chatId },
    }),
  });
  const json = await res.json();
  // 依你 GraphQL schema 結構回傳
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
            id
          }
        }
      `,
      variables: { chatId, sender, content },
    }),
  });
  const json = await res.json();
  return json.data?.sendMessage;
}