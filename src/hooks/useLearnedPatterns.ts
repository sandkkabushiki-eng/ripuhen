'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/uiStore';
import { analyzeEdit } from '@/lib/learning/analyzeEdit';
import type { LearnedPattern } from '@/types';

interface LearnedPatternRow {
  id: string;
  account_id: string | null;
  pattern_type: string;
  original_pattern: string | null;
  preferred_pattern: string | null;
  frequency: number;
  created_at: string;
  updated_at: string;
}

export function useLearnedPatterns() {
  const { addToast } = useUIStore();
  const [patterns, setPatterns] = useState<LearnedPattern[]>([]);

  // パターンを取得
  const fetchPatterns = useCallback(async (accountId: string): Promise<LearnedPattern[]> => {
    try {
      const { data, error } = await supabase
        .from('learned_patterns')
        .select('*')
        .eq('account_id', accountId)
        .order('frequency', { ascending: false });

      if (error) throw error;

      const formatted: LearnedPattern[] = ((data || []) as LearnedPatternRow[]).map((row) => ({
        id: row.id,
        accountId: row.account_id || '',
        patternType: row.pattern_type as LearnedPattern['patternType'],
        originalPattern: row.original_pattern || undefined,
        preferredPattern: row.preferred_pattern || undefined,
        frequency: row.frequency,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setPatterns(formatted);
      return formatted;
    } catch (error) {
      console.error('Error fetching patterns:', error);
      return [];
    }
  }, []);

  // 編集からパターンを学習
  const learnFromEdit = useCallback(async (
    accountId: string,
    originalReply: string,
    editedReply: string
  ): Promise<void> => {
    try {
      // 差分を分析
      const analysis = analyzeEdit(accountId, originalReply, editedReply);

      if (analysis.changes.length === 0) return;

      // 各変更パターンを保存
      for (const change of analysis.changes) {
        // 既存パターンを検索
        const { data: existing } = await supabase
          .from('learned_patterns')
          .select('*')
          .eq('account_id', accountId)
          .eq('pattern_type', change.type)
          .eq('original_pattern', change.original)
          .eq('preferred_pattern', change.replacement)
          .single();

        if (existing) {
          const row = existing as LearnedPatternRow;
          // 頻度を増加
          await supabase
            .from('learned_patterns')
            .update({
              frequency: row.frequency + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.id);
        } else {
          // 新規パターンを作成
          await supabase
            .from('learned_patterns')
            .insert({
              account_id: accountId,
              pattern_type: change.type,
              original_pattern: change.original,
              preferred_pattern: change.replacement,
              frequency: 1,
            });
        }
      }

      // 更新後のパターンを再取得
      await fetchPatterns(accountId);
    } catch (error) {
      console.error('Error learning from edit:', error);
    }
  }, [fetchPatterns]);

  // パターンを削除
  const deletePattern = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('learned_patterns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPatterns(patterns.filter((p) => p.id !== id));
      addToast('パターンを削除しました', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting pattern:', error);
      addToast('パターンの削除に失敗しました', 'error');
      return false;
    }
  }, [patterns, addToast]);

  // パターンを更新
  const updatePattern = useCallback(async (
    id: string,
    updates: Partial<Pick<LearnedPattern, 'originalPattern' | 'preferredPattern'>>
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.originalPattern !== undefined) {
        updateData.original_pattern = updates.originalPattern;
      }
      if (updates.preferredPattern !== undefined) {
        updateData.preferred_pattern = updates.preferredPattern;
      }

      const { error } = await supabase
        .from('learned_patterns')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setPatterns(
        patterns.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      );

      addToast('パターンを更新しました', 'success');
      return true;
    } catch (error) {
      console.error('Error updating pattern:', error);
      addToast('パターンの更新に失敗しました', 'error');
      return false;
    }
  }, [patterns, addToast]);

  // 上位パターンを取得（プロンプト用）
  const getTopPatterns = useCallback((limit: number = 10): LearnedPattern[] => {
    return patterns
      .filter((p) => p.frequency >= 2) // 頻度2以上のみ
      .slice(0, limit);
  }, [patterns]);

  return {
    patterns,
    fetchPatterns,
    learnFromEdit,
    deletePattern,
    updatePattern,
    getTopPatterns,
  };
}
