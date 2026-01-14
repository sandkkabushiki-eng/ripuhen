import { NextRequest, NextResponse } from 'next/server';
import { generateRepliesBatch } from '@/lib/api/claude';
import type { Account, LearnedPattern, ParsedComment } from '@/types';

interface RequestBody {
  comments: ParsedComment[];
  account: Account;
  learnedPatterns?: LearnedPattern[];
  model?: 'sonnet' | 'haiku';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { comments, account, learnedPatterns, model } = body;

    if (!comments || comments.length === 0) {
      return NextResponse.json(
        { error: 'コメントが指定されていません' },
        { status: 400 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: 'アカウント設定が指定されていません' },
        { status: 400 }
      );
    }

    const result = await generateRepliesBatch(
      comments,
      account,
      learnedPatterns,
      model
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error, replies: result.replies },
        { status: 500 }
      );
    }

    return NextResponse.json({ replies: result.replies });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'リクエストの処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
