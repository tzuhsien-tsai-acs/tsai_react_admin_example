import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UserList } from "./users";
import { PostList } from "./posts";
import { PhotoList } from "./photos";
import { CommentList } from "./comments";
import { AlbumList } from "./albums";
import authProvider from './authProvider'; 
import LoginPage from './LoginPage.jsx'; 
import NewPasswordPage from './NewPasswordPage.jsx';

import indigo from '@mui/material/colors/indigo';
import pink from '@mui/material/colors/pink';
import red from '@mui/material/colors/red';


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
    theme={theme}
    dataProvider={dataProvider} 
    authProvider={authProvider} 
    loginPage={LoginPage}
    // 添加 history 屬性以明確控制路由（如果需要，但通常 react-admin 會自行處理）
    // 這裡暫時不加，因為大多數情況下 react-admin 會自動處理內部路由。
  >
    {/* 將 CustomRoutes 放在這裡，這是標準做法 */}
    <CustomRoutes>
        {/* 確保 path 是正確的，並且 element 渲染的是正確的組件 */}
        <Route path="/new-password" element={<NewPasswordPage />} />
        {/* 如果未來有其他自定義路由，也放在這裡 */}
    </CustomRoutes>

    <Resource name="users" list={UserList} />
    <Resource name="posts" list={PostList} />
    <Resource name="photos" list={PhotoList} />
    <Resource name="comments" list={CommentList} />
    <Resource name="albums" list={AlbumList} />
  </Admin>
);