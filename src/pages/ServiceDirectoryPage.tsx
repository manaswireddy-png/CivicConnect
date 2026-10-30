import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { VERIFIED_SERVICES } from '../data/servicesData';
import { GovernmentService } from '../types';
import {
  Search,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  X,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';

interface ServiceDirectoryPageProps {
  initialSelectedId?: string;
}

export const ServiceDirectoryPage: React.FC<ServiceDirectoryPageProps> = ({
  initialSelectedId,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalService, setActiveModalService] = useState<GovernmentService | null>(null);

  // Extract categories
  const categories = ['All', ...Array.from(new Set(VERIFIED_SERVICES.map((s) => s.category)))];

  useEffect(() => {
    if (initialSelectedId) {
      const found = VERIFIED_SERVICES.find((s) => s.serviceId === initialSelectedId);
      if (found) {
        setActiveModalService(found);
      }
    }
  }, [initialSelectedId]);

  // Filter services
  const filteredServices = VERIFIED_SERVICES.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      service.name.toLowerCase().includes(q) ||
      (service.teluguName && service.teluguName.includes(q)) ||
      (service.hindiName && service.hindiName.includes(q)) ||
      service.department.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Public Services Database
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('directoryTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          {t('directorySubtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service, department, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat === 'All' ? t('allCategories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid (18 verified services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const displayName =
            language === 'te' && service.teluguName
              ? service.teluguName
              : language === 'hi' && service.hindiName
              ? service.hindiName
              : service.name;

          return (
            <div
              key={service.serviceId}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:border-blue-400 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
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

                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  <span className="text-slate-700 font-bold">Authority:</span> {service.department}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold truncate max-w-[50%]">
                  {service.fee.split(';')[0]}
                </span>
                <button
                  onClick={() => setActiveModalService(service)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                >
                  {t('viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Service Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900 uppercase">
                  {activeModalService.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {language === 'te' && activeModalService.teluguName
                    ? activeModalService.teluguName
                    : language === 'hi' && activeModalService.hindiName
                    ? activeModalService.hindiName
                    : activeModalService.name}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Department: <strong className="text-slate-800">{activeModalService.department}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveModalService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activeModalService.description}
              </p>
            </div>

            {/* Eligibility */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('eligibility')}</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200 font-medium">
                {activeModalService.eligibility}
              </p>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('documentsRequired')}</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeModalService.requiredDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Procedure */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('stepProcedure')}</h4>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {activeModalService.procedure}
              </div>
            </div>

            {/* Key Service Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('serviceFee')}</span>
                <span className="font-bold text-slate-900">{activeModalService.fee}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('serviceTurnaround')}</span>
                <span className="font-bold text-slate-900">{activeModalService.turnaroundTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('helplineNumber')}</span>
                <span className="font-bold text-blue-900">{activeModalService.helpline}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('lastReviewed')}</span>
                <span className="font-bold text-emerald-800">{activeModalService.lastReviewed}</span>
              </div>
            </div>

            {/* Official Source Link Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Officially grounded in verified department government orders.
              </div>
              <a
                href={activeModalService.officialSource}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
              >
                <span>{t('officialPortal')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
