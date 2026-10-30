import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Grievance, GrievanceStatus } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  X,
  FileText,
  MapPin,
  Building2,
  TrendingUp,
  Flame,
  Copy,
  Eye,
  Check,
  RefreshCw,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin, userProfile } = useAuth();
  const { grievances, updateGrievanceStatus, detectDuplicatesForGrievance } = useGrievances();

  const [activeTab, setActiveTab] = useState<'complaints' | 'analytics'>('complaints');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal inspection state
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('In Progress');
  const [staffNote, setStaffNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // If unauthorized, show access restriction
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Restricted Government Administrator Access</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          This portal is reserved for authorized municipal officers of Telangana, GHMC, and HMWSSB.
          Switch to the Demo Officer role in the top-right header menu or sign in with your administrator account.
        </p>
      </div>
    );
  }

  // Statistics
  const total = grievances.length;
  const submitted = grievances.filter((g) => g.status === 'Submitted').length;
  const acknowledged = grievances.filter((g) => g.status === 'Acknowledged').length;
  const inProgress = grievances.filter((g) => g.status === 'In Progress').length;
  const resolved = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  grievances.forEach((g) => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });

  // Hotspot location counts
  const locationCounts: Record<string, number> = {};
  grievances.forEach((g) => {
    const locKey = g.location.split(',')[0].trim();
    locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
  });

  // Duplicate analysis list
  const duplicateAlerts = grievances
    .map((g) => ({
      grievance: g,
      matches: detectDuplicatesForGrievance(g),
    }))
    .filter((item) => item.matches.length > 0);

  // Filter & sort table
  const filteredGrievances = grievances
    .filter((g) => {
      const matchStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchCat = categoryFilter === 'All' || g.category === categoryFilter;
      const matchDept = departmentFilter === 'All' || g.department === departmentFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        g.referenceId.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        (g.userName && g.userName.toLowerCase().includes(q));

      return matchStatus && matchCat && matchDept && matchSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const handleOpenGrievance = (g: Grievance) => {
    setSelectedGrievance(g);
    setNewStatus(g.status);
    setStaffNote('');
    setResolutionNotes(g.resolutionNotes || '');
    setUpdateSuccess(false);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    setIsUpdating(true);
    try {
      await updateGrievanceStatus(
        selectedGrievance.referenceId,
        newStatus,
        staffNote || `Status updated to ${newStatus} by ${userProfile?.name || 'Administrator'}`,
        resolutionNotes
      );
      setUpdateSuccess(true);
      // update selected grievance in modal
      setSelectedGrievance((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              resolutionNotes: resolutionNotes || prev.resolutionNotes,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Authorized Official Command Console • {userProfile?.name}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('adminDashTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('adminDashSubtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'complaints'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('complaintsTab')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'analytics'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {t('aiAnalyticsTab')}
            {duplicateAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Lodged
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{total}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Submitted (New)
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{submitted}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Acknowledged
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">{acknowledged}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">{inProgress}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolved / Closed
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{resolved}</div>
        </div>
      </div>

      {activeTab === 'complaints' ? (
        <div className="space-y-6">
          {/* Search & Filters Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchRef')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white font-medium truncate"
              >
                <option value="All">All Categories</option>
                {Object.keys(categoryCounts).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCounts[cat]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grievances Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Ref ID</th>
                    <th className="px-4 py-3.5">Subject & Complainant</th>
                    <th className="px-4 py-3.5">Category & Dept</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">
                      <button
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No complaints match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredGrievances.map((g) => {
                      const duplicates = detectDuplicatesForGrievance(g);
                      return (
                        <tr
                          key={g.referenceId}
                          className="hover:bg-slate-50/80 transition group"
                        >
                          <td className="px-4 py-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                            {g.referenceId}
                            {duplicates.length > 0 && (
                              <span
                                title={`Duplicate match with ${duplicates[0].referenceId}`}
                                className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                              ></span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">
                              {g.subject}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {g.userName || 'Citizen'} • {g.userEmail || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{g.category}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {g.department.split('/')[0]}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 max-w-[180px] truncate text-slate-600">
                            {g.location}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <PriorityBadge priority={g.priority} />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <StatusBadge status={g.status} />
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                            {new Date(g.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenGrievance(g)}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs inline-flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* AI Civic Analytics View */
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Hotspots & Top Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {t('topCategories')}
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{cat}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Hotspot Locations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                {t('highVolumeAreas')}
              </h3>
              <div className="space-y-3">
                {Object.entries(locationCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([loc, count]) => {
                    return (
                      <div
                        key={loc}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {loc}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                          {count} incidents
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* AI Duplicate Detection Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {t('aiDuplicateDetector')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated similarity model detects cross-reported grievances by category, keywords, and geographic proximity for staff review without auto-deleting.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                {duplicateAlerts.length} Flagged Pairs
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {duplicateAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No duplicate clusters detected in current complaint pool.
                </div>
              ) : (
                duplicateAlerts.map(({ grievance, matches }) => (
                  <div
                    key={grievance.referenceId}
                    className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                          {grievance.referenceId}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {grievance.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {matches[0].reason} ({matches[0].score}% match with {matches[0].referenceId})
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGrievance(grievance)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
                      >
                        Inspect Complaint
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grievance Management Drawer / Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {selectedGrievance.referenceId}
                  </span>
                  <StatusBadge status={selectedGrievance.status} />
                  <PriorityBadge priority={selectedGrievance.priority} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  {selectedGrievance.subject}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Complainant: <strong className="text-slate-800">{selectedGrievance.userName}</strong> ({selectedGrievance.userEmail})
                </div>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description & Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-3">
                <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                  <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">Description</div>
                  {selectedGrievance.description}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-slate-800">{selectedGrievance.category}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <span className="font-bold text-slate-800">{selectedGrievance.department}</span>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-slate-800">{selectedGrievance.location}</span>
                  </div>
                </div>
              </div>

              {selectedGrievance.attachmentUrl && (
                <div>
                  <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">Attachment</div>
                  <img
                    src={selectedGrievance.attachmentUrl}
                    alt="Evidence"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleSaveStatus} className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Administrative Action & Triage Control
              </div>

              {updateSuccess && (
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Status successfully updated in Firestore and recorded in audit history.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('updateStatus')} *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GrievanceStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('staffNote')} *
                  </label>
                  <input
                    type="text"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder={t('notePlaceholder')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Resolution Notes (Shown to citizen upon completion)
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Specify equipment replaced, work completed by squad, or closure reasons..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-bold bg-purple-900 hover:bg-purple-800 text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {t('saveStatusUpdate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
