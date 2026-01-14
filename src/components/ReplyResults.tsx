'use client';

import { Button, Card } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useLearnedPatterns } from '@/hooks/useLearnedPatterns';
import { useReplyHistory } from '@/hooks/useReplyHistory';
import { copyToClipboard, formatAllReplies, formatAllRepliesWithDivider } from '@/lib/utils/clipboard';
import ReplyItem from './ReplyItem';
import type { ParsedComment } from '@/types';

export default function ReplyResults() {
  const {
    parsedComments,
    generatedReplies,
    setGeneratedReplies,
    updateReply,
    isGenerating,
    setIsGenerating,
    addToast,
  } = useUIStore();
  const { selectedAccount } = useAccounts();
  const { patterns, learnFromEdit, getTopPatterns } = useLearnedPatterns();
  const { saveFeedback } = useReplyHistory();

  const handleGenerate = async () => {
    if (!selectedAccount) {
      addToast('アカウントを選択してください', 'error');
      return;
    }

    if (parsedComments.length === 0) {
      addToast('まずリプライを解析してください', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const topPatterns = getTopPatterns();
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: parsedComments,
          account: selectedAccount,
          learnedPatterns: topPatterns,
          model: 'sonnet',
        }),
      });

      const data = await response.json();

      if (data.error) {
        addToast(data.error, 'error');
        return;
      }

      // パース結果と生成結果をマッピング
      const replies = parsedComments.map((comment, index) => {
        const generated = data.replies.find(
          (r: { username: string }) => r.username.toLowerCase() === comment.username.toLowerCase()
        ) || data.replies[index];

        return {
          id: crypto.randomUUID(),
          username: comment.username,
          originalComment: comment.content,
          generatedReply: generated?.reply || '返信の生成に失敗しました',
          wasEdited: false,
          wasUsed: true,
          regularUser: comment.regularUser,
        };
      });

      setGeneratedReplies(replies);
      addToast(`${replies.length}件の返信を生成しました`, 'success');
    } catch (error) {
      console.error('Generation error:', error);
      addToast('返信の生成中にエラーが発生しました', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (!selectedAccount) return;

    const reply = generatedReplies[index];
    updateReply(reply.id, { isRegenerating: true });

    try {
      const comment: ParsedComment = {
        username: reply.username,
        content: reply.originalComment,
        regularUser: reply.regularUser,
      };

      const topPatterns = getTopPatterns();

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: [comment],
          account: selectedAccount,
          learnedPatterns: topPatterns,
          model: 'sonnet',
        }),
      });

      const data = await response.json();

      if (data.error) {
        addToast(data.error, 'error');
        return;
      }

      const newReply = data.replies[0]?.reply || reply.generatedReply;
      updateReply(reply.id, {
        generatedReply: newReply,
        editedReply: undefined,
        wasEdited: false,
        isRegenerating: false,
      });

      addToast('返信を再生成しました', 'success');
    } catch (error) {
      console.error('Regeneration error:', error);
      addToast('再生成に失敗しました', 'error');
      updateReply(reply.id, { isRegenerating: false });
    }
  };

  const handleEdit = async (id: string, newText: string) => {
    const reply = generatedReplies.find((r) => r.id === id);
    if (!reply || !selectedAccount) return;

    const originalReply = reply.generatedReply;

    updateReply(id, {
      editedReply: newText,
      wasEdited: true,
    });

    // 学習
    await learnFromEdit(selectedAccount.id, originalReply, newText);
  };

  const handleFeedback = async (id: string, feedback: 'good' | 'bad') => {
    updateReply(id, { feedback });
    await saveFeedback(id, feedback);
  };

  const handleCopyAll = async (withDivider: boolean) => {
    const text = withDivider
      ? formatAllRepliesWithDivider(generatedReplies)
      : formatAllReplies(generatedReplies, true);

    const success = await copyToClipboard(text);
    if (success) {
      addToast('すべての返信をコピーしました', 'success');
    } else {
      addToast('コピーに失敗しました', 'error');
    }
  };

  return (
    <Card variant="default" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          生成結果
        </h2>
        {generatedReplies.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {generatedReplies.length}件
          </span>
        )}
      </div>

      {/* 生成ボタン */}
      {parsedComments.length > 0 && generatedReplies.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {parsedComments.length}件のコメントを解析済み
            </p>
            <Button
              onClick={handleGenerate}
              variant="accent"
              size="lg"
              isLoading={isGenerating}
              disabled={!selectedAccount}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isGenerating ? '生成中...' : '一括生成'}
            </Button>
            {!selectedAccount && (
              <p className="mt-2 text-sm text-red-500">
                アカウントを選択してください
              </p>
            )}
          </div>
        </div>
      )}

      {/* 空の状態 */}
      {parsedComments.length === 0 && generatedReplies.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>リプライを解析すると</p>
            <p>ここに生成結果が表示されます</p>
          </div>
        </div>
      )}

      {/* 結果一覧 */}
      {generatedReplies.length > 0 && (
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
            {generatedReplies.map((reply, index) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onEdit={(newText) => handleEdit(reply.id, newText)}
                onRegenerate={() => handleRegenerate(index)}
                onFeedback={(feedback) => handleFeedback(reply.id, feedback)}
              />
            ))}
          </div>

          {/* 一括操作 */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-border space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => handleCopyAll(false)}
                variant="primary"
                className="flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                すべてコピー（改行区切り）
              </Button>
              <Button
                onClick={() => handleCopyAll(true)}
                variant="secondary"
                className="flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                区切り線あり
              </Button>
            </div>
            <Button
              onClick={handleGenerate}
              variant="ghost"
              className="w-full"
              isLoading={isGenerating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              すべて再生成
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
