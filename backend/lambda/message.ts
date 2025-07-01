// lambda/message.ts
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME!;
const messagesTableName = process.env.MESSAGES_TABLE_NAME!;
const apiGwEndpoint = process.env.API_GW_ENDPOINT!;

export async function handler(event: APIGatewayProxyEvent) {
    console.log('Message Lambda invoked:', JSON.stringify(event, null, 2));

    if (!event.body) {
        return { statusCode: 400, body: 'Missing message body' };
    }

    const connectionId = event.requestContext.connectionId!;
    let messageData;
    try {
        messageData = JSON.parse(event.body);
    } catch (error) {
        console.error("Failed to parse message body:", error);
        return { statusCode: 400, body: 'Invalid JSON format' };
    }

    const { action, chatId, sender, content } = messageData;

    if (action === 'sendMessage' && chatId && sender && content) {
        const createdAt = new Date().toISOString();
        const messageItem = {
            chatId,
            createdAt, // 使用 createdAt 作為排序鍵
            sender,
            content,
            // connectionId: connectionId, // 可以儲存發送者的 connectionId
        };

        try {
            // 1. 將訊息儲存到 DynamoDB
            await ddbDocClient.send(new PutCommand({
                TableName: messagesTableName,
                Item: messageItem,
            }));
            console.log("Message saved to DynamoDB:", messageItem);

            // 2. 從連接表中獲取所有連接 ID
            const connections = await ddbDocClient.send(new ScanCommand({
                TableName: connectionsTableName,
                ProjectionExpression: 'connectionId',
            }));

            const postCalls = (connections.Items as { connectionId: string }[] | undefined)?.map(async (item) => {
                const recipientConnectionId = item.connectionId;
                // 廣播訊息給所有連接的客戶端
                const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
                    apiVersion: '2018-11-29',
                    endpoint: apiGwEndpoint,
                });

                try {
                    await apiGatewayManagementApi.send(new PostToConnectionCommand({
                        ConnectionId: recipientConnectionId,
                        Data: JSON.stringify({ type: 'newMessage', message: messageItem }),
                    }));
                    console.log(`Message sent to connection: ${recipientConnectionId}`);
                } catch (e: any) {
                    // 處理無效的連接 (例如客戶端已斷開但數據庫中仍有記錄)
                    if (e.statusCode === 410) { // GoneException
                        console.log(`Stale connection, deleting: ${recipientConnectionId}`);
                        await ddbDocClient.send(new DeleteCommand({
                            TableName: connectionsTableName,
                            Key: { connectionId: recipientConnectionId },
                        }));
                    } else {
                        console.error(`Error sending message to ${recipientConnectionId}:`, e);
                    }
                }
            }) || [];

            await Promise.all(postCalls); // 並行發送所有訊息

            return { statusCode: 200, body: 'Message sent and broadcasted.' };

        } catch (error) {
            console.error("Error processing message:", error);
            return { statusCode: 500, body: 'Failed to process message.' };
        }
    } else if (action === 'listMessages' && chatId) {
        try {
            // 獲取歷史訊息
            const historicalMessages = await ddbDocClient.send(new QueryCommand({
                TableName: messagesTableName,
                KeyConditionExpression: 'chatId = :c',
                ExpressionAttributeValues: {
                    ':c': chatId,
                },
                ScanIndexForward: true, // 按 createdAt 升序排列
            }));

            // 將歷史訊息發送回請求該歷史訊息的客戶端
            const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
                apiVersion: '2018-11-29',
                endpoint: apiGwEndpoint,
            });

            await apiGatewayManagementApi.send(new PostToConnectionCommand({
                ConnectionId: connectionId!,
                Data: JSON.stringify({ type: 'historicalMessages', messages: historicalMessages.Items || [] }),
            }));

            return { statusCode: 200, body: 'Historical messages sent.' };

        } catch (error) {
            console.error("Error fetching historical messages:", error);
            return { statusCode: 500, body: 'Failed to fetch historical messages.' };
        }
    }

    return { statusCode: 400, body: 'Unsupported action or missing parameters.' };
}