import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

interface CitizenDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CitizenDashboardPage: React.FC<CitizenDashboardPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const { grievances } = useGrievances();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Isolate citizen's own complaints:
  // If user is logged in, prioritize userProfile.uid; also include demo-citizen-1 for K. Venkatesh persona
  const userUid = userProfile?.uid || 'demo-citizen-1';
  const myComplaints = grievances.filter(
    (g) => g.userId === userUid || (userUid === 'demo-citizen-1' && g.userId === 'demo-citizen-1')
  );

  const total = myComplaints.length;
  const pending = myComplaints.filter((g) => g.status === 'Submitted' || g.status === 'Acknowledged').length;
  const inProgress = myComplaints.filter((g) => g.status === 'In Progress').length;
  const resolved = myComplaints.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;

  const filteredComplaints = myComplaints.filter((g) => {
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    return (
      matchesStatus &&
      (g.referenceId.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Citizen Portal • {userProfile?.name || 'Citizen'}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('citizenDashTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('citizenDashSubtitle')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('submit')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          {t('submitGrievanceBtn')}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('totalGrievances')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('pendingGrievances')}
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('inProgressGrievances')}
            </span>
            <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">{inProgress}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('resolvedGrievances')}
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{resolved}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Submitted', 'Acknowledged', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {t('noComplaintsYet')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any grievances lodged under this citizen account will appear here with live updates.
            </p>
            <button
              onClick={() => onNavigate('submit')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t('submitGrievanceBtn')}
            </button>
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item.referenceId}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-300 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.referenceId}
                  </span>
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition">
                  {item.subject}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </span>
                  <span>•</span>
                  <span>Authority: <strong className="text-slate-700">{item.department}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center sm:flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('track', { refId: item.referenceId })}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <span>Track Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
