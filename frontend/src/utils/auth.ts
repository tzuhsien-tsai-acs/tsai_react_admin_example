// src/utils/auth.ts

/**
 * 解碼 JWT token 並回傳其 payload。
 * @param token - JWT token 字串。
 * @returns payload 物件，或在失敗時回傳 null。
 */
export const decodeToken = (token: string | null): any | null => {
    if (!token) return null;
    try {
        // JWT 的第二部分是 payload，使用 base64 解碼
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
}

/**
 * 從儲存在 localStorage 的 token 中取得使用者角色。
 * @returns 'admin' 或 'user'，或在失敗時回傳 null。
 */
export const getRoleFromToken = (): 'admin' | 'user' | null => {
    const token = localStorage.getItem('cognito_id_token');
    const payload = decodeToken(token);
    if (!payload) return null;

    // 在 AWS Cognito 中，使用者群組/角色通常儲存在 'cognito:groups' 這個欄位中
    const groups = payload['cognito:groups'];
    
    // 檢查使用者是否屬於 'admin' 群組
    if (groups && Array.isArray(groups) && groups.includes('admin')) {
        return 'admin';
    }
    
    // 如果不是 admin，則回傳預設的 'user' 角色
    return 'user';
}
