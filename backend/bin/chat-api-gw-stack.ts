// bin/chat-api-gw-stack.ts
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ChatApiGatewayStack } from '../lib/chat-api-gw-stack'; // 導入新的棧定義

const app = new cdk.App();
new ChatApiGatewayStack(app, 'ChatWebSocketDemoStack', { // 修改堆疊名稱以避免衝突
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});