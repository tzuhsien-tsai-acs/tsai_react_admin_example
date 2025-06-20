// src/LoginPage.js
import * as React from 'react';
import { useState } from 'react';
import { useLogin, useNotify, Notification as RaNotification  } from 'react-admin';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate
import { TextField, Button, Card, CardContent } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();
    const navigate = useNavigate(); // 實例化 useNavigate

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ username, password })
            .catch((error) => {
                if (error.redirectTo) {
                    // 如果錯誤對象有 redirectTo 屬性，則重定向
                    navigate(error.redirectTo, { state: error.state });
                } else {
                    notify('無效的用戶名或密碼', { type: 'warning' });
                }
            });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Card style={{ width: 400 }}>
                <CardContent>
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
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            登入
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <RaNotification />
        </div>
    );
};

export default LoginPage;