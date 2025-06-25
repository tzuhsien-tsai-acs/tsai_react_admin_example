// src/MyAppBar.tsx
import { AppBar, UserMenu, useTranslate, useGetIdentity, Logout } from 'react-admin';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const MyUserMenu = () => {
    const translate = useTranslate();
    const theme = useTheme();
    const { identity, isLoading, error } = useGetIdentity();

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
        console.error("MyUserMenu: 获取用户身份失败:", error);
        return (
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="error">
                    错误
                </Typography>
            </Box>
        );
    }

    // 如果 identity 不存在，显示“未登录”
    if (!identity) {
        return (
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="textPrimary">
                    未登录
                </Typography>
            </Box>
        );
    }

    // 确定要显示的文本：优先显示 email，如果 email 不存在，再尝试 fullName
    const displayEmail = identity.email || identity.fullName || "未知用户";

    return (
        <UserMenu>
            
            {/* 这里的 Box 是为了显示邮件地址或用户名 */}
            <Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="textPrimary">
                    {displayEmail}
                </Typography>
            </Box>

            {/* 登出按钮 - 使用 React-Admin 的默认路由处理 */}
                <Logout
                    sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: '#b39ddb', // 淺紫色，可以換成你想要的紫色
                            color: '#4a148c', // 深紫色字體
                        },
                      }}
                 />
        </UserMenu>
    );
};

const MyAppBar = (props) => (
    <AppBar {...props} userMenu={<MyUserMenu />} />
);

export default MyAppBar;
