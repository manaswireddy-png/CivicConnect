import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGrievances } from '../context/GrievanceContext';
import { suggestGrievanceCategory } from '../services/geminiClient';
import { GrievancePriority, GrievanceSuggestion } from '../types';
import {
  ShieldAlert,
  Sparkles,
  Upload,
  CheckCircle2,
  Copy,
  ArrowRight,
  MapPin,
  Building2,
  AlertTriangle,
  Loader2,
  FileCheck,
  Check
} from 'lucide-react';

interface GrievanceSubmissionPageProps {
  prefillData?: (GrievanceSuggestion & { descriptionText?: string }) | null;
  onNavigate: (page: string, params?: any) => void;
}

const CATEGORIES = [
  'Water Supply',
  'Water Supply & Drainage',
  'Roads & Infrastructure',
  'Electricity',
  'Sanitation',
  'Street Lights & Infrastructure',
  'Public Health & Fogging',
  'Birth & Death Certificates',
  'Revenue & Certificates',
  'Welfare & Ration',
  'Welfare & Pensions',
  'Municipal Services',
  'General Civic Amenities',
];

const DEPARTMENTS = [
  'Greater Hyderabad Municipal Corporation (GHMC)',
  'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',
  'Southern Power Distribution Company of Telangana Limited (TSSPDCL)',
  'Revenue Department, Government of Telangana',
  'Civil Supplies Department, Telangana',
  'Town Planning / TS-bPASS / HMDA',
  'Telangana State Road Transport Corporation (TGSRTC)',
  'Panchayat Raj & Rural Development',
];

const SAMPLE_CIVIC_PHOTOS = [
  { label: 'Pothole on Road', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Water Leakage', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Electricity Pole/Wire', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Overflowing Garbage', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80' },
];

