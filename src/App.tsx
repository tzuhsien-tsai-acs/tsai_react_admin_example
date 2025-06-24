import { Admin, Resource, CustomRoutes, defaultTheme, radiantLightTheme, radiantDarkTheme } from 'react-admin';
import { Route } from 'react-router-dom';
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UserList, UserShow } from "./users";
import { PostList } from "./posts";
import { PhotoList, PhotoEdit, PhotoShow } from "./photos";
import { CommentList } from "./comments";
import { AlbumList } from "./albums";
import authProvider from './authProvider'; 
import LoginPage from './LoginPage.jsx'; 
import NewPasswordPage from './NewPasswordPage.jsx';
import PostIcon from "@mui/icons-material/Book";
import UserIcon from "@mui/icons-material/Group";
import LocalSeeIcon from '@mui/icons-material/LocalSee';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { indigo, pink, red } from '@mui/material/colors';

const myTheme = {
  ...defaultTheme,
  palette: {
      mode: 'dark',
      primary: indigo,
      secondary: pink,
      error: red,
  },
  typography: {
      // Use the system font instead of the default Roboto font.
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
  <Admin 
    layout={Layout} 
    dataProvider={dataProvider} 
    authProvider={authProvider} 
    loginPage={LoginPage}
    theme={radiantLightTheme}
    darkTheme={radiantDarkTheme}
    // 添加 history 屬性以明確控制路由（如果需要，但通常 react-admin 會自行處理）
    // 這裡暫時不加，因為大多數情況下 react-admin 會自動處理內部路由。
  >
    {/* 將 CustomRoutes 放在這裡，這是標準做法 */}
    <CustomRoutes>
        {/* 確保 path 是正確的，並且 element 渲染的是正確的組件 */}
        <Route path="/new-password" element={<NewPasswordPage />} />
        {/* 如果未來有其他自定義路由，也放在這裡 */}
    </CustomRoutes>

    {permissions => { // permissions 会是 'admin' 或 'user'
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
              // 如果是普通用户，只显示部分资源，同样需要包裹起来
              return (
                  <>
                      <Resource name="posts" list={PostList} icon={PostIcon}/>
                      <Resource name="photos" list={PhotoList} show={PhotoShow} icon={LocalSeeIcon}/>
                      <Resource name="albums" list={AlbumList} icon={MenuBookIcon} />
                  </>
              );
          }
            // 如果不是 admin，则不显示或不返回该资源
            return null;
      }
    }

  </Admin>
);