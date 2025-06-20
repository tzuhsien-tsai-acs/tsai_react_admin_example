if (typeof global === 'undefined') {
  (window as any).global = window;
}
import { Admin, Resource } from 'react-admin';
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UserList } from "./users";
import { PostList } from "./posts";
import { PhotoList } from "./photos";
import { CommentList } from "./comments";
import { AlbumList } from "./albums";
import authProvider from './authProvider'; 
import LoginPage from './LoginPage'; 

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider} authProvider={authProvider}>
    <Resource name="users" list={UserList} />
    <Resource name="posts" list={PostList} />
    <Resource name="photos" list={PhotoList} />
    <Resource name="comments" list={CommentList} />
    <Resource name="albums" list={AlbumList} />
  </Admin>
);
