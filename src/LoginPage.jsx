// src/LoginPage.jsx
import * as React from 'react';
import { useState } from 'react';
import { useLogin, useNotify, Notification as RaNotification } from 'react-admin';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();

    /**
     * 處理登入表單提交。
     * @param {React.FormEvent} e - 表單事件對象。
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        login({ username, password })
            .then(() => {
                // 如果 Promise resolve，表示登入成功。
                // react-admin 的 useLogin 會自動將用戶重定向到主頁或指定的 `/` 路徑。
                // 因此這裡不需要手動進行 navigate。
            })
            .catch((error) => {
                // 這裡我們明確檢查 error 對象是否有 redirectTo 屬性。
                // 如果有，說明這是 authProvider 發出的重定向信號（例如 newPasswordRequired）。
                // 此時 useLogin 應該會自行處理重定向。
                // 我們不應該在這裡顯示通知，避免在重定向時彈出錯誤通知。
                if (error && error.redirectTo) {
                    console.log('Login catch: Redirect detected, letting react-admin handle it.', error); //
                    // 注意：這裡不需執行任何動作，因為 useLogin 會自動導航。
                    // 以前的 "會話過期或無效，請重新登入" 通知應該是 NewPasswordPage 判斷 !storedUser 時發出的，
                    // 這應該是另一個獨立的問題，或是一個後續鏈式的結果。
                } else {
                    // 對於沒有 redirectTo 屬性的普通登入錯誤，顯示通知。
                    // error.message 會包含 authProvider 傳遞過來的錯誤訊息。
                    notify(`登入失敗: ${error.message || '未知錯誤'}`, { type: 'warning' });
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
            <RaNotification />
        </div>
    );
};

export default LoginPage;