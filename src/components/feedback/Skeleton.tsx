import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'card' | 'row';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  let baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded';

  switch (variant) {
    case 'circle':
      baseStyles += ' rounded-full';
      break;
    case 'card':
      baseStyles += ' h-32 w-full rounded-2xl';
      break;
    case 'row':
      return (
        <div className="flex items-center gap-4 w-full py-3">
          <div className="h-10 w-10 rounded-full bg-slate-202 dark:bg-slate-800 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
        </div>
      );
    case 'text':
    default:
      baseStyles += ' h-4 w-full';
  }

  return <div className={`${baseStyles} ${className}`} />;
};
