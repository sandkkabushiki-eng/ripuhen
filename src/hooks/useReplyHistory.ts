'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/uiStore';
import type { GeneratedReply, ReplyHistory } from '@/types';

interface ReplyHistoryRow {
  id: string;
  account_id: string | null;
  regular_user_id: string | null;
  username: string;
  original_comment: string;
  generated_reply: string;
  edited_reply: string | null;
  was_edited: boolean;
  was_used: boolean;
  feedback: 'good' | 'bad' | 'neutral' | null;
  created_at: string;
}

export function useReplyHistory() {
  const { addToast } = useUIStore();

  // 返信履歴を保存
  const saveReplyHistory = useCallback(async (
    accountId: string,
    replies: GeneratedReply[]
  ): Promise<void> => {
    try {
      const records = replies.map((reply) => ({
        account_id: accountId,
        regular_user_id: reply.regularUser?.id || null,
        username: reply.username,
        original_comment: reply.originalComment,
        generated_reply: reply.generatedReply,
        edited_reply: reply.editedReply || null,
        was_edited: reply.wasEdited,
        was_used: reply.wasUsed,
        feedback: reply.feedback || null,
      }));

      const { error } = await supabase
        .from('reply_history')
        .insert(records);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving reply history:', error);
    }
  }, []);

  // 編集を保存
  const saveEdit = useCallback(async (
    replyId: string,
    editedReply: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reply_history')
        .update({
          edited_reply: editedReply,
          was_edited: true,
        })
        .eq('id', replyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving edit:', error);
      addToast('編集の保存に失敗しました', 'error');
      return false;
    }
  }, [addToast]);

  // フィードバックを保存
  const saveFeedback = useCallback(async (
    replyId: string,
    feedback: 'good' | 'bad' | 'neutral'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reply_history')
        .update({ feedback })
        .eq('id', replyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      return false;
    }
  }, []);

  // 履歴を取得（統計用）
  const getHistoryStats = useCallback(async (
    accountId: string
  ): Promise<{ editRate: number; totalCount: number; editedCount: number }> => {
    try {
      const { data, error } = await supabase
        .from('reply_history')
        .select('was_edited')
        .eq('account_id', accountId);

      if (error) throw error;

      const rows = (data || []) as { was_edited: boolean }[];
      const totalCount = rows.length;
      const editedCount = rows.filter((r) => r.was_edited).length;
      const editRate = totalCount > 0 ? (editedCount / totalCount) * 100 : 0;

      return { editRate, totalCount, editedCount };
    } catch (error) {
      console.error('Error getting history stats:', error);
      return { editRate: 0, totalCount: 0, editedCount: 0 };
    }
  }, []);

  // 最近の履歴を取得
  const getRecentHistory = useCallback(async (
    accountId: string,
    limit: number = 50
  ): Promise<ReplyHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('reply_history')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return ((data || []) as ReplyHistoryRow[]).map((row) => ({
        id: row.id,
        accountId: row.account_id || '',
        regularUserId: row.regular_user_id || undefined,
        username: row.username,
        originalComment: row.original_comment,
        generatedReply: row.generated_reply,
        editedReply: row.edited_reply || undefined,
        wasEdited: row.was_edited,
        wasUsed: row.was_used,
        feedback: row.feedback || undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error getting recent history:', error);
      return [];
    }
  }, []);

  return {
    saveReplyHistory,
    saveEdit,
    saveFeedback,
    getHistoryStats,
    getRecentHistory,
  };
}
