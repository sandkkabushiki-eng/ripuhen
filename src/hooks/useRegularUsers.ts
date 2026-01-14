'use client';

import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/uiStore';
import type { RegularUser, RegularUserFormData } from '@/types';

interface RegularUserRow {
  id: string;
  username: string;
  platform: 'x' | 'instagram' | 'both';
  nickname: string | null;
  relationship: string | null;
  characteristics: string | null;
  preferred_response: string | null;
  interaction_count: number;
  last_interaction: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useRegularUsers() {
  const { regularUsers, setRegularUsers, addToast } = useUIStore();

  // 常連ユーザー一覧を取得
  const fetchRegularUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('regular_users')
        .select('*')
        .order('interaction_count', { ascending: false });

      if (error) throw error;

      const formatted: RegularUser[] = ((data || []) as RegularUserRow[]).map((row) => ({
        id: row.id,
        username: row.username,
        platform: row.platform,
        nickname: row.nickname || '',
        relationship: row.relationship || '',
        characteristics: row.characteristics || '',
        preferredResponse: row.preferred_response || '',
        interactionCount: row.interaction_count,
        lastInteraction: row.last_interaction ? new Date(row.last_interaction) : null,
        notes: row.notes || '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setRegularUsers(formatted);
    } catch (error) {
      console.error('Error fetching regular users:', error);
      addToast('常連ユーザーの取得に失敗しました', 'error');
    }
  }, [setRegularUsers, addToast]);

  // 初回ロード
  useEffect(() => {
    fetchRegularUsers();
  }, [fetchRegularUsers]);

  // 常連ユーザー作成
  const createRegularUser = useCallback(async (data: RegularUserFormData): Promise<RegularUser | null> => {
    try {
      const { data: newUser, error } = await supabase
        .from('regular_users')
        .insert({
          username: data.username,
          platform: data.platform,
          nickname: data.nickname || null,
          relationship: data.relationship || null,
          characteristics: data.characteristics || null,
          preferred_response: data.preferredResponse || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const row = newUser as RegularUserRow;
      const formatted: RegularUser = {
        id: row.id,
        username: row.username,
        platform: row.platform,
        nickname: row.nickname || '',
        relationship: row.relationship || '',
        characteristics: row.characteristics || '',
        preferredResponse: row.preferred_response || '',
        interactionCount: row.interaction_count,
        lastInteraction: row.last_interaction ? new Date(row.last_interaction) : null,
        notes: row.notes || '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };

      setRegularUsers([formatted, ...regularUsers]);
      addToast('常連ユーザーを登録しました', 'success');
      return formatted;
    } catch (error) {
      console.error('Error creating regular user:', error);
      addToast('常連ユーザーの登録に失敗しました', 'error');
      return null;
    }
  }, [regularUsers, setRegularUsers, addToast]);

  // 常連ユーザー更新
  const updateRegularUser = useCallback(async (id: string, data: Partial<RegularUserFormData>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.username !== undefined) updateData.username = data.username;
      if (data.platform !== undefined) updateData.platform = data.platform;
      if (data.nickname !== undefined) updateData.nickname = data.nickname || null;
      if (data.relationship !== undefined) updateData.relationship = data.relationship || null;
      if (data.characteristics !== undefined) updateData.characteristics = data.characteristics || null;
      if (data.preferredResponse !== undefined) updateData.preferred_response = data.preferredResponse || null;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('regular_users')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setRegularUsers(
        regularUsers.map((user) =>
          user.id === id
            ? { ...user, ...data, updatedAt: new Date() }
            : user
        )
      );

      addToast('常連ユーザーを更新しました', 'success');
      return true;
    } catch (error) {
      console.error('Error updating regular user:', error);
      addToast('常連ユーザーの更新に失敗しました', 'error');
      return false;
    }
  }, [regularUsers, setRegularUsers, addToast]);

  // 常連ユーザー削除
  const deleteRegularUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('regular_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRegularUsers(regularUsers.filter((user) => user.id !== id));
      addToast('常連ユーザーを削除しました', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting regular user:', error);
      addToast('常連ユーザーの削除に失敗しました', 'error');
      return false;
    }
  }, [regularUsers, setRegularUsers, addToast]);

  // やり取り回数を増加
  const incrementInteraction = useCallback(async (id: string): Promise<void> => {
    try {
      const user = regularUsers.find((u) => u.id === id);
      if (!user) return;

      const { error } = await supabase
        .from('regular_users')
        .update({
          interaction_count: user.interactionCount + 1,
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setRegularUsers(
        regularUsers.map((u) =>
          u.id === id
            ? {
                ...u,
                interactionCount: u.interactionCount + 1,
                lastInteraction: new Date(),
                updatedAt: new Date(),
              }
            : u
        )
      );
    } catch (error) {
      console.error('Error incrementing interaction:', error);
    }
  }, [regularUsers, setRegularUsers]);

  return {
    regularUsers,
    fetchRegularUsers,
    createRegularUser,
    updateRegularUser,
    deleteRegularUser,
    incrementInteraction,
  };
}
