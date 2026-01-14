'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { useRegularUsers } from '@/hooks/useRegularUsers';
import RegularUserForm from './RegularUserForm';
import type { RegularUser, RegularUserFormData } from '@/types';

export default function RegularUserManager() {
  const { regularUsers, createRegularUser, updateRegularUser, deleteRegularUser } = useRegularUsers();
  const [editingUser, setEditingUser] = useState<RegularUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (data: RegularUserFormData) => {
    const result = await createRegularUser(data);
    if (result) {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data: RegularUserFormData) => {
    if (!editingUser) return;
    const success = await updateRegularUser(editingUser.id, data);
    if (success) {
      setEditingUser(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('この常連ユーザーを削除しますか？')) {
      await deleteRegularUser(id);
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
        <h3 className="text-lg font-semibold mb-4">常連ユーザー登録</h3>
        <RegularUserForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (editingUser) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">常連ユーザー編集</h3>
        <RegularUserForm
          user={editingUser}
          onSubmit={handleUpdate}
          onCancel={() => setEditingUser(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">常連ユーザー一覧</h3>
        <Button onClick={() => setIsCreating(true)} variant="primary" size="sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規登録
        </Button>
      </div>

      {regularUsers.length === 0 ? (
        <Card variant="default" className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            常連ユーザーがまだ登録されていません
          </p>
          <Button onClick={() => setIsCreating(true)} variant="primary">
            最初の常連ユーザーを登録
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {regularUsers.map((user) => (
            <Card
              key={user.id}
              variant="default"
              className="flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    @{user.username}
                  </h4>
                  <span className="badge-primary">
                    {platformLabels[user.platform]}
                  </span>
                  {user.interactionCount > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {user.interactionCount}回
                    </span>
                  )}
                </div>
                {user.nickname && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.nickname}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.relationship && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      📌 {user.relationship}
                    </span>
                  )}
                  {user.characteristics && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      💬 {user.characteristics}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => setEditingUser(user)}
                  variant="ghost"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
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
