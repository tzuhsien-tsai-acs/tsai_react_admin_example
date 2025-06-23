// src/NewPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotify, Notification as RaNotification } from 'react-admin'; // 使用別名 RaNotification
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography, // <-- 確保這裡有導入 Typography
} from '@mui/material';

import { cognitoUserRequiringNewPassword } from './authProvider'; // <--- 導入存儲的實例

// --- 請務必確認這裡的 Cognito 用戶池 ID 和應用程式客戶端 ID 是否正確 ---
const poolData = {
    UserPoolId: 'ap-northeast-1_NC1G6gOeq', // 您的 Cognito 用戶池 ID
    ClientId: '4nhi3a8o179vf4ni8k0gdut28l'  // 您的 Cognito 應用程式客戶端 ID
};
// -------------------------------------------------------------

const userPool = new CognitoUserPool(poolData);

const NewPasswordPage = () => {
    const navigate = useNavigate();
    const notify = useNotify();
    const location = useLocation();

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [cognitoUserInstance, setCognitoUserInstance] = useState(null);
    const [userAttributesForChallenge, setUserAttributesForChallenge] = useState({});

    useEffect(() => {
        // 從 cognitoState 模塊中獲取預先存儲的 CognitoUser 實例
        const storedUser = getCognitoUserRequiringNewPassword();
        if (storedUser) {
            setCognitoUserInstance(storedUser);
            setUserAttributesForChallenge({});
        } else {
            notify('會話過期或無效，請重新登入。', { type: 'error' });
            navigate('/login');
        }

        // 組件卸載時清理存儲的實例
        return () => {
            clearCognitoUserRequiringNewPassword(); // <--- 使用 clear 函數來清理
        };
    }, [navigate, notify]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            notify('新密碼和確認密碼不匹配', { type: 'warning' });
            return;
        }

        if (!cognitoUserInstance) {
            notify('用戶會話信息丟失，請重新登入', { type: 'error' });
            navigate('/login');
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                cognitoUserInstance.completeNewPasswordChallenge(newPassword, {}, {
                    onSuccess: (session) => {
                        console.log('新密碼設置成功', session);
                        localStorage.setItem('cognito_id_token', session.getIdToken().getJwtToken());
                        localStorage.setItem('cognito_access_token', session.getAccessToken().getJwtToken());
                        localStorage.setItem('cognito_refresh_token', session.getRefreshToken().getToken());
                        notify('密碼設置成功，正在跳轉...', { type: 'success' });
                        resolve();
                    },
                    onFailure: (err) => {
                        console.error('設置新密碼失敗', err);
                        reject(err);
                    },
                });
            });
            // 成功後清理並重定向
            clearCognitoUserRequiringNewPassword(); // <--- 使用 clear 函數來清理
            navigate('/');
        } catch (error) {
            notify(`設置新密碼失敗: ${error.message}`, { type: 'error' });
        }
    };

    // 如果 cognitoUserInstance 還沒準備好，可以顯示載入中
    if (!cognitoUserInstance && location.state?.username) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography variant="h6">載入中...</Typography>
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
                    <Typography variant="body2" color="textSecondary" paragraph>
                        您的密碼需要更新。請設置一個新密碼。
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
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            設置密碼並登入
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <RaNotification />
        </div>
    );
};

export default NewPasswordPage;