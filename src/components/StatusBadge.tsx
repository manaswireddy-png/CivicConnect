import React from 'react';
import { GrievanceStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, Archive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const StatusBadge: React.FC<{ status: GrievanceStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const { t } = useLanguage();

  switch (status) {
    case 'Submitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          {t('statusSubmitted')}
        </span>
      );
    case 'Acknowledged':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
          {t('statusAcknowledged')}
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 ${className}`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          {t('statusInProgress')}
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {t('statusResolved')}
        </span>
      );
    case 'Closed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          <Archive className="w-3.5 h-3.5 text-slate-500" />
          {t('statusClosed')}
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 ${className}`}
        >
          {status}
        </span>
      );
  }
};
