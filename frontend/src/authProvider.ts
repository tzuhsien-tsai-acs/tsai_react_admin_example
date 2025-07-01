import { AuthProvider } from 'react-admin';
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { getRoleFromToken, decodeToken } from './utils/auth';
import { AUTH_CONFIG } from './config/auth-env';

const userPool = new CognitoUserPool({
    UserPoolId: AUTH_CONFIG.userPoolId,
    ClientId: AUTH_CONFIG.userPoolWebClientId,
});

const authProvider: AuthProvider = {
    login: ({ username, password }) => {
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
                onSuccess: (session) => {
                    const idToken = session.getIdToken().getJwtToken();
                    localStorage.setItem('cognito_id_token', idToken);
                    resolve();
                },
                onFailure: (err) => {
                    console.error('Authentication failed:', err);
                    reject(err.message || 'Login failed');
                },
                newPasswordRequired: () => {
                    // This is the key part for the new password flow.
                    // The LoginPage expects this specific string.
                    reject('NEW_PASSWORD_REQUIRED');
                },
            });
        });
    },

    logout: () => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('cognito_id_token');
        return Promise.resolve();
    },

    checkError: (error) => {
        return Promise.resolve();
    },

    checkAuth: () => {
        return localStorage.getItem('cognito_id_token')
            ? Promise.resolve()
            : Promise.reject();
    },

    getPermissions: () => {
        const role = getRoleFromToken();
        return role ? Promise.resolve(role) : Promise.reject();
    },

    getIdentity: () => {
        const token = localStorage.getItem('cognito_id_token');
        const payload = decodeToken(token);

        if (payload) {
            return Promise.resolve({
                id: payload.sub, // 'sub' is the standard JWT claim for subject (user ID)
                fullName: payload.name || payload.email, // 優先使用 name，如果沒有則使用 email
                email: payload.email, // 額外提供 email 欄位
            });
        }

        // 如果無法解碼 token，則拒絕 promise
        return Promise.reject('Could not decode token');
    },
};

export default authProvider;