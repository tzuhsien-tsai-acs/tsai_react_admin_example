import { Admin, Resource, CustomRoutes, defaultTheme, radiantLightTheme, radiantDarkTheme, MenuItemLink } from 'react-admin';
import { useState, useEffect, useMemo } from 'react';
import { Route } from 'react-router-dom';

// 导入您的 Layout 和 dataProvider (虽然暂时不使用 Layout)
import { dataProvider } from "./dataProvider";
import MyLayout from './MyLayout.jsx';

// 导入您的资源组件
import { UserList, UserShow } from "./users";
import { PostList } from "./posts";
import { PhotoList, PhotoEdit, PhotoShow } from "./photos";
import { CommentList } from "./comments";
import { AlbumList } from "./albums";
import YoutubePage from './YoutubePage'; 
import i18n from './i18n';
import ChatPage from "./ChatPage"

// 导入认证和登录相关组件
import authProvider from './authProvider';
import LoginPage from './LoginPage.jsx';
import NewPasswordPage from './NewPasswordPage.jsx';

// 导入 Material-UI Icons
import PostIcon from "@mui/icons-material/Book";
import UserIcon from "@mui/icons-material/Group";
import LocalSeeIcon from '@mui/icons-material/LocalSee';
import MessageIcon from "@mui/icons-material/Message";
import MenuBookIcon from "@mui/icons-material/MenuBook";

// 导入 Material-UI 颜色
import { indigo, pink, red } from '@mui/material/colors';

// 自定义主题 (保持不变)
const myTheme = {
  ...defaultTheme,
  palette: {
      mode: 'dark',
      primary: indigo,
      secondary: pink,
      error: red,
  },
  typography: {
      fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Arial',
          'sans-serif',
      ].join(','),
  },
  components: {
      ...defaultTheme.components,
      MuiTextField: {
          defaultProps: {
              variant: 'outlined' as const,
          },
      },
      MuiFormControl: {
          defaultProps: {
              variant: 'outlined' as const,
          },
      },
  },
};

export const App = () => {
  // 為了讓 React Admin 在語言切換時能即時刷新，我們需要將 i18nProvider 與 React 的 state 綁定。
  const [locale, setLocale] = useState(i18n.language);

  // 使用 useMemo 來確保 i18nProvider 只在 locale 改變時才重新建立，避免不必要的渲染。
  const memoizedI18nProvider = useMemo(() => ({
      translate: (key, options) => i18n.t(key, options),
      changeLocale: (locale) => i18n.changeLanguage(locale),
      getLocale: () => locale,
  }), [locale]);

  // 使用 useEffect 來監聽 i18next 的語言變更事件，並更新我們的 state。
  useEffect(() => {
      const onLanguageChanged = (lng) => {
          setLocale(lng);
      };
      i18n.on('languageChanged', onLanguageChanged);
      return () => {
          i18n.off('languageChanged', onLanguageChanged);
      };
  }, []);

  return (
    <Admin
      layout={MyLayout}
      dataProvider={dataProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
      i18nProvider={memoizedI18nProvider} // 使用與 state 綁定的 provider
      theme={radiantLightTheme}
      darkTheme={radiantDarkTheme}
    >
      <CustomRoutes>
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/youtube" element={<YoutubePage />} /> 
          <Route path="/chat" element={<ChatPage />} />
      </CustomRoutes>

      {/* 
        使用 function-as-a-child 模式來根據權限動態註冊資源。
        這種寫法更簡潔，且與 MyMenu.jsx 中的邏輯保持一致。
      */}
      {permissions => (
          <>
              {permissions === 'admin' && <Resource name="users" list={UserList} show={UserShow} icon={UserIcon}/>}
              <Resource name="posts" list={PostList} icon={PostIcon}/>
              <Resource name="photos" list={PhotoList} edit={PhotoEdit} show={PhotoShow} icon={LocalSeeIcon}/>
              {permissions === 'admin' && <Resource name="comments" list={CommentList} icon={MessageIcon}/>}
              <Resource name="albums" list={AlbumList} icon={MenuBookIcon} />
          </>
      )}
    </Admin>
  );
};
