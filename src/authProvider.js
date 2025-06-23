// src/authProvider.js
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { setCognitoUserRequiringNewPassword } from './cognitoState'; // <--- 關鍵修改：從 cognitoState 導入

// --- 請務必確認這裡的 Cognito 用戶池 ID 和應用程式客戶端 ID 是否正確 ---
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};
// -------------------------------------------------------------

const userPool = new CognitoUserPool(poolData);

// 移除舊的：export let cognitoUserRequiringNewPassword = null;

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
                    localStorage.setItem('cognito_id_token', result.getIdToken().getJwtToken());
                    localStorage.setItem('cognito_access_token', result.getAccessToken().getJwtToken());
                    localStorage.setItem('cognito_refresh_token', result.getRefreshToken().getToken());
                    resolve();
                },
                onFailure: (err) => {
                    reject(err.message);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    console.warn('需要設置新密碼:', userAttributes, requiredAttributes);

                    // 關鍵修改：使用 setCognitoUserRequiringNewPassword 函數來存儲 CognitoUser 實例
                    setCognitoUserRequiringNewPassword(cognitoUser);

                    const redirectError = new Error('New password required');
                    redirectError.redirectTo = '/new-password';
                    redirectError.state = { username: username }; // 只傳遞 username
                    reject(redirectError);
                }
            });
        });
    },

    // 檢查錯誤
    async checkError(error) {
        const status = error.status;
        if (status === 401 || status === 403) {
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
                        resolve();
                    } else {
                        cognitoUser.refreshSession(session.getRefreshToken(), (refreshErr, refreshSession) => {
                            if (refreshErr) {
                                reject(new Error('Failed to refresh session'));
                            } else {
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
        // 清理臨時存儲的用戶實例
        setCognitoUserRequiringNewPassword(null); // <--- 關鍵修改：使用 setCognitoUserRequiringNewPassword 函數來清理
        return Promise.resolve('/login');
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
                            const identity = {
                                id: attributes.find(attr => attr.Name === 'sub')?.Value || cognitoUser.getUsername(),
                                fullName: attributes.find(attr => attr.Name === 'name')?.Value || cognitoUser.getUsername(),
                                email: attributes.find(attr => attr.Name === 'email')?.Value,
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
    async getPermissions() {
        const idToken = localStorage.getItem('cognito_id_token');
        if (!idToken) {
            return Promise.resolve([]);
        }

        try {
            const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
            const groups = decodedToken['cognito:groups'] || [];
            if (groups.includes('admin')) {
                return Promise.resolve(['admin']);
            }
            return Promise.resolve(['user']);
        } catch (e) {
            console.error('解析 ID Token 失敗:', e);
            return Promise.resolve([]);
        }
    }
};

export default authProvider;