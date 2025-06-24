// src/MyAppBar.js
import React from 'react';
import { AppBar, UserMenu, MenuItemLink, useTranslate, useGetIdentity } from 'react-admin';
import { Typography, Box, CircularProgress } from '@mui/material';
import ExitIcon from '@mui/icons-material/ExitToApp';

const MyUserMenu = () => {
    const translate = useTranslate();
    const { identity, isLoading, error } = useGetIdentity(); // 使用 useGetIdentity 获取用户身份

    if (isLoading) {
        return (
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography variant="subtitle1" color="textPrimary" sx={{ ml: 1 }}>
                    加载中...
                </Typography>
            </Box>
        );
    }

    if (error) {
        console.error("获取用户身份失败:", error);
        return (
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="error">
                    错误
                </Typography>
            </Box>
        );
    }

    // 确定要显示的文本：优先显示 email，如果 email 不存在，再尝试 fullName，最后回退到 '未登录'
    const displayEmail = identity ? identity.email || identity.fullName || "未登录" : "未登录";

    return (
        <UserMenu>
            {/* 这里的 Box 是为了显示邮件地址或用户名 */}
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="textPrimary">
                    {displayEmail} {/* 显示获取到的电子邮件或用户名 */}
                </Typography>
            </Box>

            {/* 登出按钮 */}
            <MenuItemLink
                to="/logout"
                primaryText={translate('ra.auth.logout')}
                leftIcon={<ExitIcon />}
            />
        </UserMenu>
    );
};

// MyAppBar 保持不变，它将 MyUserMenu 传递给 AppBar
const MyAppBar = (props) => (
    <AppBar {...props} userMenu={<MyUserMenu />} />
);

export default MyAppBar;