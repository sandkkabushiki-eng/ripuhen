'use client';

import type { RegularUser } from '@/types';

interface RegularUserBadgeProps {
  user: RegularUser;
  showDetails?: boolean;
}

export default function RegularUserBadge({ user, showDetails = false }: RegularUserBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="badge-regular">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        常連
      </span>
      {user.interactionCount > 0 && (
        <span className="text-xs text-amber-600 dark:text-amber-400">
          {user.interactionCount}回
        </span>
      )}
      {showDetails && user.nickname && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({user.nickname})
        </span>
      )}
    </div>
  );
}
