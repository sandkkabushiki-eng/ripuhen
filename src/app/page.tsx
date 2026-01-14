'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import ReplyInput from '@/components/ReplyInput';
import ReplyResults from '@/components/ReplyResults';
import { SettingsModal } from '@/components/settings';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';

export default function Home() {
  const { toasts, removeToast, isDarkMode } = useUIStore();

  // 初期ダークモード設定
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* 左側: 入力エリア */}
          <div className="h-full">
            <ReplyInput />
          </div>

          {/* 右側: 生成結果 */}
          <div className="h-full">
            <ReplyResults />
          </div>
        </div>
      </main>

      {/* 設定モーダル */}
      <SettingsModal />

      {/* トースト通知 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
