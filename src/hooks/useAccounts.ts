'use client';

import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUIStore } from '@/stores/uiStore';
import type { Account, AccountFormData } from '@/types';

interface AccountRow {
  id: string;
  name: string;
  platform: 'x' | 'instagram' | 'both';
  persona: string | null;
  first_person: string;
  tone: string;
  emoji_level: 'none' | 'low' | 'medium' | 'high';
  reply_length: 'short' | 'medium' | 'long';
  additional_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export function useAccounts() {
  const { accounts, setAccounts, selectedAccountId, setSelectedAccountId, addToast } = useUIStore();

  // アカウント一覧を取得
  const fetchAccounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: Account[] = ((data || []) as AccountRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        platform: row.platform,
        persona: row.persona || '',
        firstPerson: row.first_person,
        tone: row.tone,
        emojiLevel: row.emoji_level,
        replyLength: row.reply_length,
        additionalInstructions: row.additional_instructions || '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setAccounts(formatted);

      // 選択中のアカウントがなければ最初のアカウントを選択
      if (!selectedAccountId && formatted.length > 0) {
        setSelectedAccountId(formatted[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      addToast('アカウントの取得に失敗しました', 'error');
    }
  }, [setAccounts, selectedAccountId, setSelectedAccountId, addToast]);

  // 初回ロード
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // アカウント作成
  const createAccount = useCallback(async (data: AccountFormData): Promise<Account | null> => {
    try {
      const { data: newAccount, error } = await supabase
        .from('accounts')
        .insert({
          name: data.name,
          platform: data.platform,
          persona: data.persona || null,
          first_person: data.firstPerson,
          tone: data.tone,
          emoji_level: data.emojiLevel,
          reply_length: data.replyLength,
          additional_instructions: data.additionalInstructions || null,
        })
        .select()
        .single();

      if (error) throw error;

      const row = newAccount as AccountRow;
      const formatted: Account = {
        id: row.id,
        name: row.name,
        platform: row.platform,
        persona: row.persona || '',
        firstPerson: row.first_person,
        tone: row.tone,
        emojiLevel: row.emoji_level,
        replyLength: row.reply_length,
        additionalInstructions: row.additional_instructions || '',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };

      setAccounts([formatted, ...accounts]);
      addToast('アカウントを作成しました', 'success');
      return formatted;
    } catch (error) {
      console.error('Error creating account:', error);
      addToast('アカウントの作成に失敗しました', 'error');
      return null;
    }
  }, [accounts, setAccounts, addToast]);

  // アカウント更新
  const updateAccount = useCallback(async (id: string, data: Partial<AccountFormData>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.platform !== undefined) updateData.platform = data.platform;
      if (data.persona !== undefined) updateData.persona = data.persona || null;
      if (data.firstPerson !== undefined) updateData.first_person = data.firstPerson;
      if (data.tone !== undefined) updateData.tone = data.tone;
      if (data.emojiLevel !== undefined) updateData.emoji_level = data.emojiLevel;
      if (data.replyLength !== undefined) updateData.reply_length = data.replyLength;
      if (data.additionalInstructions !== undefined) updateData.additional_instructions = data.additionalInstructions || null;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setAccounts(
        accounts.map((account) =>
          account.id === id
            ? { ...account, ...data, updatedAt: new Date() }
            : account
        )
      );

      addToast('アカウントを更新しました', 'success');
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      addToast('アカウントの更新に失敗しました', 'error');
      return false;
    }
  }, [accounts, setAccounts, addToast]);

  // アカウント削除
  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const newAccounts = accounts.filter((account) => account.id !== id);
      setAccounts(newAccounts);

      // 削除したアカウントが選択中だった場合、最初のアカウントを選択
      if (selectedAccountId === id) {
        setSelectedAccountId(newAccounts.length > 0 ? newAccounts[0].id : null);
      }

      addToast('アカウントを削除しました', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      addToast('アカウントの削除に失敗しました', 'error');
      return false;
    }
  }, [accounts, setAccounts, selectedAccountId, setSelectedAccountId, addToast]);

  // 選択中のアカウントを取得
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return {
    accounts,
    selectedAccount,
    selectedAccountId,
    setSelectedAccountId,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
