import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: '面试刷题宝典 - 智能型面试刷题系统',
  description: '支持多题库管理、Excel导入、背题/刷题模式、错题本与收藏夹的面试刷题平台',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
