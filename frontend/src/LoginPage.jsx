// src/LoginPage.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLogin, useNotify, Notification as RaNotification } from 'react-admin';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Card, CardContent, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const login = useLogin();
    const notify = useNotify();
    const navigate = useNavigate();
    const { t } = useTranslation();

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
                    notify(t('login.failure', { error: error || t('unknownError') }), { type: 'warning' });
                }
            });
    };

    return (
        // 加上 position: 'relative' 作為定位基準
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative' }}>
            <LanguageSwitcher sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }} />
            <Card style={{ width: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                        {t('login.title')}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label={t('login.username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label={t('login.password')}
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
                            label={t('login.rememberMe')}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            {t('login.button')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <RaNotification />
        </div>
    );
};

export default LoginPage;