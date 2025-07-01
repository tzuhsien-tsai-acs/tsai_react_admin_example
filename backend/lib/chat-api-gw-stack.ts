// lib/chat-api-gw-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwIntegrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ChatApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- 1. DynamoDB Tables ---
    // 用於儲存 WebSocket 連接 ID
    const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: 'WebSocketConnections',
      partitionKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 用於儲存聊天訊息
    const messagesTable = new dynamodb.Table(this, 'ChatMessagesTable', {
      tableName: 'APIGWChatMessages', // 不同於 AppSync 的表名
      partitionKey: {
        name: 'chatId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- 2. Lambda Functions ---

    // 連接處理 Lambda
    const connectLambda = new lambda.Function(this, 'ConnectLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'connect.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // 假設 Lambda 程式碼在 lambda/ 目錄下
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(connectLambda); // 授予 Lambda 讀寫 DynamoDB 的權限

    // 斷開連接處理 Lambda
    const disconnectLambda = new lambda.Function(this, 'DisconnectLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'disconnect.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
      },
    });
    connectionsTable.grantReadWriteData(disconnectLambda);

    // 訊息處理 Lambda (傳送和接收)
    const messageLambda = new lambda.Function(this, 'MessageLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'message.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
        MESSAGES_TABLE_NAME: messagesTable.tableName,
      },
    });
    connectionsTable.grantReadData(messageLambda); // 訊息 Lambda 需要讀取連接資訊以廣播
    messagesTable.grantReadWriteData(messageLambda); // 訊息 Lambda 需要讀寫聊天訊息
    
    // 授予 Message Lambda 呼叫 API Gateway 管理 API 的權限，用於廣播訊息
    messageLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['execute-api:ManageConnections'],
      resources: [cdk.Arn.format({
        service: 'execute-api',
        resource: '*',
        resourceName: '*',
        partition: 'aws',
      }, this)],
    }));

    // --- 3. WebSocket API Gateway ---
    const webSocketApi = new apigw.WebSocketApi(this, 'ChatWebSocketApi', {
      apiName: 'ReactAdminChatWebSocketApi',
      connectRouteOptions: {
        integration: new apigwIntegrations.WebSocketLambdaIntegration('ConnectIntegration', connectLambda),
      },
      disconnectRouteOptions: {
        integration: new apigwIntegrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectLambda),
      },
      // $default 路由用於處理所有非 $connect 和 $disconnect 的訊息
      defaultRouteOptions: {
        integration: new apigwIntegrations.WebSocketLambdaIntegration('MessageIntegration', messageLambda),
      },
    });

    const webSocketStage = new apigw.WebSocketStage(this, 'DevelopmentStage', {
      webSocketApi,
      stageName: 'dev', // 您可以根據環境設定不同的 Stage Name
      autoDeploy: true,
    });

    // 將 API Gateway 的網址設定為 Lambda 函數的環境變數，以便它們能夠回呼 API Gateway 廣播訊息
    messageLambda.addEnvironment('API_GW_ENDPOINT', webSocketStage.url.replace('wss://', 'https://'));
    connectLambda.addEnvironment('API_GW_ENDPOINT', webSocketStage.url.replace('wss://', 'https://'));
    disconnectLambda.addEnvironment('API_GW_ENDPOINT', webSocketStage.url.replace('wss://', 'https://'));


    // --- 4. CDK Outputs ---
    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketStage.url,
      description: 'The WebSocket API endpoint URL',
    });
    new cdk.CfnOutput(this, 'WebSocketApiConnectionsTableName', {
      value: connectionsTable.tableName,
      description: 'DynamoDB Table for WebSocket connections',
    });
    new cdk.CfnOutput(this, 'WebSocketApiMessagesTableName', {
      value: messagesTable.tableName,
      description: 'DynamoDB Table for chat messages',
    });
  }
}