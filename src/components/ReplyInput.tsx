'use client';

import { useState } from 'react';
import { Button, Card, Textarea } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useRegularUsers } from '@/hooks/useRegularUsers';
import { parseReplies } from '@/lib/parser/replyParser';
import RegularUserBadge from './RegularUserBadge';

export default function ReplyInput() {
  const [inputText, setInputText] = useState('');
  const { parsedComments, setParsedComments, addToast } = useUIStore();
  const { regularUsers } = useRegularUsers();

  const handleParse = () => {
    if (!inputText.trim()) {
      addToast('リプライを入力してください', 'error');
      return;
    }

    const comments = parseReplies(inputText, regularUsers);
    
    if (comments.length === 0) {
      addToast('コメントを解析できませんでした。形式を確認してください。', 'error');
      return;
    }

    setParsedComments(comments);
    addToast(`${comments.length}件のコメントを解析しました`, 'success');
  };

  const handleClear = () => {
    setInputText('');
    setParsedComments([]);
  };

  const regularCount = parsedComments.filter((c) => c.regularUser).length;

  return (
    <Card variant="default" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          リプライ入力
        </h2>
        {inputText && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            クリア
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`リプライをここに貼り付けてください

【X (Twitter) 形式】
ユーザー名: コメント内容

【Instagram形式】※ユーザー名なしでOK
コメント内容
X時間前返信

例:
tanaka_taro: いい投稿ですね！

または

可愛い❤️
19時間前返信`}
          className="flex-1 min-h-[200px]"
        />

        <Button onClick={handleParse} variant="primary" className="w-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          解析する
        </Button>
      </div>

      {/* 解析結果プレビュー */}
      {parsedComments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              解析結果 ({parsedComments.length}件)
            </h3>
            {regularCount > 0 && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                常連 {regularCount}名
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {parsedComments.map((comment, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  comment.regularUser
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    @{comment.username}
                  </span>
                  {comment.regularUser && (
                    <RegularUserBadge user={comment.regularUser} />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
