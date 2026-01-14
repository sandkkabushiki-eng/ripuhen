# SNSリプライ返信ジェネレーター

X（Twitter）やInstagramのリプライに対する返信をAIで一括生成するWebアプリケーションです。

## 機能

- 📝 **一括返信生成**: 複数のリプライに対する返信を一度に生成
- 👤 **アカウント管理**: 複数のSNSアカウントを登録し、キャラクター設定を管理
- ⭐ **常連ユーザー管理**: よくコメントしてくれるユーザーを記憶し、パーソナライズされた返信を生成
- 🧠 **学習機能**: 編集した内容から好みのパターンを自動学習
- 📋 **簡単コピー**: 生成した返信をワンクリックでコピー

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **状態管理**: Zustand

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Supabaseデータベースのセットアップ

Supabaseダッシュボードで新しいプロジェクトを作成し、`supabase/migrations/001_initial_schema.sql` のSQLを実行してテーブルを作成します。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

## 使い方

1. **アカウント設定**: 設定画面でSNSアカウントのキャラクター設定を登録
2. **リプライ入力**: 左側のテキストエリアにリプライをコピペ
3. **解析**: 「解析する」ボタンでコメントを分離
4. **生成**: 「一括生成」ボタンでAI返信を生成
5. **編集・コピー**: 必要に応じて編集し、コピー

### 対応入力フォーマット

```
# シンプル形式
ユーザー名: コメント内容

# @付き形式
@ユーザー名: コメント内容

# 番号付き形式
1. ユーザー名: コメント内容
2. ユーザー名: コメント内容
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリと連携
2. Vercelダッシュボードで環境変数を設定
3. デプロイ

## ライセンス

MIT
