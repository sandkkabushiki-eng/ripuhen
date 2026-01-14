'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useAccounts } from '@/hooks/useAccounts';
import { useLearnedPatterns } from '@/hooks/useLearnedPatterns';
import { useReplyHistory } from '@/hooks/useReplyHistory';

export default function LearningDashboard() {
  const { selectedAccount } = useAccounts();
  const { patterns, fetchPatterns, deletePattern } = useLearnedPatterns();
  const { getHistoryStats } = useReplyHistory();
  const [stats, setStats] = useState({ editRate: 0, totalCount: 0, editedCount: 0 });

  useEffect(() => {
    if (selectedAccount) {
      fetchPatterns(selectedAccount.id);
      getHistoryStats(selectedAccount.id).then(setStats);
    }
  }, [selectedAccount, fetchPatterns, getHistoryStats]);

  const patternTypeLabels = {
    phrase_replacement: '📝 フレーズ置換',
    tone_adjustment: '🎭 トーン調整',
    length_preference: '📏 長さの好み',
    emoji_change: '😀 絵文字変更',
    structure_change: '🏗️ 構造変更',
  };

  if (!selectedAccount) {
    return (
      <Card variant="default" className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          アカウントを選択してください
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {stats.totalCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            総返信数
          </p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
            {stats.editedCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            編集された返信
          </p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.editRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            編集率
          </p>
        </Card>
      </div>

      {/* 学習パターン一覧 */}
      <Card variant="default">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          学習したパターン ({patterns.length}件)
        </h3>

        {patterns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p>まだ学習データがありません</p>
            <p className="text-sm mt-1">返信を編集すると、好みのパターンを自動学習します</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">
                      {patternTypeLabels[pattern.patternType] || pattern.patternType}
                    </span>
                    <span className="badge bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                      {pattern.frequency}回
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400 line-through">
                      {pattern.originalPattern}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {pattern.preferredPattern}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => deletePattern(pattern.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 説明 */}
      <Card variant="glass" className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          学習機能について
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            生成された返信を編集すると、あなたの好みを自動で学習します
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            学習したパターンは次回以降の返信生成に反映されます
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            誤学習したパターンは手動で削除できます
          </li>
        </ul>
      </Card>
    </div>
  );
}
