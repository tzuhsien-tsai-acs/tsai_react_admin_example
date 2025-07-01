import * as React from 'react';
import { useGetIdentity, Logout } from 'react-admin';
import {
    Avatar,
    Box,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
    Tooltip,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const MyUserMenu = () => {
    const { identity, isLoading } = useGetIdentity();
    const [anchorEl, setAnchorEl] = React.useState(null);

    if (isLoading) return null;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={identity?.fullName || ''}>
                <Box
                    onClick={handleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: 'inherit',
                    }}
                >
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        <AccountCircle />
                    </Avatar>
                    <Typography
                        variant="body1"
                        color="inherit"
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px', // 避免名稱過長時破壞排版
                        }}
                    >
                        {identity?.fullName}
                    </Typography>
                </Box>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                sx={{ mt: 1 }}
            >
                <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}>
                    <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}>
                        {identity?.email}
                    </ListItemText>
                </MenuItem>
                <Logout icon={<ExitToAppIcon />} />
            </Menu>
        </>
    );
};

export default MyUserMenu;