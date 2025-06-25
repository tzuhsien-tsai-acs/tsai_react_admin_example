// src/NewPasswordPage.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
// *** 關鍵改變：從 'react-admin' 導入 Notification ***
import { useNotify, Notification } from 'react-admin'; 
import { TextField, Button, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { getCognitoUserRequiringNewPassword, clearCognitoUserRequiringNewPassword } from './cognitoState.js';
import { useNavigate, useLocation } from 'react-router-dom';

// 導入 Cognito 相關類，以便在需要時重新構建 CognitoUser 實例
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';

// 複製 authProvider.js 中的 poolData，確保一致性
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};
const userPool = new CognitoUserPool(poolData);

const NewPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // 用於存儲 CognitoUser 實例
    const notify = useNotify();
    const navigate = useNavigate();
    const location = useLocation(); // 獲取路由 state

    useEffect(() => {
        let storedUser = getCognitoUserRequiringNewPassword();
        let currentUsername = location.state?.username; // 從路由 state 獲取 username

        if (storedUser) {
            // 如果成功從 cognitoState 獲取到用戶實例
            setUser(storedUser);
            setLoading(false);
            console.log("NewPasswordPage: Found stored Cognito user.");
        } else if (currentUsername) {
            // 如果 cognitoState 中沒有用戶實例，但路由 state 中有 username
            // 嘗試從 username 重新構造 CognitoUser 實例
            console.warn("NewPasswordPage: Stored Cognito user not found, attempting to reconstruct from username in state.");
            const reconstructedUser = new CognitoUser({
                Username: currentUsername,
                Pool: userPool,
            });
            setUser(reconstructedUser);
            setLoading(false);
        } else {
            // 既沒有 storedUser 也沒有 username，說明會話無效
            notify('會話過期或無效，請重新登入。', { type: 'warning' });
            clearCognitoUserRequiringNewPassword();
            navigate('/login');
            console.log("NewPasswordPage: No stored Cognito user or username in state, redirecting to login.");
        }
    }, [notify, navigate, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            notify('新密碼和確認密碼不匹配！', { type: 'error' });
            return;
        }

        if (!user) {
            notify('無法設置新密碼：用戶會話無效，請重新登入。', { type: 'error' });
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve, reject) => {
                user.completeNewPasswordChallenge(newPassword, user.challengeParam, {
                    onSuccess: (sessionResult) => {
                        console.log('新密碼設置成功，用戶已自動登入。', sessionResult);
                        clearCognitoUserRequiringNewPassword();
                        // 將 Cognito 憑證保存到 localStorage
                        localStorage.setItem('cognito_id_token', sessionResult.getIdToken().getJwtToken());
                        localStorage.setItem('cognito_access_token', sessionResult.getAccessToken().getJwtToken());
                        localStorage.setItem('cognito_refresh_token', sessionResult.getRefreshToken().getToken());
                        resolve();
                    },
                    onFailure: (err) => {
                        console.error('設置新密碼失敗:', err);
                        reject(err.message || '設置新密碼失敗');
                    }
                });
            });

            notify('密碼設置成功，您已登入。', { type: 'success' });
            navigate('/'); // 導航到應用程式主頁

        } catch (error) {
            console.error('處理新密碼設置失敗:', error);
            notify(`設置新密碼失敗: ${error}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Card style={{ width: 400 }}>
                    <CardContent>
                        <Typography variant="h6" component="h3" align="center" color="error">
                            錯誤：無法加載用戶信息。請嘗試重新登入。
                        </Typography>
                        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/login')}>
                            返回登入頁
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card style={{ width: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                        設置新密碼
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                        您的密碼需要變更，請設置一個新密碼。
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="新密碼"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="確認新密碼"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : '設置新密碼並登入'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            {/* *** 這裡使用的是從 react-admin 導入的 Notification *** */}
            <Notification /> 
        </div>
    );
};

export default NewPasswordPage;