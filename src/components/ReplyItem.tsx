'use client';

import { useState } from 'react';
import { Button, Card, Textarea } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { copyToClipboard, formatReplyForCopy, formatReplyWithMention } from '@/lib/utils/clipboard';
import RegularUserBadge from './RegularUserBadge';
import FeedbackButtons from './FeedbackButtons';
import type { GeneratedReply } from '@/types';

interface ReplyItemProps {
  reply: GeneratedReply;
  onEdit: (newText: string) => void;
  onRegenerate: () => void;
  onFeedback: (feedback: 'good' | 'bad') => void;
}

export default function ReplyItem({ reply, onEdit, onRegenerate, onFeedback }: ReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.editedReply || reply.generatedReply);
  const [copied, setCopied] = useState<'none' | 'plain' | 'mention'>('none');
  const { addToast } = useUIStore();

  const handleCopy = async (withMention: boolean) => {
    const text = withMention 
      ? formatReplyWithMention(reply) 
      : formatReplyForCopy(reply);
    
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(withMention ? 'mention' : 'plain');
      setTimeout(() => setCopied('none'), 2000);
      addToast('コピーしました', 'success');
    } else {
      addToast('コピーに失敗しました', 'error');
    }
  };

  const handleSaveEdit = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(reply.editedReply || reply.generatedReply);
    setIsEditing(false);
  };

  const currentReply = reply.editedReply || reply.generatedReply;

  return (
    <Card 
      variant="default" 
      hover
      className={`animate-slide-up ${
        reply.regularUser 
          ? 'ring-2 ring-amber-300 dark:ring-amber-700' 
          : ''
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 dark:text-white">
            @{reply.username}
          </span>
          {reply.regularUser && (
            <RegularUserBadge user={reply.regularUser} showDetails />
          )}
        </div>
        <FeedbackButtons feedback={reply.feedback} onFeedback={onFeedback} />
      </div>

      {/* 元のコメント */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">元コメント:</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          「{reply.originalComment}」
        </p>
      </div>

      {/* 返信 */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">返信:</p>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} variant="primary" size="sm">
                保存
              </Button>
              <Button onClick={handleCancelEdit} variant="secondary" size="sm">
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {currentReply}
          </p>
        )}
        {reply.wasEdited && !isEditing && (
          <span className="inline-block mt-2 text-xs text-primary-500 dark:text-primary-400">
            ✏️ 編集済み
          </span>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-dark-border">
        <Button
          onClick={() => handleCopy(false)}
          variant="secondary"
          size="sm"
          className="flex-1 sm:flex-none"
        >
          {copied === 'plain' ? (
            <>
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              コピー済み
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              コピー
            </>
          )}
        </Button>

        <Button
          onClick={() => handleCopy(true)}
          variant="secondary"
          size="sm"
          className="flex-1 sm:flex-none"
        >
          {copied === 'mention' ? (
            <>
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              コピー済み
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              @付きコピー
            </>
          )}
        </Button>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </Button>
        )}

        <Button
          onClick={onRegenerate}
          variant="ghost"
          size="sm"
          isLoading={reply.isRegenerating}
          className="flex-1 sm:flex-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          再生成
        </Button>
      </div>
    </Card>
  );
}
