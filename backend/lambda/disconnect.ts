// lambda/disconnect.ts
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayProxyEvent) {
    console.log('Disconnect Lambda invoked:', JSON.stringify(event, null, 2));
    const connectionId = event.requestContext.connectionId!;
    const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;

    if (!connectionId || !connectionsTableName) {
        console.error("Connection ID or Connections Table Name is missing.");
        return { statusCode: 500, body: 'Internal Server Error' };
    }

    try {
        await ddbDocClient.send(new DeleteCommand({
            TableName: connectionsTableName,
            Key: {
                connectionId: connectionId,
            },
        }));
        console.log(`Connection removed: ${connectionId}`);
        return { statusCode: 200, body: 'Disconnected successfully!' };
    } catch (error) {
        console.error("Error removing connection:", error);
        return { statusCode: 500, body: 'Failed to disconnect.' };
    }
}