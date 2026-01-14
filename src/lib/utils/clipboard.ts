import type { GeneratedReply } from '@/types';

/**
 * テキストをクリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // フォールバック: execCommand を使用
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 単一の返信をコピー（本文のみ）
 */
export function formatReplyForCopy(reply: GeneratedReply): string {
  return reply.editedReply || reply.generatedReply;
}

/**
 * 単一の返信を@付きでコピー
 */
export function formatReplyWithMention(reply: GeneratedReply): string {
  const content = reply.editedReply || reply.generatedReply;
  return `@${reply.username} ${content}`;
}

/**
 * すべての返信を改行区切りでフォーマット
 */
export function formatAllReplies(
  replies: GeneratedReply[],
  withMention: boolean = false
): string {
  return replies
    .map((reply) => {
      const content = reply.editedReply || reply.generatedReply;
      return withMention ? `@${reply.username}\n${content}` : content;
    })
    .join('\n\n');
}

/**
 * すべての返信を区切り線付きでフォーマット
 */
export function formatAllRepliesWithDivider(
  replies: GeneratedReply[],
  withMention: boolean = true
): string {
  return replies
    .map((reply) => {
      const content = reply.editedReply || reply.generatedReply;
      return withMention ? `@${reply.username}\n${content}` : content;
    })
    .join('\n\n---\n\n');
}
