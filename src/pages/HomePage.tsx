import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useGrievances } from '../context/GrievanceContext';
import { VERIFIED_SERVICES } from '../data/servicesData';
import {
  ShieldAlert,
  Bot,
  Search,
  ArrowRight,
  FileCheck,
  Zap,
  Droplets,
  Building,
  Sparkles,
  PhoneCall,
  Clock,
  CheckCircle2,
  Users,
  Compass,
  FileText
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { grievances } = useGrievances();
  const [searchQuery, setSearchQuery] = useState('');
  const [trackRefId, setTrackRefId] = useState('');
  const [trackError, setTrackError] = useState('');

  // Filter services on the fly for hero search preview
  const searchResults = searchQuery.trim()
    ? VERIFIED_SERVICES.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.teluguName && s.teluguName.includes(q)) ||
          (s.hindiName && s.hindiName.includes(q)) ||
          s.category.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRefId.trim()) {
      setTrackError('Please enter a valid reference ID');
      return;
    }
    setTrackError('');
    onNavigate('track', { refId: trackRefId.trim() });
  };

  // Top 6 highlight services
  const featuredServices = VERIFIED_SERVICES.slice(0, 6);

  const totalResolved = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;
  const inProgress = grievances.filter((g) => g.status === 'In Progress' || g.status === 'Acknowledged').length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs font-semibold text-blue-200 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Telangana Civic AI Intelligence & Resolution Engine
          </div>

          {/* Tagline & Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Quick Search Service Input */}
          <div className="max-w-2xl mx-auto relative text-left">
            <div className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center px-4 py-3 gap-3">
                <Search className="w-5 h-5 text-blue-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchServicesPlaceholder')}
                  className="w-full bg-transparent border-none text-white placeholder-slate-400 text-sm focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="border-t border-slate-800 bg-slate-900 divide-y divide-slate-800">
                  {searchResults.map((s) => (
                    <div
                      key={s.serviceId}
                      onClick={() => onNavigate('services', { selectedId: s.serviceId })}
                      className="p-3.5 hover:bg-slate-800/90 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-white">
                          {language === 'te' && s.teluguName
                            ? s.teluguName
                            : language === 'hi' && s.hindiName
                            ? s.hindiName
                            : s.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {s.department} • <span className="text-amber-400">{s.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons Row */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Bot className="w-5 h-5 text-amber-300" />
              {t('askAiBtn')}
            </button>

            <button
              onClick={() => onNavigate('submit')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <ShieldAlert className="w-5 h-5 text-slate-950" />
              {t('submitGrievanceBtn')}
            </button>
          </div>

          {/* Quick Track Input Bar */}
          <div className="pt-6 max-w-lg mx-auto">
            <form
              onSubmit={handleTrackSubmit}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur"
            >
              <input
                type="text"
                value={trackRefId}
                onChange={(e) => setTrackRefId(e.target.value)}
                placeholder={t('trackInputPlaceholder')}
                className="w-full px-3 py-2 text-xs bg-transparent text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shrink-0 transition"
              >
                {t('trackBtn')}
              </button>
            </form>
            {trackError && <p className="text-xs text-red-400 mt-1">{trackError}</p>}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-2">
              <span>Try sample reference:</span>
              <button
                onClick={() => setTrackRefId('GRA-2026-00001')}
                className="text-blue-400 hover:underline font-mono"
              >
                GRA-2026-00001
              </button>
              <span>•</span>
              <button
                onClick={() => setTrackRefId('GRA-2026-00002')}
                className="text-blue-400 hover:underline font-mono"
              >
                GRA-2026-00002
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Counter Card */}
        <div className="max-w-5xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
              {grievances.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Grievances Lodged</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
              {inProgress}
            </div>
            <div className="text-xs text-slate-400 mt-1">Under Active Triage</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {totalResolved}
            </div>
            <div className="text-xs text-slate-400 mt-1">Redressed & Verified</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              18+
            </div>
            <div className="text-xs text-slate-400 mt-1">Verified Govt Services</div>
          </div>
        </div>
      </section>

      {/* Popular Government Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Telangana State & Hyderabad Civic Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('verifiedGovtServices')}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Grounded, officially verified application procedures and required documentation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group shrink-0"
          >
            Explore all 18+ services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => {
            const displayName =
              language === 'te' && service.teluguName
                ? service.teluguName
                : language === 'hi' && service.hindiName
                ? service.hindiName
                : service.name;

            return (
              <div
                key={service.serviceId}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {service.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {service.turnaroundTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition">
                    {displayName}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="text-[11px] text-slate-500 font-medium">
                    <span className="text-slate-700 font-semibold">Department:</span> {service.department}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-bold">
                    {service.fee.includes('Free') ? 'Free Service' : service.fee.split(';')[0]}
                  </span>
                  <button
                    onClick={() => onNavigate('services', { selectedId: service.serviceId })}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                  >
                    {t('viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t('step1Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t('step2Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t('step3Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t('step4Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-xl border border-blue-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-800/80 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Powered by Google Gemini 3.8 Flash
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have questions about certificates, pensions, or local municipal rules?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our AI assistant answers in English, Telugu, or Hindi, cites verified government links, and can automatically categorize your civic issues into formal complaints.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shrink-0 shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Bot className="w-5 h-5 text-slate-950" />
            Launch AI Assistant
          </button>
        </div>
      </section>
    </div>
  );
};
