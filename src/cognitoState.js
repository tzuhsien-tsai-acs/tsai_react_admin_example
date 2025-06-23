// src/cognitoState.js
let _cognitoUserInstance = null; // 使用一個內部變數來存儲

export const setCognitoUserRequiringNewPassword = (user) => {
    _cognitoUserInstance = user;
};

export const getCognitoUserRequiringNewPassword = () => {
    return _cognitoUserInstance;
};

export const clearCognitoUserRequiringNewPassword = () => {
    _cognitoUserInstance = null;
};