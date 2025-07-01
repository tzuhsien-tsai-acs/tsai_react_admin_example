import { Menu } from 'react-admin';
import { useGetPermissions } from 'react-admin';
import { useTranslation } from 'react-i18next';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';

const MyMenu = () => {
    const { t } = useTranslation();
    // 使用 isLoading 來確保在權限加載完成後才渲染選單，避免初始渲染時權限為 undefined
    const { isLoading, permissions } = useGetPermissions();

    if (isLoading) {
        return null; // 在權限加載期間，不渲染任何內容
    }

    return (
        <Menu>
            {/* 自訂頁面連結 */}
            <Menu.Item to="/youtube" primaryText={t('custom.pages.youtube')} leftIcon={<YouTubeIcon />} />
            <Menu.Item to="/chat" primaryText={t('custom.pages.chat')} leftIcon={<ChatIcon />} />
            
            {/* 資源頁面連結 (與 App.tsx 中的權限邏輯保持一致) */}
            {permissions === 'admin' && <Menu.ResourceItem name="users" />}
            <Menu.ResourceItem name="posts" />
            <Menu.ResourceItem name="photos" />
            {permissions === 'admin' && <Menu.ResourceItem name="comments" />}
            <Menu.ResourceItem name="albums" />
        </Menu>
    );
};

export default MyMenu;