export const GrievanceSubmissionPage: React.FC<GrievanceSubmissionPageProps> = ({
  prefillData,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const { submitGrievance } = useGrievances();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('500081');
  const [priority, setPriority] = useState<GrievancePriority>('Medium');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<GrievanceSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Apply prefilled data if passed from AI Assistant
  useEffect(() => {
    if (prefillData) {
      if (prefillData.title) setSubject(prefillData.title);
      if (prefillData.descriptionText) setDescription(prefillData.descriptionText);
      if (prefillData.category && CATEGORIES.includes(prefillData.category)) {
        setCategory(prefillData.category);
      }
      if (prefillData.department) {
        const foundDept = DEPARTMENTS.find((d) =>
          d.toLowerCase().includes(prefillData.department.toLowerCase().split(' ')[0])
        );
        if (foundDept) setDepartment(foundDept);
      }
      if (prefillData.priority) setPriority(prefillData.priority);
      setAiSuggestion(prefillData);
    }
  }, [prefillData]);

  // AI Auto Assist Trigger
  const handleAiAutoAssist = async () => {
    if (!description.trim()) {
      setErrorMessage('Please enter an issue description first so the AI can analyze it.');
      return;
    }
    setErrorMessage('');
    setIsAiAnalyzing(true);
    try {
      const suggestion = await suggestGrievanceCategory(description, location);
      setAiSuggestion(suggestion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.title && !subject) setSubject(aiSuggestion.title);
    if (aiSuggestion.category) {
      const matchedCat = CATEGORIES.find(
        (c) => c.toLowerCase() === aiSuggestion.category.toLowerCase()
      );
      if (matchedCat) setCategory(matchedCat);
    }
    if (aiSuggestion.department) {
      const matchedDept = DEPARTMENTS.find((d) =>
        d.toLowerCase().includes(aiSuggestion.department.toLowerCase().split(' ')[0])
      );
      if (matchedDept) setDepartment(matchedDept);
    }
    if (aiSuggestion.priority) setPriority(aiSuggestion.priority);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subject.trim()) {
      setErrorMessage('Please provide a complaint subject.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMessage('Please provide a detailed description (at least 15 characters).');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please specify the street address or locality.');
      return;
    }

    setIsSubmitting(true);
    try {
      const refId = await submitGrievance({
        userId: userProfile?.uid || 'guest-citizen',
        userName: userProfile?.name || 'Citizen',
        userEmail: userProfile?.email || 'citizen@telangana.gov.in',
        subject: subject.trim(),
        description: description.trim(),
        category,
        department,
        location: location.trim(),
        landmark: landmark.trim(),
        pincode: pincode.trim(),
        priority,
        attachmentUrl: attachmentUrl || undefined,
      });

      setSubmittedRefId(refId);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (submittedRefId) {
      navigator.clipboard.writeText(submittedRefId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success Confirmation Screen
  if (submittedRefId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {t('successTitle')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('successMessage')}
            </p>
          </div>

          {/* Reference Badge Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between max-w-sm mx-auto shadow-inner">
            <div className="text-left">
              <span className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-widest block">
                Official Reference ID
              </span>
              <span className="text-xl font-black font-mono tracking-wider text-white">
                {submittedRefId}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : t('copyRefId')}
            </button>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 text-left space-y-1">
            <div className="font-bold text-slate-800">What happens next?</div>
            <div>• Your complaint is registered in the official Telangana municipal queue.</div>
            <div>• Assigned to <span className="font-semibold text-slate-800">{department}</span> field squad.</div>
            <div>• Real-time updates will be logged on your tracking timeline.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate('track', { refId: submittedRefId })}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <FileCheck className="w-4 h-4" />
              {t('trackNow')}
            </button>

            <button
              onClick={() => onNavigate('citizen-dash')}
              className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              {t('viewInDashboard')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4" />
          Official Citizen Redressal Portal
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('submitTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {t('submitSubtitle')}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Description & AI Assist Trigger */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('description')} *
            </label>
            <button
              type="button"
              onClick={handleAiAutoAssist}
              disabled={isAiAnalyzing || !description.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white disabled:opacity-50 transition shadow-sm"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('aiAssisting')}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {t('aiAssistBtn')}
                </>
              )}
            </button>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        {/* AI Suggestion Banner if Generated */}
        {aiSuggestion && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {t('aiSuggestionTitle')}
              </span>
              <button
                type="button"
                onClick={handleApplyAiSuggestion}
                className="text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 px-3 py-1 rounded-md transition shadow-sm"
              >
                {t('confirmAiSuggestion')}
              </button>
            </div>
            <div className="text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500">Category:</span>{' '}
                <strong className="text-blue-900">{aiSuggestion.category}</strong>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>{' '}
                <strong className="text-slate-900">{aiSuggestion.department}</strong>
              </div>
              <div>
                <span className="text-slate-500">Priority:</span>{' '}
                <strong className="text-amber-800">{aiSuggestion.priority}</strong>
              </div>
              <div>
                <span className="text-slate-500">Title:</span>{' '}
                <strong className="text-slate-900">{aiSuggestion.title}</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 italic border-t border-blue-100 pt-1.5">
              "{aiSuggestion.rationale}"
            </p>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('complaintSubject')} *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('subjectPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        {/* Category & Department Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('category')} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('department')} *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('location')} *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('locationPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('pincode')}
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="500081"
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Landmark & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('landmark')}
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder={t('landmarkPlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('priority')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Low', 'Medium', 'High', 'Urgent'] as GrievancePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-lg transition border ${
                    priority === p
                      ? p === 'Urgent'
                        ? 'bg-red-600 text-white border-red-600'
                        : p === 'High'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Evidence Attachment */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('photoEvidence')}
          </label>
          <div className="text-xs text-slate-500">
            Select a sample photo or enter a photo link:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_CIVIC_PHOTOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAttachmentUrl(sample.url)}
                className={`relative rounded-lg overflow-hidden border p-1 text-left transition ${
                  attachmentUrl === sample.url
                    ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img
                  src={sample.url}
                  alt={sample.label}
                  className="w-full h-16 object-cover rounded"
                />
                <span className="block text-[10px] font-semibold text-slate-700 mt-1 truncate">
                  {sample.label}
                </span>
              </button>
            ))}
          </div>

          {attachmentUrl && (
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="truncate max-w-xs">{attachmentUrl}</span>
              <button
                type="button"
                onClick={() => setAttachmentUrl('')}
                className="text-red-600 font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Your grievance will be recorded with a permanent audit trail.
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                {t('submitting')}
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-slate-950" />
                {t('submitButton')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
