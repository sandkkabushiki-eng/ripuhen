import { create } from 'zustand';
import type { Account, GeneratedReply, ParsedComment, RegularUser } from '@/types';
import type { ToastData } from '@/components/ui/Toast';

interface UIState {
  // 選択中のアカウント
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;

  // アカウント一覧（キャッシュ）
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;

  // 常連ユーザー一覧（キャッシュ）
  regularUsers: RegularUser[];
  setRegularUsers: (users: RegularUser[]) => void;

  // パース済みコメント
  parsedComments: ParsedComment[];
  setParsedComments: (comments: ParsedComment[]) => void;

  // 生成された返信
  generatedReplies: GeneratedReply[];
  setGeneratedReplies: (replies: GeneratedReply[]) => void;
  updateReply: (id: string, updates: Partial<GeneratedReply>) => void;

  // 生成状態
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;

  // モーダル状態
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
  settingsTab: 'accounts' | 'regularUsers' | 'api';
  setSettingsTab: (tab: 'accounts' | 'regularUsers' | 'api') => void;

  // トースト
  toasts: ToastData[];
  addToast: (message: string, type: ToastData['type']) => void;
  removeToast: (id: string) => void;

  // ダークモード
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // 選択中のアカウント
  selectedAccountId: null,
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),

  // アカウント一覧
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),

  // 常連ユーザー一覧
  regularUsers: [],
  setRegularUsers: (users) => set({ regularUsers: users }),

  // パース済みコメント
  parsedComments: [],
  setParsedComments: (comments) => set({ parsedComments: comments }),

  // 生成された返信
  generatedReplies: [],
  setGeneratedReplies: (replies) => set({ generatedReplies: replies }),
  updateReply: (id, updates) =>
    set((state) => ({
      generatedReplies: state.generatedReplies.map((reply) =>
        reply.id === id ? { ...reply, ...updates } : reply
      ),
    })),

  // 生成状態
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),

  // モーダル状態
  isSettingsOpen: false,
  setIsSettingsOpen: (value) => set({ isSettingsOpen: value }),
  settingsTab: 'accounts',
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  // トースト
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now().toString(), message, type },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // ダークモード
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const newValue = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newValue);
        localStorage.setItem('darkMode', String(newValue));
      }
      return { isDarkMode: newValue };
    }),
}));
