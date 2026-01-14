import type { ParsedComment, RegularUser } from '@/types';

/**
 * リプライテキストをパースして個別のコメントに分割
 * 
 * 対応フォーマット:
 * 1. シンプル: ユーザー名: コメント内容
 * 2. 区切り線あり: ---\nユーザー名\nコメント内容\n---
 * 3. 番号付き: 1. ユーザー名: コメント内容
 * 4. インスタグラム形式: コメント内容\nX時間前返信 (ユーザー名なし)
 * 5. Twitter形式: 表示名\n@ユーザーID\n·\n日付\nコメント内容
 */
export function parseReplies(
  text: string,
  regularUsers: RegularUser[]
): ParsedComment[] {
  const lines = text.trim().split('\n');
  const comments: ParsedComment[] = [];

  // 空のテキストの場合は空配列を返す
  if (!text.trim()) {
    return comments;
  }

  // フォーマット検出
  const hasDividers = text.includes('---');
  const hasNumberedFormat = /^\d+\.\s*@?[\w_]+:/.test(lines[0] || '');
  const isInstagramFormat = detectInstagramFormat(text);
  const isTwitterFormat = detectTwitterFormat(text);

  if (isTwitterFormat) {
    // フォーマット5: Twitter形式
    return parseTwitterFormat(text, regularUsers);
  } else if (isInstagramFormat) {
    // フォーマット4: インスタグラム形式（ユーザー名なし）
    return parseInstagramFormat(text, regularUsers);
  } else if (hasDividers) {
    // フォーマット2: 区切り線あり
    const sections = text.split('---').filter(s => s.trim());
    
    for (const section of sections) {
      const sectionLines = section.trim().split('\n').filter(l => l.trim());
      if (sectionLines.length >= 2) {
        const username = cleanUsername(sectionLines[0]);
        const content = sectionLines.slice(1).join('\n').trim();
        
        if (username && content) {
          const regularUser = findRegularUser(username, regularUsers);
          comments.push({ username, content, regularUser });
        }
      } else if (sectionLines.length === 1) {
        // 1行のみの場合、コロンで分割を試みる
        const parsed = parseSimpleLine(sectionLines[0], regularUsers);
        if (parsed) comments.push(parsed);
      }
    }
  } else if (hasNumberedFormat) {
    // フォーマット3: 番号付き
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        const parsed = parseSimpleLine(match[1], regularUsers);
        if (parsed) comments.push(parsed);
      }
    }
  } else {
    // フォーマット1: シンプル（または改行で区切られた形式）
    let currentUsername = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const colonMatch = line.match(/^@?([\w_]+)[:：]\s*(.*)$/);
      
      if (colonMatch) {
        // 前のコメントを保存
        if (currentUsername && currentContent.length > 0) {
          const regularUser = findRegularUser(currentUsername, regularUsers);
          comments.push({
            username: currentUsername,
            content: currentContent.join('\n').trim(),
            regularUser,
          });
        }
        
        currentUsername = cleanUsername(colonMatch[1]);
        currentContent = colonMatch[2] ? [colonMatch[2]] : [];
      } else if (currentUsername && line.trim()) {
        // 続きの行
        currentContent.push(line.trim());
      }
    }

    // 最後のコメントを保存
    if (currentUsername && currentContent.length > 0) {
      const regularUser = findRegularUser(currentUsername, regularUsers);
      comments.push({
        username: currentUsername,
        content: currentContent.join('\n').trim(),
        regularUser,
      });
    }
  }

  return comments;
}

/**
 * Twitter形式かどうかを検出
 * 特徴: @ユーザーID と · と 日付（X月X日）のパターン
 */
function detectTwitterFormat(text: string): boolean {
  // @ユーザーID の行があるか
  const hasAtUsername = /@[\w_]+/.test(text);
  // · と日付のパターンがあるか
  const hasDatePattern = /·\s*\d+月\d+日/.test(text) || /·[\s\n]*\d+月\d+日/.test(text);
  
  return hasAtUsername && hasDatePattern;
}

/**
 * Twitter形式をパース
 * 表示名\n@ユーザーID\n·\n日付\nコメント内容
 */
