import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 상세페이지 메이커',
  description: 'AI가 자동으로 전환율 높은 상세페이지를 생성합니다. 상품 정보만 입력하면 디자인, 이미지, 카피를 한번에!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
