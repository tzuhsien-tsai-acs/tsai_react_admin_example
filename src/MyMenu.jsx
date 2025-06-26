import React from 'react';
import { Menu, MenuItemLink, useResourceDefinitions } from 'react-admin';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PendingIcon from '@mui/icons-material/Pending';

const MyMenu = (props) => {
    const resources = useResourceDefinitions();
    return (
        <Menu {...props}>
            {Object.keys(resources).map(name => (
                <MenuItemLink
                    key={name}
                    to={`/${name}`}
                    primaryText={
                        resources[name].options && resources[name].options.label
                            ? resources[name].options.label
                            : resources[name].name
                    }
                    leftIcon={
                        resources[name].icon
                            ? React.cloneElement(resources[name].icon)
                            : undefined
                    }
                />
            ))}
            {/* 這裡手動加上 YouTube 動畫頁等非resource項目 */}
            <MenuItemLink to="/youtube" primaryText="YouTube 動畫" leftIcon={<YouTubeIcon />} />
            <MenuItemLink to="/chat" primaryText="聊天室" leftIcon={<PendingIcon />} />
        </Menu>
    );
};

export default MyMenu;