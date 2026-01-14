'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { useAccounts } from '@/hooks/useAccounts';
import AccountForm from './AccountForm';
import type { Account, AccountFormData } from '@/types';

export default function AccountManager() {
  const { accounts, createAccount, updateAccount, deleteAccount } = useAccounts();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (data: AccountFormData) => {
    const result = await createAccount(data);
    if (result) {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data: AccountFormData) => {
    if (!editingAccount) return;
    const success = await updateAccount(editingAccount.id, data);
    if (success) {
      setEditingAccount(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('このアカウントを削除しますか？')) {
      await deleteAccount(id);
    }
  };

  const platformLabels = {
    x: 'X',
    instagram: 'Instagram',
    both: '共通',
  };

  if (isCreating) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">新規アカウント作成</h3>
        <AccountForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (editingAccount) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">アカウント編集</h3>
        <AccountForm
          account={editingAccount}
          onSubmit={handleUpdate}
          onCancel={() => setEditingAccount(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">アカウント一覧</h3>
        <Button onClick={() => setIsCreating(true)} variant="primary" size="sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card variant="default" className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            アカウントがまだありません
          </p>
          <Button onClick={() => setIsCreating(true)} variant="primary">
            最初のアカウントを作成
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              variant="default"
              className="flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-800 dark:text-white truncate">
                    {account.name}
                  </h4>
                  <span className="badge-primary">
                    {platformLabels[account.platform]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.tone} / {account.firstPerson} / 絵文字:{' '}
                  {account.emojiLevel === 'none' ? 'なし' :
                   account.emojiLevel === 'low' ? '少なめ' :
                   account.emojiLevel === 'medium' ? '普通' : '多め'}
                </p>
                {account.persona && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 truncate mt-1">
                    {account.persona}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => setEditingAccount(account)}
                  variant="ghost"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => handleDelete(account.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
