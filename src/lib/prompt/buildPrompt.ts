import type { Account, LearnedPattern, ParsedComment, RegularUser } from '@/types';

interface PromptParts {
  systemPrompt: string;
  userPrompt: string;
}

const EMOJI_LEVELS = {
  none: '絵文字は一切使用しない',
  low: '絵文字は控えめに（1-2個程度）',
  medium: '適度に絵文字を使用（3-5個程度）',
  high: '絵文字を積極的に使用（文章を彩る程度に）',
};

const REPLY_LENGTHS = {
  short: '短め（1-2文、簡潔に）',
  medium: '普通（2-3文、バランスよく）',
  long: '長め（3-4文、丁寧に詳しく）',
};

/**
 * Claude API用のプロンプトを構築
 */
export function buildPrompt(
  comments: ParsedComment[],
  account: Account,
  learnedPatterns?: LearnedPattern[]
): PromptParts {
  const systemPrompt = buildSystemPrompt(account, learnedPatterns);
  const userPrompt = buildUserPrompt(comments);

  return { systemPrompt, userPrompt };
}

/**
 * システムプロンプトを構築
 */
function buildSystemPrompt(
  account: Account,
  learnedPatterns?: LearnedPattern[]
): string {
  const learningContext = buildLearningContext(learnedPatterns);

  return `あなたはSNSアカウントの運営者として、フォロワーからのリプライに返信を作成します。

【アカウント設定】
- 一人称: ${account.firstPerson}
- 口調: ${account.tone}
- 絵文字: ${EMOJI_LEVELS[account.emojiLevel]}
- 返信の長さ: ${REPLY_LENGTHS[account.replyLength]}

【キャラクター詳細】
${account.persona || '特に指定なし（自然体で対応）'}

${account.additionalInstructions ? `【追加指示】\n${account.additionalInstructions}\n` : ''}
${learningContext ? `【過去の編集から学習した好み】\n${learningContext}\n` : ''}
【返信ルール】
- 必ず相手の名前で呼びかける（「〇〇さん」「〇〇くん」「〇〇ちゃん」など、キャラに合わせて）
- 相手の文章量より必ず多く返す（相手が短文でも、こちらは丁寧に長めに返す）
- 相手のことを思いやり、心に刺さる言葉を入れる（承認、共感、励まし、特別感）
- 相手の状況や気持ちを想像して、一歩踏み込んだ返信をする
- 質問には具体的に答える
- 常連ユーザーには過去のやり取りを踏まえた特別感を出す
- 絵文字は設定に従って使用

【出力形式】
各返信は以下の形式で出力してください（区切り線で分離）：

@ユーザー名
返信文

---

@次のユーザー名
返信文

---`;
}

/**
 * 学習コンテキストを構築
 */
function buildLearningContext(patterns?: LearnedPattern[]): string {
  if (!patterns || patterns.length === 0) return '';

  return patterns
    .filter((p) => p.originalPattern && p.preferredPattern)
    .map((p) => `- 「${p.originalPattern}」より「${p.preferredPattern}」を使う`)
    .join('\n');
}

/**
 * ユーザープロンプトを構築
 */
function buildUserPrompt(comments: ParsedComment[]): string {
  // 常連ユーザー情報を抽出
  const regularUsersInfo = buildRegularUsersInfo(comments);

  // コメント一覧
  const commentsList = comments
    .map((c, i) => `${i + 1}. @${c.username}: ${c.content}`)
    .join('\n');

  return `以下のコメントに返信を作成してください。

${regularUsersInfo ? `【常連ユーザー情報】\n${regularUsersInfo}\n` : ''}
【コメント一覧】
${commentsList}`;
}

/**
 * 常連ユーザー情報を構築
 */
function buildRegularUsersInfo(comments: ParsedComment[]): string {
  const regularComments = comments.filter((c) => c.regularUser);

  if (regularComments.length === 0) return '';

  return regularComments
    .map((c) => {
      const user = c.regularUser!;
      const parts = [`@${user.username}`];

      if (user.nickname) parts.push(`（内部呼称: ${user.nickname}）`);
      if (user.relationship) parts.push(`関係性: ${user.relationship}`);
      if (user.characteristics) parts.push(`特徴: ${user.characteristics}`);
      if (user.preferredResponse) parts.push(`対応方針: ${user.preferredResponse}`);
      if (user.interactionCount > 0) {
        parts.push(`過去のやり取り: ${user.interactionCount}回`);
      }

      return parts.join('\n  ');
    })
    .join('\n\n');
}

/**
 * 返信テキストをパースして個別の返信に分割
 */
export function parseGeneratedReplies(
  text: string
): { username: string; reply: string }[] {
  const replies: { username: string; reply: string }[] = [];
  
  // ---で分割
  const sections = text.split('---').filter((s) => s.trim());

  for (const section of sections) {
    const lines = section.trim().split('\n');
    
    // 最初の行から@usernameを抽出
    const firstLine = lines[0] || '';
    const usernameMatch = firstLine.match(/^@?([\w_]+)/);
    
    if (usernameMatch) {
      const username = usernameMatch[1];
      // 返信本文（ユーザー名行を除いた残り）
      const reply = lines.slice(1).join('\n').trim();
      
      if (reply) {
        replies.push({ username, reply });
      }
    }
  }

  return replies;
}
