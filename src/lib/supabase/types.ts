export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          name: string;
          platform: 'x' | 'instagram' | 'both';
          persona: string | null;
          first_person: string;
          tone: string;
          emoji_level: 'none' | 'low' | 'medium' | 'high';
          reply_length: 'short' | 'medium' | 'long';
          additional_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          platform?: 'x' | 'instagram' | 'both';
          persona?: string | null;
          first_person?: string;
          tone?: string;
          emoji_level?: 'none' | 'low' | 'medium' | 'high';
          reply_length?: 'short' | 'medium' | 'long';
          additional_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          platform?: 'x' | 'instagram' | 'both';
          persona?: string | null;
          first_person?: string;
          tone?: string;
          emoji_level?: 'none' | 'low' | 'medium' | 'high';
          reply_length?: 'short' | 'medium' | 'long';
          additional_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      regular_users: {
        Row: {
          id: string;
          username: string;
          platform: 'x' | 'instagram' | 'both';
          nickname: string | null;
          relationship: string | null;
          characteristics: string | null;
          preferred_response: string | null;
          interaction_count: number;
          last_interaction: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          platform?: 'x' | 'instagram' | 'both';
          nickname?: string | null;
          relationship?: string | null;
          characteristics?: string | null;
          preferred_response?: string | null;
          interaction_count?: number;
          last_interaction?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          platform?: 'x' | 'instagram' | 'both';
          nickname?: string | null;
          relationship?: string | null;
          characteristics?: string | null;
          preferred_response?: string | null;
          interaction_count?: number;
          last_interaction?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reply_history: {
        Row: {
          id: string;
          account_id: string | null;
          regular_user_id: string | null;
          username: string;
          original_comment: string;
          generated_reply: string;
          edited_reply: string | null;
          was_edited: boolean;
          was_used: boolean;
          feedback: 'good' | 'bad' | 'neutral' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          regular_user_id?: string | null;
          username: string;
          original_comment: string;
          generated_reply: string;
          edited_reply?: string | null;
          was_edited?: boolean;
          was_used?: boolean;
          feedback?: 'good' | 'bad' | 'neutral' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          regular_user_id?: string | null;
          username?: string;
          original_comment?: string;
          generated_reply?: string;
          edited_reply?: string | null;
          was_edited?: boolean;
          was_used?: boolean;
          feedback?: 'good' | 'bad' | 'neutral' | null;
          created_at?: string;
        };
      };
      learned_patterns: {
        Row: {
          id: string;
          account_id: string | null;
          pattern_type: string;
          original_pattern: string | null;
          preferred_pattern: string | null;
          frequency: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          pattern_type: string;
          original_pattern?: string | null;
          preferred_pattern?: string | null;
          frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          pattern_type?: string;
          original_pattern?: string | null;
          preferred_pattern?: string | null;
          frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