function parseTwitterFormat(
  text: string,
  regularUsers: RegularUser[]
): ParsedComment[] {
  const comments: ParsedComment[] = [];
  const lines = text.trim().split('\n');
  
  let currentUsername = '';
  let currentDisplayName = '';
  let currentContent: string[] = [];
  let state: 'looking_for_user' | 'looking_for_date' | 'reading_content' = 'looking_for_user';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // @ユーザーIDの行を検出
    const atMatch = line.match(/^@([\w_]+)$/);
    if (atMatch) {
      // 前のコメントを保存
      if (currentUsername && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
          const regularUser = findRegularUser(currentUsername, regularUsers);
          comments.push({
            username: currentUsername,
            content,
            regularUser,
          });
        }
      }
      
      // 前の行が表示名
      if (i > 0 && lines[i - 1].trim() && !lines[i - 1].trim().startsWith('@') && !lines[i - 1].trim().startsWith('·')) {
        currentDisplayName = lines[i - 1].trim();
      }
      
      currentUsername = atMatch[1];
      currentContent = [];
      state = 'looking_for_date';
      continue;
    }
    
    // 日付行を検出（·で始まる、または「X月X日」を含む）
    if (state === 'looking_for_date') {
      if (line === '·' || /^\d+月\d+日/.test(line) || /^·\s*\d+月\d+日/.test(line)) {
        state = 'reading_content';
        continue;
      }
      // ·と日付が別行の場合
      if (line.startsWith('·')) {
        continue; // 次の行で日付を確認
      }
    }
    
    // コメント内容を読み取り
    if (state === 'reading_content' && currentUsername) {
      // 次のユーザーの表示名っぽい行（@で始まらない、短い行）は無視
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && nextLine.startsWith('@')) {
        // この行は次のユーザーの表示名なのでスキップ
        continue;
      }
      currentContent.push(line);
    }
  }
  
  // 最後のコメントを保存
  if (currentUsername && currentContent.length > 0) {
    const content = currentContent.join('\n').trim();
    if (content) {
      const regularUser = findRegularUser(currentUsername, regularUsers);
      comments.push({
        username: currentUsername,
        content,
        regularUser,
      });
    }
  }
  
  return comments;
}

/**
 * インスタグラム形式かどうかを検出
 * 特徴: 「X時間前返信」「X日前返信」「いいね！X件」などのパターン
 */
function detectInstagramFormat(text: string): boolean {
  const instagramPatterns = [
    /\d+時間前.*返信/,
    /\d+日前.*返信/,
    /\d+分前.*返信/,
    /\d+秒前.*返信/,
    /「いいね！」\d+件/,
    /いいね！\d+件/,
  ];
  
  return instagramPatterns.some(pattern => pattern.test(text));
}

/**
 * インスタグラム形式をパース
 * コメント内容と時間情報（X時間前返信など）で区切る
 */
function parseInstagramFormat(
  text: string,
  regularUsers: RegularUser[]
): ParsedComment[] {
  const comments: ParsedComment[] = [];
  const lines = text.trim().split('\n');
  
  let currentContent: string[] = [];
  let userCounter = 1;
  
  // 時間・メタ情報のパターン
  const metaPattern = /^(\d+(?:時間|日|分|秒)前)(?:「?いいね！」?\d+件)?返信$/;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    // メタ情報行かどうかチェック
    if (metaPattern.test(trimmedLine)) {
      // 現在のコメントを保存
      if (currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
          comments.push({
            username: `user_${userCounter}`,
            content,
            regularUser: undefined,
          });
          userCounter++;
        }
      }
      currentContent = [];
    } else {
      // コメント内容として追加
      currentContent.push(trimmedLine);
    }
  }
  
  // 最後のコメントを保存
  if (currentContent.length > 0) {
    const content = currentContent.join('\n').trim();
    if (content) {
      comments.push({
        username: `user_${userCounter}`,
        content,
        regularUser: undefined,
      });
    }
  }
  
  return comments;
}

/**
 * シンプルな1行形式をパース
 */
function parseSimpleLine(
  line: string,
  regularUsers: RegularUser[]
): ParsedComment | null {
  const match = line.match(/^@?([\w_]+)[:：]\s*(.+)$/);
  if (match) {
    const username = cleanUsername(match[1]);
    const content = match[2].trim();
    const regularUser = findRegularUser(username, regularUsers);
    return { username, content, regularUser };
  }
  return null;
}

/**
 * ユーザー名のクリーンアップ
 */
function cleanUsername(username: string): string {
  return username.trim().replace(/^@/, '').replace(/[:：]$/, '');
}

/**
 * 常連ユーザーを検索
 */
function findRegularUser(
  username: string,
  regularUsers: RegularUser[]
): RegularUser | undefined {
  const normalizedUsername = username.toLowerCase();
  return regularUsers.find((user) => 
    user.username.toLowerCase() === normalizedUsername ||
    user.username.toLowerCase().includes(normalizedUsername) ||
    normalizedUsername.includes(user.username.toLowerCase())
  );
}

/**
 * パース結果のプレビュー用テキスト生成
 */
export function generatePreviewText(comments: ParsedComment[]): string {
  return comments
    .map((c, i) => `${i + 1}. @${c.username}: ${c.content}`)
    .join('\n');
}
