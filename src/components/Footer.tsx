import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Phone, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                CivicConnect<span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t('heroSubtitle')}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Official Verified Knowledge Grounding
            </div>
          </div>

          {/* Quick Civic Redressal Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Civic Redressal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('submit')}
                  className="hover:text-amber-400 transition text-left"
                >
                  Lodge Public Grievance (GHMC / HMWSSB)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-400 transition text-left"
                >
                  Track Grievance Status by Reference ID
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="hover:text-amber-400 transition text-left"
                >
                  Multilingual AI Public Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-amber-400 transition text-left"
                >
                  Telangana Government Service Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('citizen-dash')}
                  className="hover:text-amber-400 transition text-left"
                >
                  Citizen Complaint Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Official Department Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Official Telangana Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.ghmc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  GHMC Official Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.hyderabadwater.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  HMWSSB Water & Sewerage <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tssouthernpower.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  TSSPDCL Electricity Portal <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ts.meeseva.telangana.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  Telangana MeeSeva 2.0 <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://tsbpass.telangana.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  TS-bPASS Building Approvals <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency & Citizen Helplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Emergency & Support
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400">GHMC Control Room</div>
                  <div className="font-bold text-slate-200">040-21111111</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <div>
                  <div className="text-[11px] text-slate-400">HMWSSB Dial-a-Tanker / Leakage</div>
                  <div className="font-bold text-slate-200">155313 / 040-23307777</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400">TSSPDCL Power Emergency</div>
                  <div className="font-bold text-slate-200">1912</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 CivicConnect AI. Built for the citizens of Telangana and Greater Hyderabad.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-400">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
              Public Service Transparency & Zero-Grievance-Loss
            </span>
            <span>English • తెలుగు • हिन्दी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
