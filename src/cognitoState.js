// src/cognitoState.js
let _cognitoUserInstance = null; // 私有變數，用於實際存儲 CognitoUser 實例

export const setCognitoUserRequiringNewPassword = (user) => {
    _cognitoUserInstance = user;
};

export const getCognitoUserRequiringNewPassword = () => {
    return _cognitoUserInstance;
};

export const clearCognitoUserRequiringNewPassword = () => {
    _cognitoUserInstance = null;
};