// src/cognitoState.js
// 這個模組用於在登入流程中臨時存儲需要設置新密碼的 Cognito 用戶實例。
// 這樣做可以避免直接導出可變的 let 變數可能引起的打包工具問題，
// 並提供更清晰的狀態管理。

let _cognitoUserInstance = null; // 私有變數，用於實際存儲 CognitoUser 實例

/**
 * 設置需要設置新密碼的 Cognito 用戶實例。
 * @param {import('amazon-cognito-identity-js').CognitoUser | null} user - Cognito 用戶實例或 null 以清除。
 */
export const setCognitoUserRequiringNewPassword = (user) => {
    _cognitoUserInstance = user;
};

/**
 * 獲取當前需要設置新密碼的 Cognito 用戶實例。
 * @returns {import('amazon-cognito-identity-js').CognitoUser | null}
 */
export const getCognitoUserRequiringNewPassword = () => {
    return _cognitoUserInstance;
};

/**
 * 清除存儲的 Cognito 用戶實例。
 */
export const clearCognitoUserRequiringNewPassword = () => {
    _cognitoUserInstance = null;
};