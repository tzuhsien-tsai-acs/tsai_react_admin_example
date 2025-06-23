// src/authProvider.js
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { setCognitoUserRequiringNewPassword } from './cognitoState';

// --- 請務必確認這裡的 Cognito 用戶池 ID 和應用程式客戶端 ID 是否正確 ---
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};
// -------------------------------------------------------------

const userPool = new CognitoUserPool(poolData);

const authProvider = {
    /**
     * 處理用戶登入邏輯。
     * @param {{ username: string, password: string }} credentials - 用戶名和密碼。
     * @returns {Promise<void | { redirectTo: string, state: object }>} - 成功則 resolve，失敗則 reject 錯誤訊息或重定向對象。
     */
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
                    // 對於普通的登入失敗，直接 reject 錯誤訊息
                    // 這將被 LoginPage 中的 notify 捕獲並顯示。
                    reject(err.message);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    console.warn('需要設置新密碼:', userAttributes, requiredAttributes);

                    setCognitoUserRequiringNewPassword(cognitoUser);

                    // 關鍵：reject 一個對象，讓 react-admin 的 useLogin 處理重定向。
                    // 這種方式會讓 useLogin 自動導航，而不是在 Login 頁面手動處理。
                    reject({
                        redirectTo: '/new-password',
                        state: { username: username }
                    });
                }
            });
        });
    },

    /**
     * 處理應用程式中的錯誤，例如 401/403 錯誤。
     * @param {object} error - 錯誤對象。
     * @returns {Promise<void | { redirectTo: string }>} - 如果需要重定向則 reject，否則 resolve。
     */
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

    /**
     * 檢查用戶認證狀態。
     * @returns {Promise<void>} - 如果已認證則 resolve，否則 reject。
     */
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

    /**
     * 處理用戶登出邏輯。
     * @returns {Promise<string>} - resolve 登出後重定向的路徑。
     */
    async logout() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('cognito_id_token');
        localStorage.removeItem('cognito_access_token');
        localStorage.removeItem('cognito_refresh_token');
        setCognitoUserRequiringNewPassword(null); // 清理臨時存儲的用戶實例
        return Promise.resolve('/login');
    },

    /**
     * 獲取當前登入用戶的身份資訊。
     * @returns {Promise<{ id: string, fullName?: string, email?: string }>} - resolve 用戶身份對象。
     */
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

    /**
     * 獲取用戶權限 (用於 RBAC)。
     * @returns {Promise<string[]>} - resolve 包含用戶權限的字符串數組。
     */
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