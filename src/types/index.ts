// アカウント設定
export interface Account {
  id: string;
  name: string;
  platform: 'x' | 'instagram' | 'both';
  persona: string;
  firstPerson: string;
  tone: string;
  emojiLevel: 'none' | 'low' | 'medium' | 'high';
  replyLength: 'short' | 'medium' | 'long';
  additionalInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

// 常連ユーザー
export interface RegularUser {
  id: string;
  username: string;
  platform: 'x' | 'instagram' | 'both';
  nickname: string;
  relationship: string;
  characteristics: string;
  preferredResponse: string;
  interactionCount: number;
  lastInteraction: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// パースされたコメント
export interface ParsedComment {
  username: string;
  content: string;
  regularUser?: RegularUser;
}

// 生成された返信
export interface GeneratedReply {
  id: string;
  username: string;
  originalComment: string;
  generatedReply: string;
  editedReply?: string;
  wasEdited: boolean;
  wasUsed: boolean;
  feedback?: 'good' | 'bad' | 'neutral';
  regularUser?: RegularUser;
  isRegenerating?: boolean;
}

// 返信履歴
export interface ReplyHistory {
  id: string;
  accountId: string;
  regularUserId?: string;
  username: string;
  originalComment: string;
  generatedReply: string;
  editedReply?: string;
  wasEdited: boolean;
  wasUsed: boolean;
  feedback?: 'good' | 'bad' | 'neutral';
  createdAt: Date;
}

// 学習パターン
export interface LearnedPattern {
  id: string;
  accountId: string;
  patternType: 'phrase_replacement' | 'tone_adjustment' | 'length_preference' | 'emoji_change' | 'structure_change';
  originalPattern?: string;
  preferredPattern?: string;
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}

// 編集分析結果
export interface EditAnalysis {
  accountId: string;
  originalReply: string;
  editedReply: string;
  changes: {
    type: LearnedPattern['patternType'];
    original: string;
    replacement: string;
  }[];
}

// API リクエスト/レスポンス
export interface GenerateReplyRequest {
  comments: ParsedComment[];
  account: Account;
  learnedPatterns?: LearnedPattern[];
  model?: 'sonnet' | 'haiku';
}

export interface GenerateReplyResponse {
  replies: {
    username: string;
    reply: string;
  }[];
  error?: string;
}

// フォーム用の型
export type AccountFormData = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;
export type RegularUserFormData = Omit<RegularUser, 'id' | 'createdAt' | 'updatedAt' | 'interactionCount' | 'lastInteraction'>;
