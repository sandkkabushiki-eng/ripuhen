'use client';

import { Card } from '@/components/ui';

export default function ApiSettings() {
  return (
    <div className="space-y-4">
      <Card variant="default">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
          Claude API キー
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          APIキーは環境変数（ANTHROPIC_API_KEY）で管理されています。
          Vercelダッシュボードまたは .env.local ファイルで設定してください。
        </p>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <code className="text-sm text-gray-600 dark:text-gray-300">
            ANTHROPIC_API_KEY=sk-ant-api03-...
          </code>
        </div>
      </Card>

      <Card variant="default">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
          使用モデル
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Claude Sonnet 4
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                高品質な返信生成（デフォルト）
              </p>
            </div>
            <span className="badge-primary">推奨</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Claude Haiku 3.5
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                コスト重視（将来対応予定）
              </p>
            </div>
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500">
              近日公開
            </span>
          </div>
        </div>
      </Card>

      <Card variant="default">
        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
          Supabase 接続
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          データベース接続情報も環境変数で管理されています。
        </p>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <code className="text-sm text-gray-600 dark:text-gray-300">
              NEXT_PUBLIC_SUPABASE_URL=https://...
            </code>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <code className="text-sm text-gray-600 dark:text-gray-300">
              NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
}
