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

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider} authProvider={authProvider} loginPage={LoginPage}>

    <CustomRoutes>
            <Route path="/new-password" element={<NewPasswordPage />} />
    </CustomRoutes>
    <Resource name="users" list={UserList} />
    <Resource name="posts" list={PostList} />
    <Resource name="photos" list={PhotoList} />
    <Resource name="comments" list={CommentList} />
    <Resource name="albums" list={AlbumList} />
  </Admin>
);
