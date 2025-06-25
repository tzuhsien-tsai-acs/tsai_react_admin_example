import { Admin, Resource, CustomRoutes, defaultTheme, radiantLightTheme, radiantDarkTheme, MenuItemLink } from 'react-admin';
import { Route } from 'react-router-dom';

// 导入您的 Layout 和 dataProvider (虽然暂时不使用 Layout)
import { Layout } from "./Layout"; // <-- 暂时注释掉 Layout 的导入
import { dataProvider } from "./dataProvider";

// 导入您的资源组件
import { UserList, UserShow } from "./users";
import { PostList } from "./posts";
import { PhotoList, PhotoEdit, PhotoShow } from "./photos";
import { CommentList } from "./comments";
import { AlbumList } from "./albums";
import YoutubePage from './YoutubePage';

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

export const App = () => (
  // <Admin> 组件应该包裹整个应用程序，并提供所有核心配置
  <Admin
    layout={Layout} // <-- 暂时移除这一行，让 React-Admin 使用默认布局和 AppBar
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={LoginPage}
    theme={radiantLightTheme}
    darkTheme={radiantDarkTheme}

  >
    <CustomRoutes>
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/youtube" element={<YoutubePage />} /> 
    </CustomRoutes>

    {permissions => {
            if (permissions === 'admin') {
                return (
                  <>
                    <Resource name="users" list={UserList} show={UserShow} icon={UserIcon}/>
                    <Resource name="posts" list={PostList} icon={PostIcon}/>
                    <Resource name="photos" list={PhotoList} edit={PhotoEdit} show={PhotoShow} icon={LocalSeeIcon}/>
                    <Resource name="comments" list={CommentList} icon={MessageIcon}/>
                    <Resource name="albums" list={AlbumList} icon={MenuBookIcon} />
                  </>
                );
            } else {
              return (
                  <>
                      <Resource name="posts" list={PostList} icon={PostIcon}/>
                      <Resource name="photos" list={PhotoList} show={PhotoShow} icon={LocalSeeIcon}/>
                      <Resource name="albums" list={AlbumList} icon={MenuBookIcon} />
                  </>
              );
          }
            return null;
      }
    }

  </Admin>
);
