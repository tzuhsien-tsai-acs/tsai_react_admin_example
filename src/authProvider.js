// src/authProvider.js
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
// 從新的 cognitoState 模組導入狀態管理函數
import { setCognitoUserRequiringNewPassword } from './cognitoState';

// --- 請務必確認這裡的 Cognito 用戶池 ID 和應用程式客戶端 ID 是否正確 ---
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};
// -------------------------------------------------------------

const userPool = new CognitoUserPool(poolData);

// 注意：我們不再直接導出一個可變的 let 變數。狀態通過 cognitoState.js 中的函數管理。
// export let cognitoUserRequiringNewPassword = null; // 此行應被移除或註釋掉

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
                    // 登入成功，將 Cognito token 存儲在 localStorage 中
                    localStorage.setItem('cognito_id_token', result.getIdToken().getJwtToken());
                    localStorage.setItem('cognito_access_token', result.getAccessToken().getJwtToken());
                    localStorage.setItem('cognito_refresh_token', result.getRefreshToken().getToken());
                    resolve();
                },
                onFailure: (err) => {
                    // 對於普通的登入失敗，直接 reject 錯誤訊息
                    reject(err.message);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    console.warn('需要設置新密碼:', userAttributes, requiredAttributes);

                    // 在這裡，我們將 CognitoUser 實例存儲在 cognitoState 模塊中
                    setCognitoUserRequiringNewPassword(cognitoUser);

                    // 返回一個包含 redirectTo 屬性的 reject，讓 react-admin 的 useLogin 鉤子處理重定向
                    // 這種方式符合 react-admin 的 authProvider 規範，用於觸發重定向。
                    reject({
                        redirectTo: '/new-password',
                        state: { username: username } // 將用戶名傳遞給新密碼頁面
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
            // 如果後端返回 401 或 403，表示權限問題，應該登出
            localStorage.removeItem('cognito_id_token');
            localStorage.removeItem('cognito_access_token');
            localStorage.removeItem('cognito_refresh_token');
            return Promise.reject({ redirectTo: '/login' }); // 觸發 react-admin 的重定向到登入頁面
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
                // 如果有當前用戶，嘗試獲取其會話
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        // 獲取會話失敗，可能是因為未登入或會話過期
                        reject(new Error('No current session'));
                        return;
                    }
                    if (session.isValid()) {
                        // 會話有效，表示已認證
                        resolve();
                    } else {
                        // 會話無效，嘗試使用 refresh token 刷新會話
                        cognitoUser.refreshSession(session.getRefreshToken(), (refreshErr, refreshSession) => {
                            if (refreshErr) {
                                // 刷新會話失敗
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
                // 沒有找到當前用戶，表示未登入
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
            cognitoUser.signOut(); // 執行 Cognito 登出
        }
        // 清除 localStorage 中的 token
        localStorage.removeItem('cognito_id_token');
        localStorage.removeItem('cognito_access_token');
        localStorage.removeItem('cognito_refresh_token');
        // 清理臨時存儲在 cognitoState 模組中的用戶實例
        setCognitoUserRequiringNewPassword(null);
        return Promise.resolve('/login'); // 重定向到登入頁面
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
                            // 將 Cognito 用戶屬性轉換為 react-admin 需要的格式
                            const identity = {
                                // 使用 'sub' (用戶唯一標識符) 作為 react-admin 的 id
                                id: attributes.find(attr => attr.Name === 'sub')?.Value || cognitoUser.getUsername(),
                                fullName: attributes.find(attr => attr.Name === 'name')?.Value || cognitoUser.getUsername(),
                                // 添加其他您需要的屬性，例如 email
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
            return Promise.resolve([]); // 未登入，沒有權限
        }

        try {
            // 解析 JWT 並檢查其中的 `cognito:groups` 聲明
            const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
            const groups = decodedToken['cognito:groups'] || [];
            // 根據組返回權限
            if (groups.includes('admin')) {
                return Promise.resolve(['admin']);
            }
            // 默認給予 'user' 權限
            return Promise.resolve(['user']);
        } catch (e) {
            console.error('解析 ID Token 失敗:', e);
            return Promise.resolve([]);
        }
    }
};

export default authProvider;