-- アカウント設定
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('x', 'instagram', 'both')) DEFAULT 'both',
  persona TEXT,
  first_person TEXT DEFAULT '私',
  tone TEXT DEFAULT 'フレンドリー',
  emoji_level TEXT CHECK (emoji_level IN ('none', 'low', 'medium', 'high')) DEFAULT 'medium',
  reply_length TEXT CHECK (reply_length IN ('short', 'medium', 'long')) DEFAULT 'medium',
  additional_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 常連ユーザー
CREATE TABLE IF NOT EXISTS regular_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('x', 'instagram', 'both')) DEFAULT 'both',
  nickname TEXT,
  relationship TEXT,
  characteristics TEXT,
  preferred_response TEXT,
  interaction_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, platform)
);

-- 返信履歴（学習用データ）
CREATE TABLE IF NOT EXISTS reply_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  regular_user_id UUID REFERENCES regular_users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  original_comment TEXT NOT NULL,
  generated_reply TEXT NOT NULL,
  edited_reply TEXT,
  was_edited BOOLEAN DEFAULT FALSE,
  was_used BOOLEAN DEFAULT TRUE,
  feedback TEXT CHECK (feedback IN ('good', 'bad', 'neutral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学習パターン（編集傾向を保存）
CREATE TABLE IF NOT EXISTS learned_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  original_pattern TEXT,
  preferred_pattern TEXT,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reply_history_account ON reply_history(account_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_edited ON reply_history(was_edited) WHERE was_edited = TRUE;
CREATE INDEX IF NOT EXISTS idx_regular_users_username ON regular_users(username);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_account ON learned_patterns(account_id);

-- 更新時のタイムスタンプ自動更新用トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_accounts_updated_at BEFORE UPDATE
    ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_regular_users_updated_at BEFORE UPDATE
    ON regular_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_learned_patterns_updated_at BEFORE UPDATE
    ON learned_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
