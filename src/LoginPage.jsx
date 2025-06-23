// src/LoginPage.jsx
import * as React from 'react';
import { useState } from 'react';
import { useLogin, useNotify, Notification as RaNotification } from 'react-admin';
// 不再需要 useNavigate，因為 react-admin 的 useLogin 會處理 redirectTo
// import { useNavigate } from 'react-router-dom';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin(); // react-admin 提供的登入鉤子
    const notify = useNotify(); // react-admin 提供的通知鉤子
    // const navigate = useNavigate(); // 移除 useNavigate

    /**
     * 處理登入表單提交。
     * @param {React.FormEvent} e - 表單事件對象。
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        // 調用 useLogin 鉤子進行登入
        login({ username, password })
            .then(() => {
                // 如果 Promise resolve，表示登入成功（或新密碼設置成功），
                // react-admin 的 useLogin 會自動將用戶重定向到主頁或指定的 `/` 路徑。
                // 因此這裡通常不需要手動進行 navigate。
            })
            .catch((error) => {
                // 如果 Promise reject，表示登入失敗。
                // 如果 error 對象包含 redirectTo 屬性，useLogin 會自動處理重定向。
                // 對於其他類型的錯誤（例如無效的用戶名/密碼），彈出通知。
                notify(`登入失敗: ${error.message || '無效的用戶名或密碼'}`, { type: 'warning' });
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
            <RaNotification /> {/* 顯示 react-admin 的通知 */}
        </div>
    );
};

export default LoginPage;