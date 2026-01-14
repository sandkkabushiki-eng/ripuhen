import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// ビルド時にエラーにならないようダミー値で初期化
// 実行時に環境変数が設定されていれば正常に動作
let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  // ビルド時のフォールバック
  supabase = createClient('http://localhost:54321', 'placeholder-key');
}

export { supabase };
