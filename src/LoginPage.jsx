// src/LoginPage.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLogin, useNotify, Notification as RaNotification } from 'react-admin';
import { TextField, Button, Card, CardContent, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const login = useLogin();
    const notify = useNotify();
    const navigate = useNavigate();

    // 預設載入時自動帶入帳號
    useEffect(() => {
        const rememberedUsername = localStorage.getItem('remembered_username') || '';
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }
    }, []);

    /**
     * 處理登入表單提交。
     * @param {React.FormEvent} e - 表單事件對象。
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        login({ username, password })
            .then(() => {
                if (rememberMe) {
                    localStorage.setItem('remembered_username', username);
                } else {
                    localStorage.removeItem('remembered_username');
                }
                // react-admin 的 useLogin 會自動將用戶重定向到主頁或指定的 `/` 路徑。
            })
            .catch((error) => {
                // *** 關鍵改變：檢查錯誤訊息是否是我們自定義的 'NEW_PASSWORD_REQUIRED' ***
                if (error === 'NEW_PASSWORD_REQUIRED') {
                    console.log('Detected NEW_PASSWORD_REQUIRED, navigating to /new-password');
                    // 手動導航到新密碼頁面，並傳遞 username 作為 state
                    navigate('/new-password', { state: { username: username } });
                } else {
                    // 對於其他普通登入錯誤，顯示通知。
                    notify(`登入失敗: ${error || '未知錯誤'}`, { type: 'warning' });
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="記住我"
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
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