import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'リプライ返信ジェネレーター | SNS返信を一括生成',
  description: 'X（Twitter）やInstagramのリプライに対する返信をAIで一括生成。常連ユーザーにはパーソナライズされた返信を自動作成。',
  keywords: ['SNS', 'リプライ', '返信', 'AI', 'Claude', 'Twitter', 'Instagram', '自動生成'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-mesh-pattern">
        {children}
      </body>
    </html>
  );
}
