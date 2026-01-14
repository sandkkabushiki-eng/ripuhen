'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useAccounts } from '@/hooks/useAccounts';
import { useRegularUsers } from '@/hooks/useRegularUsers';
import { useLearnedPatterns } from '@/hooks/useLearnedPatterns';
import { useReplyHistory } from '@/hooks/useReplyHistory';

const EMOJI_LABELS: Record<string, string> = {
  none: '使用しない',
  low: '控えめ',
  medium: '普通',
  high: '多め',
};

const LENGTH_LABELS: Record<string, string> = {
  short: '短め',
  medium: '普通',
  long: '長め',
};

export default function LearningDashboard() {
  const { selectedAccount } = useAccounts();
  const { regularUsers } = useRegularUsers();
  const { patterns, fetchPatterns, deletePattern } = useLearnedPatterns();
  const { getHistoryStats } = useReplyHistory();
  const [stats, setStats] = useState({ editRate: 0, totalCount: 0, editedCount: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'users'>('overview');

  useEffect(() => {
    if (selectedAccount) {
      fetchPatterns(selectedAccount.id);
      getHistoryStats(selectedAccount.id).then(setStats);
    }
  }, [selectedAccount, fetchPatterns, getHistoryStats]);

  const patternTypeLabels: Record<string, string> = {
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
      {/* タブナビゲーション */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📊 概要・設定
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          🧠 学習パターン ({patterns.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          ⭐ 常連ユーザー ({regularUsers.length})
        </button>
      </div>

      {/* 概要・設定タブ */}
      {activeTab === 'overview' && (
        <>
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

          {/* 現在のアカウント設定 */}
          <Card variant="default">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              現在の生成設定「{selectedAccount.name}」
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">一人称</span>
                  <span className="font-medium text-gray-800 dark:text-white">{selectedAccount.firstPerson}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">口調</span>
                  <span className="font-medium text-gray-800 dark:text-white">{selectedAccount.tone}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">絵文字</span>
                  <span className="font-medium text-gray-800 dark:text-white">{EMOJI_LABELS[selectedAccount.emojiLevel] || selectedAccount.emojiLevel}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">返信の長さ</span>
                  <span className="font-medium text-gray-800 dark:text-white">{LENGTH_LABELS[selectedAccount.replyLength] || selectedAccount.replyLength}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">キャラクター設定</span>
                  <p className="mt-1 text-gray-800 dark:text-white text-sm">
                    {selectedAccount.persona || '未設定'}
                  </p>
                </div>
                {selectedAccount.additionalInstructions && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">追加の指示</span>
                    <p className="mt-1 text-gray-800 dark:text-white text-sm">
                      {selectedAccount.additionalInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* プロンプトプレビュー */}
          <Card variant="glass" className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AIへの指示（プロンプト概要）
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 font-mono bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              <p>• 一人称「{selectedAccount.firstPerson}」で話す</p>
              <p>• 口調は「{selectedAccount.tone}」</p>
              <p>• 絵文字は{EMOJI_LABELS[selectedAccount.emojiLevel]}で使用</p>
              <p>• 返信の長さは{LENGTH_LABELS[selectedAccount.replyLength]}</p>
              {patterns.filter(p => p.frequency >= 2).length > 0 && (
                <p className="text-primary-600 dark:text-primary-400">
                  • 学習パターン {patterns.filter(p => p.frequency >= 2).length}件を反映中
                </p>
              )}
              {regularUsers.length > 0 && (
                <p className="text-amber-600 dark:text-amber-400">
                  • 常連ユーザー {regularUsers.length}名の情報を考慮
                </p>
              )}
            </div>
          </Card>
        </>
      )}

      {/* 学習パターンタブ */}
      {activeTab === 'patterns' && (
        <Card variant="default">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            学習したパターン
            {patterns.filter(p => p.frequency >= 2).length > 0 && (
              <span className="text-sm font-normal text-primary-600 dark:text-primary-400">
                （{patterns.filter(p => p.frequency >= 2).length}件がプロンプトに反映中）
              </span>
            )}
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
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    pattern.frequency >= 2
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">
                        {patternTypeLabels[pattern.patternType] || pattern.patternType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        pattern.frequency >= 2
                          ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {pattern.frequency}回
                        {pattern.frequency >= 2 && ' ✓反映中'}
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

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            💡 頻度2回以上のパターンが自動的にAIへの指示に反映されます
          </div>
        </Card>
      )}

      {/* 常連ユーザータブ */}
      {activeTab === 'users' && (
        <Card variant="default">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            常連ユーザー一覧
          </h3>

          {regularUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>常連ユーザーはまだ登録されていません</p>
              <p className="text-sm mt-1">設定画面から登録できます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {regularUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        @{user.username}
                      </span>
                      {user.nickname && (
                        <span className="text-sm text-amber-600 dark:text-amber-400">
                          （{user.nickname}）
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium">
                      {user.interactionCount}回
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {user.relationship && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 dark:text-gray-400">関係性:</span>
                        <span className="text-gray-700 dark:text-gray-300">{user.relationship}</span>
                      </div>
                    )}
                    {user.characteristics && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 dark:text-gray-400">特徴:</span>
                        <span className="text-gray-700 dark:text-gray-300">{user.characteristics}</span>
                      </div>
                    )}
                    {user.preferredResponse && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">対応方針:</span>
                        <span className="text-gray-700 dark:text-gray-300">{user.preferredResponse}</span>
                      </div>
                    )}
                    {user.notes && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">メモ:</span>
                        <span className="text-gray-700 dark:text-gray-300">{user.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
            💡 常連ユーザーにはパーソナライズされた返信が生成されます
          </div>
        </Card>
      )}
    </div>
  );
}
