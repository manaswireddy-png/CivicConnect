import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useGrievances } from '../context/GrievanceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Grievance, StatusHistory } from '../types';
import {
  Search,
  Clock,
  CheckCircle2,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  Star,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TrackGrievancePageProps {
  initialRefId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const TrackGrievancePage: React.FC<TrackGrievancePageProps> = ({
  initialRefId,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { grievances, getGrievanceByReferenceId, getHistoryForGrievance, addFeedback } = useGrievances();

  const [searchRef, setSearchRef] = useState(initialRefId || '');
  const [currentGrievance, setCurrentGrievance] = useState<Grievance | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [searched, setSearched] = useState(false);

  // Feedback states
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const performLookup = (refId: string) => {
    if (!refId.trim()) return;
    setSearched(true);
    const found = getGrievanceByReferenceId(refId);
    if (found) {
      setCurrentGrievance(found);
      const hist = getHistoryForGrievance(found.referenceId);
      setHistory(hist);
    } else {
      setCurrentGrievance(null);
      setHistory([]);
    }
  };

  useEffect(() => {
    if (initialRefId) {
      setSearchRef(initialRefId);
      performLookup(initialRefId);
    }
  }, [initialRefId, grievances]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchRef);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGrievance) return;
    await addFeedback(currentGrievance.referenceId, rating, feedbackComment);
    setFeedbackSubmitted(true);
  };

  // Helper timeline milestones
  const ALL_STATUSES = ['Submitted', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];

  const getStepIndex = (status: string) => {
    const idx = ALL_STATUSES.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('trackTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {t('trackSubtitle')}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="e.g. GRA-2026-00001"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50 uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shrink-0 shadow-sm transition"
          >
            {t('trackBtn')}
          </button>
        </form>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-700">Sample reference IDs:</span>
          {['GRA-2026-00001', 'GRA-2026-00002', 'GRA-2026-00003', 'GRA-2026-00004'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setSearchRef(id);
                performLookup(id);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-blue-800 font-mono text-[11px] font-semibold border border-slate-200"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {currentGrievance ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Grievance Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                    Ref ID: <strong className="text-blue-900 text-sm">{currentGrievance.referenceId}</strong>
                  </span>
                  <StatusBadge status={currentGrievance.status} />
                  <PriorityBadge priority={currentGrievance.priority} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  {currentGrievance.subject}
                </h2>
              </div>
              <div className="text-right text-xs text-slate-500 shrink-0">
                <div>{t('submittedOn')}:</div>
                <div className="font-semibold text-slate-800">
                  {new Date(currentGrievance.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Description & Photo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Grievance Description
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {currentGrievance.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-slate-900">{currentGrievance.category}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Authority</span>
                    <span className="font-bold text-slate-900">{currentGrievance.department}</span>
                  </div>
                  <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {currentGrievance.location}
                      {currentGrievance.landmark && ` (Near ${currentGrievance.landmark})`}
                    </span>
                  </div>
                </div>

                {/* Complainant Privacy Masking (Scenario 12 Audit Protection) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700 uppercase text-[10px]">Complainant Details</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Privacy Protected
                    </span>
                  </div>
                  {/* If user is owner or admin, reveal full details; otherwise mask PII */}
                  <div className="text-slate-600">
                    <div>
                      <span className="text-slate-400">Name: </span>
                      <strong className="text-slate-800">
                        {currentGrievance.userName ? (currentGrievance.userName.slice(0, 3) + '*****') : 'Citizen'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Email: </span>
                      <strong className="text-slate-800">
                        {currentGrievance.userEmail ? (currentGrievance.userEmail.slice(0, 2) + '***@' + (currentGrievance.userEmail.split('@')[1] || 'gov.in')) : 'Protected'}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      Private complainant records are masked to comply with Indian Citizen Data Protection mandates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Evidence if uploaded */}
              {currentGrievance.attachmentUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Photo Attachment
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={currentGrievance.attachmentUrl}
                      alt="Complaint Evidence"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Official Resolution Notes if Available */}
            {currentGrievance.resolutionNotes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('resolutionRemarks')}
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  {currentGrievance.resolutionNotes}
                </p>
              </div>
            )}
          </div>

          {/* Chronological Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t('statusTimeline')}
            </h3>

            {/* Horizontal progress bar */}
            <div className="relative py-4">
              <div className="hidden sm:flex justify-between items-center relative z-10">
                {ALL_STATUSES.map((st, idx) => {
                  const currentIdx = getStepIndex(currentGrievance.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={st} className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                          isDone
                            ? isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-bold ${
                          isCurrent
                            ? 'text-blue-900'
                            : isDone
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="hidden sm:block absolute top-[34px] left-6 right-6 h-0.5 bg-slate-200 z-0"></div>
            </div>

            {/* Audit log trail */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Transition Audit History
              </h4>
              <div className="space-y-3">
                {history.map((hist, i) => (
                  <div
                    key={hist.id || i}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={hist.status} />
                        <span className="text-xs font-bold text-slate-800">
                          by {hist.updatedBy}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        "{hist.note}"
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-500 shrink-0">
                      {new Date(hist.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Citizen Feedback Form (if Resolved or Closed) */}
          {(currentGrievance.status === 'Resolved' || currentGrievance.status === 'Closed') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                {t('leaveFeedback')}
              </h3>

              {feedbackSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('feedbackSuccess')}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      {t('rateResolution')}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience regarding the speed and quality of redressal..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    {t('submitFeedback')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      ) : searched ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            {t('notFoundMessage')} "{searchRef}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please double check your reference number. Standard Telangana reference numbers follow the format <strong className="font-mono">GRA-2026-XXXXX</strong>.
          </p>
        </div>
      ) : null}
    </div>
  );
};
