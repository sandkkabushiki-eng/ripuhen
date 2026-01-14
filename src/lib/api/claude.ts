import Anthropic from '@anthropic-ai/sdk';
import type { Account, LearnedPattern, ParsedComment } from '@/types';
import { buildPrompt, parseGeneratedReplies } from '@/lib/prompt/buildPrompt';

// モデル定義
const MODELS = {
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-3-5-haiku-20241022',
} as const;

type ModelType = keyof typeof MODELS;

interface GenerateOptions {
  comments: ParsedComment[];
  account: Account;
  learnedPatterns?: LearnedPattern[];
  model?: ModelType;
}

interface GenerateResult {
  replies: { username: string; reply: string }[];
  error?: string;
}

/**
 * Claude APIを使用して返信を生成
 */
export async function generateReplies(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { comments, account, learnedPatterns, model = 'sonnet' } = options;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { replies: [], error: 'APIキーが設定されていません' };
  }

  const client = new Anthropic({ apiKey });

  try {
    const { systemPrompt, userPrompt } = buildPrompt(
      comments,
      account,
      learnedPatterns
    );

    const response = await client.messages.create({
      model: MODELS[model],
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // レスポンスからテキストを抽出
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return { replies: [], error: '返信の生成に失敗しました' };
    }

    // 生成されたテキストをパース
    const replies = parseGeneratedReplies(textContent.text);

    return { replies };
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return { replies: [], error: 'APIキーが無効です' };
      }
      if (error.status === 429) {
        return { replies: [], error: 'APIのレート制限に達しました。少し待ってから再試行してください' };
      }
    }
    
    return { replies: [], error: '返信の生成中にエラーが発生しました' };
  }
}

/**
 * 単一のコメントに対して返信を再生成
 */
export async function regenerateSingleReply(
  comment: ParsedComment,
  account: Account,
  learnedPatterns?: LearnedPattern[],
  model: ModelType = 'sonnet'
): Promise<{ reply: string; error?: string }> {
  const result = await generateReplies({
    comments: [comment],
    account,
    learnedPatterns,
    model,
  });

  if (result.error) {
    return { reply: '', error: result.error };
  }

  if (result.replies.length === 0) {
    return { reply: '', error: '返信の生成に失敗しました' };
  }

  return { reply: result.replies[0].reply };
}

/**
 * バッチ処理（10件ずつ）
 */
export async function generateRepliesBatch(
  comments: ParsedComment[],
  account: Account,
  learnedPatterns?: LearnedPattern[],
  model: ModelType = 'sonnet',
  batchSize: number = 10
): Promise<GenerateResult> {
  const allReplies: { username: string; reply: string }[] = [];
  const errors: string[] = [];

  // バッチに分割
  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize);
    
    const result = await generateReplies({
      comments: batch,
      account,
      learnedPatterns,
      model,
    });

    if (result.error) {
      errors.push(result.error);
    } else {
      allReplies.push(...result.replies);
    }

    // レート制限対策（100ms待機）
    if (i + batchSize < comments.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return {
    replies: allReplies,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
}
