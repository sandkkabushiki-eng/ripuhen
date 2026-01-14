'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import type { RegularUser, RegularUserFormData } from '@/types';

interface RegularUserFormProps {
  user?: RegularUser;
  onSubmit: (data: RegularUserFormData) => Promise<void>;
  onCancel: () => void;
}

const PLATFORM_OPTIONS = [
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'both', label: '共通' },
];

export default function RegularUserForm({ user, onSubmit, onCancel }: RegularUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegularUserFormData>({
    username: user?.username || '',
    platform: user?.platform || 'both',
    nickname: user?.nickname || '',
    relationship: user?.relationship || '',
    characteristics: user?.characteristics || '',
    preferredResponse: user?.preferredResponse || '',
    notes: user?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ユーザー名"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="例: tanaka_taro"
          required
        />

        <Select
          label="プラットフォーム"
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value as RegularUser['platform'] })}
          options={PLATFORM_OPTIONS}
        />
      </div>

      <Input
        label="内部呼称（ニックネーム）"
        value={formData.nickname}
        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
        placeholder="例: たろうさん、常連のAさん"
      />

      <Input
        label="関係性"
        value={formData.relationship}
        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
        placeholder="例: 初期からの熱心なファン、同業者の友人"
      />

      <Textarea
        label="特徴・傾向"
        value={formData.characteristics}
        onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
        placeholder="例: いつも丁寧なコメント、質問が多い、よく褒めてくれる"
        className="min-h-[80px]"
      />

      <Textarea
        label="対応方針"
        value={formData.preferredResponse}
        onChange={(e) => setFormData({ ...formData, preferredResponse: e.target.value })}
        placeholder="例: 特に丁寧に返す、質問には詳しく答える、フレンドリーに"
        className="min-h-[80px]"
      />

      <Textarea
        label="メモ"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="その他のメモ"
        className="min-h-[60px]"
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
          {user ? '更新' : '登録'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
      </div>
    </form>
  );
}
