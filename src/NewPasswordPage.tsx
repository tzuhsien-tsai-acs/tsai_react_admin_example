// src/NewPasswordPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 使用 react-router-dom 的 hook
import { useNotify } from 'react-admin';
import { CognitoUser } from 'amazon-cognito-identity-js'; // 引入 CognitoUser

import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material';

// 確保 poolData 和 userPool 在這裡也能被訪問到，或者從 authProvider 導出
const poolData = {
    UserPoolId: 'YOUR_COGNITO_USER_POOL_ID', // 請替換為您的 Cognito 用戶池 ID
    ClientId: 'YOUR_COGNITO_APP_CLIENT_ID' // 請替換為您的 Cognito 應用程式客戶端 ID
};
const userPool = new CognitoUserPool(poolData); // 再次實例化或從 authProvider 引入

const NewPasswordPage = () => {
    const navigate = useNavigate();
    const notify = useNotify();
    const location = useLocation(); // 用來獲取從 login 傳過來的 state

    // 從 state 中獲取用戶信息
    const { username, userAttributes } = location.state || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            notify('新密碼和確認密碼不匹配', { type: 'warning' });
            return;
        }

        if (!username) {
            notify('無法獲取用戶信息，請重新登入', { type: 'error' });
            navigate('/login'); // 沒有用戶名，重新回到登入頁
            return;
        }

        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        });

        try {
            await new Promise((resolve, reject) => {
                // 調用 completeNewPasswordChallenge
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                    onSuccess: (session) => {
                        console.log('新密碼設置成功', session);
                        // 密碼設置成功後，可以存儲 token 並重定向
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
            // 成功後重定向到首頁
            navigate('/');
        } catch (error) {
            notify(`設置新密碼失敗: ${error.message}`, { type: 'error' });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card style={{ width: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
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
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            設置密碼並登入
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Notification />
        </div>
    );
};

export default NewPasswordPage;