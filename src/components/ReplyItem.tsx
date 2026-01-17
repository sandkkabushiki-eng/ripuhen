'use client';

import { useState } from 'react';
import { Button, Textarea } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { copyToClipboard, formatReplyForCopy } from '@/lib/utils/clipboard';
import RegularUserBadge from './RegularUserBadge';
import type { GeneratedReply } from '@/types';

interface ReplyItemProps {
  reply: GeneratedReply;
  onEdit: (newText: string) => void;
  onRegenerate: () => void;
  onDelete: () => void;
}

export default function ReplyItem({ reply, onEdit, onRegenerate, onDelete }: ReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.editedReply || reply.generatedReply);
  const [copied, setCopied] = useState(false);
  const { addToast } = useUIStore();

  const handleCopy = async () => {
    const text = formatReplyForCopy(reply);
    
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div 
      className={`relative p-3 rounded-lg border transition-all ${
        reply.regularUser 
          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700' 
          : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      {/* 削除ボタン */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="削除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-2 pr-6">
        <span className="font-medium text-sm text-gray-800 dark:text-white">
          @{reply.username}
        </span>
        {reply.regularUser && (
          <RegularUserBadge user={reply.regularUser} />
        )}
        {reply.wasEdited && !isEditing && (
          <span className="text-xs text-primary-500 dark:text-primary-400">✏️</span>
        )}
      </div>

      {/* 元のコメント */}
      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded">
        「{reply.originalComment}」
      </div>

      {/* 返信 */}
      <div className="mb-2">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[80px] text-sm"
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
          <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {currentReply}
          </p>
        )}
      </div>

      {/* アクションボタン */}
      {!isEditing && (
        <div className="flex gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              copied 
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              )}
            </svg>
            {copied ? '✓' : 'コピー'}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>

          <button
            onClick={onRegenerate}
            disabled={reply.isRegenerating}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${reply.isRegenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            再生成
          </button>
        </div>
      )}
    </div>
  );
}
