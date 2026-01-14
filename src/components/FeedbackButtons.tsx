'use client';

interface FeedbackButtonsProps {
  feedback?: 'good' | 'bad' | 'neutral';
  onFeedback: (feedback: 'good' | 'bad') => void;
}

export default function FeedbackButtons({ feedback, onFeedback }: FeedbackButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onFeedback('good')}
        className={`p-1.5 rounded-lg transition-all ${
          feedback === 'good'
            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
            : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title="良い返信"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </button>
      <button
        onClick={() => onFeedback('bad')}
        className={`p-1.5 rounded-lg transition-all ${
          feedback === 'bad'
            ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title="改善が必要"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
      </button>
    </div>
  );
}
