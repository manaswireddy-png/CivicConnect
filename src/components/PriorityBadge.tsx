import React from 'react';
import { GrievancePriority } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const PriorityBadge: React.FC<{ priority: GrievancePriority | string; className?: string }> = ({
  priority,
  className = '',
}) => {
  const { t } = useLanguage();

  switch (priority) {
    case 'Urgent':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300 ${className}`}
        >
          {t('priorityUrgent')}
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 ${className}`}
        >
          {t('priorityHigh')}
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 ${className}`}
        >
          {t('priorityMedium')}
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {t('priorityLow')}
        </span>
      );
  }
};
