import * as React from 'react';
import { AppBar } from 'react-admin';
import LanguageSwitcher from './LanguageSwitcher';
import MyUserMenu from './MyUserMenu'; // 匯入我們新的使用者選單

// 建立一個自訂元件，將語言切換器和使用者選單群組在一起
const CustomUserMenu = () => (
    <>
        <LanguageSwitcher sx={{ mr: 1 }} />
        <MyUserMenu />
    </>
);

const MyAppBar = (props) => (
    // 我們不再手動加入 UserMenu，而是將自訂的群組元件傳遞給 userMenu 屬性。
    // 這樣可以確保 React Admin 正確管理 AppBar 的內容，避免重複。
    <AppBar {...props} userMenu={<CustomUserMenu />} />
);

export default MyAppBar;
