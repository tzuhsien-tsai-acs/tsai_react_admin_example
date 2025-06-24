// src/Layout.tsx
import type { ReactNode } from "react";
// 导入 react-admin 的 Layout 组件，并将其重命名为 RaLayout 以避免冲突
import { Layout as RaLayout, CheckForApplicationUpdate } from "react-admin";
// 导入您之前创建的 MyAppBar 组件
import MyAppBar from './MyAppBar.tsx';

export const Layout = ({ children }: { children: ReactNode }) => (
  // 将 appBar prop 设置为您的 MyAppBar 组件
  <RaLayout appBar={MyAppBar}>
    {children}
    <CheckForApplicationUpdate />
  </RaLayout>
);