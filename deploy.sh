#!/bin/zsh

# --- 配置區 ---
BACKEND_DIR="./backend" # 後端 CDK 專案的路徑
FRONTEND_DIR="./frontend" # 前端 React 專案的路徑
CDK_STACK_NAME="ChatWebSocketDemoStack" # 您的 CDK 堆疊名稱

# AWS 配置 (如果您的 AWS CLI 已經配置好，這些可以不寫)
# export AWS_ACCOUNT_ID="YOUR_AWS_ACCOUNT_ID" # 替換為您的 AWS 帳戶 ID
# export AWS_REGION="YOUR_AWS_REGION"         # 替換為您的 AWS 區域，例如 ap-northeast-1

# --- 部署後端 CDK 堆疊 ---
echo "--- 部署後端 CDK 堆疊 ---"
cd "$BACKEND_DIR" || { echo "錯誤: 無法進入後端目錄 $BACKEND_DIR"; exit 1; }

# 確保 node_modules 存在且是最新的
npm install || { echo "錯誤: 後端 npm install 失敗"; exit 1; }
npm run build || { echo "錯誤: 後端 TypeScript 編譯失敗"; exit 1; }

# 部署 CDK 堆疊並捕獲輸出
# 使用 'tee' 將輸出同時打印到控制台和一個臨時檔案
CDK_OUTPUT=$(npx aws-cdk deploy "$CDK_STACK_NAME" --outputs-file cdk-outputs.json --require-approval never)
DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
    echo "錯誤: CDK 部署失敗。請檢查上方的錯誤訊息。"
    exit 1
fi

echo "CDK 部署完成。正在解析輸出..."

# 從 cdk-outputs.json 中解析 WebSocketApiUrl
# 注意：cdk deploy --outputs-file 的輸出格式是 JSON，可以直接解析
WEB_SOCKET_API_URL=$(jq -r ".\"$CDK_STACK_NAME\".WebSocketApiUrl" cdk-outputs.json)

if [ -z "$WEB_SOCKET_API_URL" ]; then
    echo "錯誤: 無法從 CDK 輸出中獲取 WebSocketApiUrl。請確認堆疊名稱和輸出名稱正確。"
    exit 1
fi

echo "獲取到的 WebSocket API URL: $WEB_SOCKET_API_URL"

# 清理臨時輸出檔案
rm cdk-outputs.json

cd - # 返回到專案根目錄

# --- 更新前端環境變數 ---
echo "--- 更新前端環境變數 ---"
# 創建或更新 .env 檔案 (React 應用程式會讀取 REACT_APP_ 開頭的變數)
# 注意：這裡使用絕對路徑以確保正確寫入
ENV_FILE="$FRONTEND_DIR/.env"

# 檢查 .env 檔案是否存在，如果存在則移除舊的 REACT_APP_WEBSOCKET_API_URL
if [ -f "$ENV_FILE" ]; then
    sed -i '' '/REACT_APP_WEBSOCKET_API_URL=/d' "$ENV_FILE" # For macOS (BSD sed)
    # sed -i '/REACT_APP_WEBSOCKET_API_URL=/d' "$ENV_FILE" # For Linux (GNU sed)
fi

echo "REACT_APP_WEBSOCKET_API_URL=$WEB_SOCKET_API_URL" >> "$ENV_FILE"
echo "已將 WebSocket API URL 寫入到 $ENV_FILE"

# --- 構建前端應用程式 ---
echo "--- 構建前端應用程式 ---"
cd "$FRONTEND_DIR" || { echo "錯誤: 無法進入前端目錄 $FRONTEND_DIR"; exit 1; }

npm install || { echo "錯誤: 前端 npm install 失敗"; exit 1; }
npm run build || { echo "錯誤: 前端構建失敗"; exit 1; }

echo "前端構建完成。構建後的檔案位於 $FRONTEND_DIR/build"

# --- 部署前端靜態檔案 (範例: 部署到 S3) ---
# 這個部分是範例，您需要根據您的實際前端部署方式進行修改。
# 最常見的是部署到 S3 並通過 CloudFront 分發。
# 這裡僅提供 S3 的基礎上傳。您需要有 AWS CLI 的 S3 權限。

echo "--- 部署前端靜態檔案到 S3 (需要手動配置 S3 Bucket) ---"
S3_BUCKET_NAME="your-chat-app-frontend-bucket" # <<< 請替換為您實際的 S3 桶名稱

# 檢查 S3 桶是否存在，如果不存在則創建它
# (這是一個基本檢查，實際生產環境可能需要更嚴格的策略)
if ! aws s3 ls "s3://$S3_BUCKET_NAME" 2>/dev/null; then
    echo "S3 桶 $S3_BUCKET_NAME 不存在，正在創建..."
    aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION" || { echo "錯誤: 創建 S3 桶失敗"; exit 1; }
    echo "請確保您的 S3 桶已配置為靜態網站託管，並開放了公共讀取權限。"
    echo "您還需要配置 CloudFront 以獲得更好的性能和 HTTPS。"
fi

# 將構建好的檔案上傳到 S3
aws s3 sync build/ "s3://$S3_BUCKET_NAME" --delete --acl public-read || { echo "錯誤: 上傳前端檔案到 S3 失敗"; exit 1; }

echo "前端檔案已成功部署到 S3:// $S3_BUCKET_NAME"

cd - # 返回到專案根目錄

echo "--- 部署流程完成 ---"
echo "您可以透過以下網址訪問您的聊天室 (假設您配置了靜態網站託管):"
echo "http://$S3_BUCKET_NAME.s3-website.$AWS_REGION.amazonaws.com"
echo "如果您配置了 CloudFront，請使用 CloudFront 分配的域名。"
