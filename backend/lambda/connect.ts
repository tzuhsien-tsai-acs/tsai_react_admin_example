// lambda/connect.ts
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayProxyEvent) {
    console.log('Connect Lambda invoked:', JSON.stringify(event, null, 2));
    const connectionId = event.requestContext.connectionId!;
    const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;

    if (!connectionId || !connectionsTableName) {
        console.error("Connection ID or Connections Table Name is missing.");
        return { statusCode: 500, body: 'Internal Server Error' };
    }

    try {
        await ddbDocClient.send(new PutCommand({
            TableName: connectionsTableName,
            Item: {
                connectionId: connectionId,
                // 您可以在這裡儲存其他使用者相關資訊，例如 userId
                connectedAt: new Date().toISOString(),
            },
        }));
        console.log(`New connection established and saved: ${connectionId}`);
        return { statusCode: 200, body: 'Connected successfully!' };
    } catch (error) {
        console.error("Error saving connection:", error);
        return { statusCode: 500, body: 'Failed to connect.' };
    }
}