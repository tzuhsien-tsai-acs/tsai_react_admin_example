// src/LoginPage.jsx
import * as React from 'react';
import { useState } from 'react';
import { useLogin, useNotify, Notification as RaNotification } from 'react-admin'; // 使用別名 RaNotification
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate
import { TextField, Button, Card, CardContent, Typography } from '@mui/material'; // 確保導入 Typography

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();
    const navigate = useNavigate(); // 實例化 useNavigate

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ username, password })
            .then(() => {
                // 如果登入成功，不需要做任何事情，react-admin 會自動重定向
                // 或者如果您希望手動重定向到特定頁面，可以在這裡添加 navigate('/')
            })
            .catch((error) => {
                if (error.redirectTo) {
                    // 如果錯誤對象有 redirectTo 屬性，則重定向 (例如 New password required)
                    navigate(error.redirectTo, { state: error.state });
                } else {
                    notify(`登入失敗: ${error.message || '無效的用戶名或密碼'}`, { type: 'warning' });
                }
            });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card style={{ width: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                        登入
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="用戶名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="密碼"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            登入
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <RaNotification /> {/* 使用別名 */}
        </div>
    );
};

export default LoginPage;