import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar';
import MyMenu from './MyMenu';

// 將自訂的 AppBar 傳遞給 React Admin 的 Layout
const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} menu={MyMenu}/>;

export default MyLayout;