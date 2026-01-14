'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import type { Account, AccountFormData } from '@/types';

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
}

const PLATFORM_OPTIONS = [
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'both', label: '共通' },
];

const EMOJI_OPTIONS = [
  { value: 'none', label: '使用しない' },
  { value: 'low', label: '少なめ' },
  { value: 'medium', label: '普通' },
  { value: 'high', label: '多め' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: '短め（1-2文）' },
  { value: 'medium', label: '普通（2-3文）' },
  { value: 'long', label: '長め（3-4文）' },
];

export default function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    name: account?.name || '',
    platform: account?.platform || 'both',
    persona: account?.persona || '',
    firstPerson: account?.firstPerson || '私',
    tone: account?.tone || 'フレンドリー',
    emojiLevel: account?.emojiLevel || 'medium',
    replyLength: account?.replyLength || 'medium',
    additionalInstructions: account?.additionalInstructions || '',
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
      <Input
        label="アカウント名"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="例: メインアカウント"
        required
      />

      <Select
        label="プラットフォーム"
        value={formData.platform}
        onChange={(e) => setFormData({ ...formData, platform: e.target.value as Account['platform'] })}
        options={PLATFORM_OPTIONS}
      />

      <Textarea
        label="キャラクター設定（ペルソナ）"
        value={formData.persona}
        onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
        placeholder="例: 20代女性のライフスタイル系インフルエンサー。明るくポジティブな性格で、フォロワーさんとの距離感を大切にしている。"
        className="min-h-[100px]"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="一人称"
          value={formData.firstPerson}
          onChange={(e) => setFormData({ ...formData, firstPerson: e.target.value })}
          placeholder="例: 私、僕、俺"
        />

        <Input
          label="口調"
          value={formData.tone}
          onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
          placeholder="例: フレンドリー、敬語、タメ口"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="絵文字使用度"
          value={formData.emojiLevel}
          onChange={(e) => setFormData({ ...formData, emojiLevel: e.target.value as Account['emojiLevel'] })}
          options={EMOJI_OPTIONS}
        />

        <Select
          label="返信の長さ"
          value={formData.replyLength}
          onChange={(e) => setFormData({ ...formData, replyLength: e.target.value as Account['replyLength'] })}
          options={LENGTH_OPTIONS}
        />
      </div>

      <Textarea
        label="追加の指示"
        value={formData.additionalInstructions}
        onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
        placeholder="例: 質問には具体例を交えて答える、商品紹介は控えめに"
        className="min-h-[80px]"
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
          {account ? '更新' : '作成'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
      </div>
    </form>
  );
}
