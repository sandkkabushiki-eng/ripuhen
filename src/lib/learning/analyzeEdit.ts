import type { EditAnalysis, LearnedPattern } from '@/types';

/**
 * 編集差分を分析してパターンを抽出
 */
export function analyzeEdit(
  accountId: string,
  originalReply: string,
  editedReply: string
): EditAnalysis {
  const changes: EditAnalysis['changes'] = [];

  // 1. フレーズ置換の検出
  const phraseReplacements = detectPhraseReplacements(originalReply, editedReply);
  changes.push(...phraseReplacements);

  // 2. 絵文字変更の検出
  const emojiChanges = detectEmojiChanges(originalReply, editedReply);
  changes.push(...emojiChanges);

  // 3. 長さ変更の検出
  const lengthChange = detectLengthChange(originalReply, editedReply);
  if (lengthChange) changes.push(lengthChange);

  // 4. トーン調整の検出
  const toneAdjustments = detectToneAdjustments(originalReply, editedReply);
  changes.push(...toneAdjustments);

  return {
    accountId,
    originalReply,
    editedReply,
    changes,
  };
}

/**
 * フレーズ置換を検出
 */
function detectPhraseReplacements(
  original: string,
  edited: string
): EditAnalysis['changes'] {
  const changes: EditAnalysis['changes'] = [];

  // 一般的な置換パターンを検出
  const patterns = [
    // 挨拶系
    { orig: /ありがとうございます/g, edited: /ありがとう/g },
    { orig: /ありがとう/g, edited: /ありがとうございます/g },
    { orig: /よろしくお願いします/g, edited: /よろしくね/g },
    { orig: /よろしくね/g, edited: /よろしくお願いします/g },
    // 呼びかけ系
    { orig: /さん/g, edited: /ちゃん/g },
    { orig: /ちゃん/g, edited: /さん/g },
    { orig: /くん/g, edited: /さん/g },
  ];

  for (const pattern of patterns) {
    const origMatches = original.match(pattern.orig);
    const editedMatches = edited.match(pattern.edited);

    if (origMatches && !editedMatches) {
      // オリジナルにあって編集後にない = 削除または置換
      const origPhrase = origMatches[0];
      // 編集後のテキストから置換先を推測
      const editedWithoutOrig = edited.replace(pattern.edited, '');
      if (editedWithoutOrig !== edited) {
        const editedPhrase = edited.match(pattern.edited)?.[0] || '';
        if (editedPhrase) {
          changes.push({
            type: 'phrase_replacement',
            original: origPhrase,
            replacement: editedPhrase,
          });
        }
      }
    }
  }

  // 差分から直接検出（簡易版）
  const origWords = original.split(/\s+/);
  const editedWords = edited.split(/\s+/);

  // 長さが大きく変わらない場合のみ単語単位で比較
  if (Math.abs(origWords.length - editedWords.length) <= 2) {
    for (let i = 0; i < Math.min(origWords.length, editedWords.length); i++) {
      if (
        origWords[i] !== editedWords[i] &&
        origWords[i].length > 2 &&
        editedWords[i].length > 2
      ) {
        changes.push({
          type: 'phrase_replacement',
          original: origWords[i],
          replacement: editedWords[i],
        });
      }
    }
  }

  return changes;
}

/**
 * 絵文字変更を検出
 */
function detectEmojiChanges(
  original: string,
  edited: string
): EditAnalysis['changes'] {
  const changes: EditAnalysis['changes'] = [];

  // 絵文字パターン
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

  const origEmojis = original.match(emojiRegex) || [];
  const editedEmojis = edited.match(emojiRegex) || [];

  const origCount = origEmojis.length;
  const editedCount = editedEmojis.length;

  if (origCount !== editedCount) {
    changes.push({
      type: 'emoji_change',
      original: `絵文字${origCount}個`,
      replacement: `絵文字${editedCount}個`,
    });
  }

  // 特定の絵文字置換を検出
  for (let i = 0; i < Math.min(origEmojis.length, editedEmojis.length); i++) {
    if (origEmojis[i] !== editedEmojis[i]) {
      changes.push({
        type: 'emoji_change',
        original: origEmojis[i],
        replacement: editedEmojis[i],
      });
    }
  }

  return changes;
}

/**
 * 長さ変更を検出
 */
function detectLengthChange(
  original: string,
  edited: string
): EditAnalysis['changes'][0] | null {
  const origLength = original.length;
  const editedLength = edited.length;
  const ratio = editedLength / origLength;

  if (ratio < 0.7) {
    return {
      type: 'length_preference',
      original: `${origLength}文字`,
      replacement: `${editedLength}文字（より短く）`,
    };
  } else if (ratio > 1.3) {
    return {
      type: 'length_preference',
      original: `${origLength}文字`,
      replacement: `${editedLength}文字（より長く）`,
    };
  }

  return null;
}

/**
 * トーン調整を検出
 */
function detectToneAdjustments(
  original: string,
  edited: string
): EditAnalysis['changes'] {
  const changes: EditAnalysis['changes'] = [];

  // 敬語 → カジュアル
  const formalPatterns = ['です', 'ます', 'ございます', 'いたします'];
  const casualPatterns = ['だよ', 'だね', 'よね', 'するね'];

  const origFormal = formalPatterns.filter((p) => original.includes(p)).length;
  const editedFormal = formalPatterns.filter((p) => edited.includes(p)).length;
  const origCasual = casualPatterns.filter((p) => original.includes(p)).length;
  const editedCasual = casualPatterns.filter((p) => edited.includes(p)).length;

  if (origFormal > editedFormal && editedCasual > origCasual) {
    changes.push({
      type: 'tone_adjustment',
      original: '敬語調',
      replacement: 'カジュアル調',
    });
  } else if (editedFormal > origFormal && origCasual > editedCasual) {
    changes.push({
      type: 'tone_adjustment',
      original: 'カジュアル調',
      replacement: '敬語調',
    });
  }

  return changes;
}

/**
 * パターンをマージ（同じパターンの頻度を加算）
 */
export function mergePatterns(
  existing: LearnedPattern[],
  newChanges: EditAnalysis['changes'],
  accountId: string
): LearnedPattern[] {
  const merged = [...existing];

  for (const change of newChanges) {
    const existingIndex = merged.findIndex(
      (p) =>
        p.patternType === change.type &&
        p.originalPattern === change.original &&
        p.preferredPattern === change.replacement
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        frequency: merged[existingIndex].frequency + 1,
        updatedAt: new Date(),
      };
    } else {
      merged.push({
        id: crypto.randomUUID(),
        accountId,
        patternType: change.type,
        originalPattern: change.original,
        preferredPattern: change.replacement,
        frequency: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return merged;
}
