'use client';

import Link from 'next/link';
import { LearningDashboard } from '@/components/learning';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';

export default function LearningPage() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="min-h-screen bg-mesh-pattern">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                学習ダッシュボード
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LearningDashboard />
      </main>

      {/* トースト */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
