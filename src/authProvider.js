// src/authProvider.js
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

// 替換成您的 Cognito 用戶池和應用程式客戶端 ID
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq',
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'
};

const userPool = new CognitoUserPool(poolData);

const authProvider = {
    // 登入
    async login({ username, password }) {
        return new Promise((resolve, reject) => {
            const authenticationDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            });

            const cognitoUser = new CognitoUser({
                Username: username,
                Pool: userPool,
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    // 登入成功，可以將 token 存儲在 localStorage 中
                    // 例如：result.getIdToken().getJwtToken()
                    localStorage.setItem('cognito_id_token', result.getIdToken().getJwtToken());
                    localStorage.setItem('cognito_access_token', result.getAccessToken().getJwtToken());
                    localStorage.setItem('cognito_refresh_token', result.getRefreshToken().getToken());
                    resolve();
                },
                onFailure: (err) => {
                    reject(err.message);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // 如果用戶需要設置新密碼 (例如首次登入或密碼過期)
                    // 您可以在這裡處理這個流程，通常會引導用戶到一個新密碼設置頁面
                    console.warn('需要設置新密碼:', userAttributes, requiredAttributes);
                    reject('New password required'); // 或引導到特定頁面
                }
            });
        });
    },

    // 檢查錯誤
    async checkError(error) {
        const status = error.status;
        if (status === 401 || status === 403) {
            // 如果後端返回 401 或 403，表示權限問題，應該登出
            localStorage.removeItem('cognito_id_token');
            localStorage.removeItem('cognito_access_token');
            localStorage.removeItem('cognito_refresh_token');
            return Promise.reject({ redirectTo: '/login' });
        }
        return Promise.resolve();
    },

    // 檢查認證狀態
    async checkAuth() {
        return new Promise((resolve, reject) => {
            const cognitoUser = userPool.getCurrentUser();

            if (cognitoUser != null) {
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        reject(new Error('No current session'));
                        return;
                    }
                    if (session.isValid()) {
                        // 如果 session 有效，則表示已認證
                        resolve();
                    } else {
                        // session 無效，嘗試刷新 token
                        cognitoUser.refreshSession(session.getRefreshToken(), (refreshErr, refreshSession) => {
                            if (refreshErr) {
                                reject(new Error('Failed to refresh session'));
                            } else {
                                // 刷新成功，更新 token
                                localStorage.setItem('cognito_id_token', refreshSession.getIdToken().getJwtToken());
                                localStorage.setItem('cognito_access_token', refreshSession.getAccessToken().getJwtToken());
                                localStorage.setItem('cognito_refresh_token', refreshSession.getRefreshToken().getToken());
                                resolve();
                            }
                        });
                    }
                });
            } else {
                reject(new Error('No user found'));
            }
        });
    },

    // 登出
    async logout() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('cognito_id_token');
        localStorage.removeItem('cognito_access_token');
        localStorage.removeItem('cognito_refresh_token');
        return Promise.resolve('/login'); // 重定向到登入頁面
    },

    // 獲取用戶身份
    async getIdentity() {
        return new Promise((resolve, reject) => {
            const cognitoUser = userPool.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (session.isValid()) {
                        cognitoUser.getUserAttributes((attributeErr, attributes) => {
                            if (attributeErr) {
                                reject(attributeErr);
                                return;
                            }
                            // 將 Cognito 用戶屬性轉換為 react-admin 需要的格式
                            const identity = {
                                id: attributes.find(attr => attr.Name === 'sub')?.Value || cognitoUser.getUsername(), // 使用 sub 作為唯一 ID
                                fullName: attributes.find(attr => attr.Name === 'name')?.Value || cognitoUser.getUsername(),
                                // 添加其他您需要的屬性，例如 avatar
                            };
                            resolve(identity);
                        });
                    } else {
                        reject(new Error('Session invalid'));
                    }
                });
            } else {
                reject(new Error('No user found'));
            }
        });
    },

    // 檢查權限 (可選)
    async canAccess({ resource, action }) {
        // 這部分取決於您的權限設計
        // 您可以從 Cognito 的 ID Token 中獲取組 (Groups) 信息來判斷權限
        // 或者根據用戶的屬性來判斷
        const idToken = localStorage.getItem('cognito_id_token');
        if (!idToken) {
            return Promise.resolve({ authorized: false });
        }

        // 這裡可以解析 JWT 並檢查其中的 `cognito:groups` 聲明
        // 例如：
        // const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
        // const groups = decodedToken['cognito:groups'] || [];
        // if (groups.includes('admin')) {
        //     return Promise.resolve({ authorized: true });
        // }

        return Promise.resolve({ authorized: true }); // 暫時預設為 true，請根據您的需求實作
    }
};

export default authProvider;