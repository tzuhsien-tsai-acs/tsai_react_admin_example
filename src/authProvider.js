// src/authProvider.js
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { setCognitoUserRequiringNewPassword } from './cognitoState';

const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};

const userPool = new CognitoUserPool(poolData);

const authProvider = {
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
                    reject(err.message);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    console.warn('需要設置新密碼:', userAttributes, requiredAttributes);

                    setCognitoUserRequiringNewPassword(cognitoUser);

                    // *** 關鍵改變：這裡不再 reject 一個 redirectTo 對象 ***
                    // 而是 reject 一個特定的錯誤訊息，例如 "NEW_PASSWORD_REQUIRED"，
                    // 讓 LoginPage 能夠識別這個訊息並手動執行重定向。
                    reject('NEW_PASSWORD_REQUIRED'); // 自定義錯誤標誌
                }
            });
        });
    },

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

    async logout() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('cognito_id_token');
        localStorage.removeItem('cognito_access_token');
        localStorage.removeItem('cognito_refresh_token');
        setCognitoUserRequiringNewPassword(null);
        return Promise.resolve('/login');
    },

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

    async getPermissions() {
        const idToken = localStorage.getItem('cognito_id_token');
        if (!idToken) {
            console.log('getPermissions: No ID Token found.');
            return Promise.resolve('guest'); // 或者 'user'，或者返回 null
        }
    
        try {
            const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
            console.log('getPermissions: Decoded ID Token Payload:', decodedToken);
            const groups = decodedToken['cognito:groups'] || [];
            console.log('getPermissions: Extracted groups:', groups);
    
            if (groups.includes('admin')) {
                console.log('getPermissions: User is admin, returning "admin".');
                return Promise.resolve('admin'); // 直接返回 'admin' 字符串
            }
            console.log('getPermissions: User is not admin, returning "user".');
            return Promise.resolve('user'); // 直接返回 'user' 字符串
        } catch (e) {
            console.error('getPermissions: 解析 ID Token 失敗:', e);
            return Promise.resolve('guest'); // 錯誤時返回一個默認權限，例如 'guest'
        }
    }
};

export default authProvider;