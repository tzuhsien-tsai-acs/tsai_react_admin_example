import type { ReactNode } from "react";
import { Layout as RALayout, CheckForApplicationUpdate } from "react-admin";
import MyAppBar from './MyAppBar'; // 导入您创建的 MyAppBar
import MyMenu from './MyMenu';

export const Layout = ({ children }: { children: ReactNode }) => (
  // 将 appBar prop 设置为您的 MyAppBar 组件
  <RALayout appBar={MyAppBar} menu={MyMenu}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
