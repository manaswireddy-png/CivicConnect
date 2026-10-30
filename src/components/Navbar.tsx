import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import {
  Building2,
  ShieldAlert,
  Bot,
  FileText,
  Search,
  UserCheck,
  LogOut,
  Globe,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  PhoneCall,
  User,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSubmitWithData?: (data: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, t } = useLanguage();
  const {
    userProfile,
    isAdmin,
    signInWithGoogle,
    registerCitizenWithEmail,
    loginWithEmail,
    signInAsDemoCitizen,
    signInAsDemoAdmin,
    signOutUser,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Auth modal internal tabs & form states
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'officer'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const navItems = [
    { id: 'home', label: t('home'), icon: Building2 },
    { id: 'ai-assistant', label: t('aiAssistant'), icon: Bot, highlight: true },
    { id: 'services', label: t('services'), icon: FileText },
    { id: 'submit', label: t('submitGrievance'), icon: ShieldAlert },
    { id: 'track', label: t('trackGrievance'), icon: Search },
    { id: 'citizen-dash', label: t('citizenDashboard'), icon: User },
    ...(isAdmin ? [{ id: 'admin-dash', label: t('adminDashboard'), icon: ShieldCheck, admin: true }] : []),
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authTab === 'register') {
      if (!authName.trim()) {
        setAuthError('Full name is required.');
        return;
      }
      if (!authEmail.trim() || !authEmail.includes('@')) {
        setAuthError('Valid email address is required.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
      if (authPassword !== authConfirmPass) {
        setAuthError('Passwords do not match.');
        return;
      }

      setAuthSubmitting(true);
      try {
        await registerCitizenWithEmail(authName.trim(), authEmail.trim(), authPassword, authPhone.trim());
        setAuthSuccess('Registration successful! You are now logged in as Citizen.');
        setTimeout(() => setAuthModalOpen(false), 1200);
      } catch (err: any) {
        setAuthError(err?.message || 'Registration failed. Email might already be in use.');
      } finally {
        setAuthSubmitting(false);
      }
    } else {
      // Login (Citizen or Officer)
      if (!authEmail.trim()) {
        setAuthError('Email is required.');
        return;
      }
      if (!authPassword) {
        setAuthError('Password is required.');
        return;
      }

      setAuthSubmitting(true);
      try {
        await loginWithEmail(authEmail.trim(), authPassword);
        setAuthSuccess('Signed in successfully.');
        setTimeout(() => setAuthModalOpen(false), 1000);
      } catch (err: any) {
        setAuthError(err?.message || 'Invalid credentials or user does not exist.');
      } finally {
        setAuthSubmitting(false);
      }
    }
  };

  return (
    <>
      {/* Top Gov Header Strip with Indian Tricolor Accent */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
      <header className="border-b border-slate-200 bg-slate-900 text-slate-100 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Government of Telangana • Civic Grievance & Redressal Technology System
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-amber-300 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" /> GHMC Helpline: 040-21111111 • Dial 100
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-xs uppercase">{language}</span>
                <span className="text-[11px] text-slate-400">
                  ({languages.find((l) => l.code === language)?.native})
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white text-slate-900 rounded-md shadow-xl border border-slate-200 z-50 py-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Language / భాష / भाषा
                  </div>
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        language === item.code ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-medium text-slate-500">{item.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Role / User Status */}
            {userProfile ? (
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 ${
                    isAdmin
                      ? 'bg-purple-900/90 text-purple-200 border border-purple-500 shadow-sm'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  {isAdmin ? t('adminRole') : t('citizenRole')}: {userProfile.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-semibold text-xs shadow-sm"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-blue-950 font-sans">
                    CivicConnect<span className="text-blue-600 font-black">AI</span>
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide border border-amber-300">
                    TELANGANA
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 tracking-tight hidden sm:block">
                  {t('tagline')}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? item.admin
                          ? 'bg-purple-800 text-white shadow-sm'
                          : 'bg-blue-900 text-white shadow-sm'
                        : item.admin
                        ? 'text-purple-700 hover:bg-purple-50 font-bold'
                        : item.highlight
                        ? 'text-blue-700 hover:bg-blue-50 font-bold'
                        : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-600' : ''}`} />
                    {item.label}
                    {item.highlight && !isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Action: Quick Submit Grievance */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('submit')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all hover:shadow"
              >
                <ShieldAlert className="w-4 h-4 text-slate-950" />
                {t('submitGrievanceBtn')}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-700 hover:text-blue-900 hover:bg-slate-100"
                aria-label="Open Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-left ${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : item.admin
                      ? 'text-purple-700 bg-purple-50 font-bold'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-sm text-blue-900 font-semibold bg-blue-50 rounded-md"
              >
                {userProfile ? `Manage Account (${userProfile.role})` : t('login')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Role / Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Civic Identity & Access Portal
                </h3>
                <p className="text-xs text-slate-500">
                  Government of Telangana • Single Sign-On & Verification
                </p>
              </div>
              <button
                onClick={() => {
                  setAuthModalOpen(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Active Profile Strip */}
            {userProfile && (
              <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                      {userProfile.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{userProfile.name}</div>
                      <div className="text-xs text-slate-500">{userProfile.email}</div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          userProfile.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {userProfile.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await signOutUser();
                      setAuthSuccess('Logged out successfully.');
                    }}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold border border-red-200 transition flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'login' ? 'bg-white text-blue-950 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Citizen Sign-In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'register' ? 'bg-white text-blue-950 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Register Citizen
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('officer');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'officer' ? 'bg-white text-purple-950 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Officer Portal
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authTab === 'register' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Full Citizen Name *
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. S. Ramesh Reddy"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      10-Digit Mobile Number (For SMS Updates)
                    </label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  {authTab === 'officer' ? 'Official Government Email ID *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={authTab === 'officer' ? 'officer@telangana.gov.in' : 'citizen@example.com'}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {authTab === 'register' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={authConfirmPass}
                    onChange={(e) => setAuthConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition flex items-center justify-center gap-2 ${
                  authTab === 'officer'
                    ? 'bg-purple-900 hover:bg-purple-800'
                    : 'bg-blue-900 hover:bg-blue-800'
                }`}
              >
                {authSubmitting ? (
                  'Verifying...'
                ) : authTab === 'register' ? (
                  'Create Citizen Account'
                ) : authTab === 'officer' ? (
                  'Authenticate as Government Official'
                ) : (
                  'Sign In with Password'
                )}
              </button>
            </form>

            {/* Google OAuth & Audit Personas */}
            <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    setAuthModalOpen(false);
                  } catch (e: any) {
                    setAuthError(e?.message || 'Google authentication failed.');
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google Account
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">1-Click Test Personas</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    signInAsDemoCitizen();
                    setAuthModalOpen(false);
                  }}
                  className="p-3 text-left border border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Citizen Persona
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">K. Venkatesh (Hyderabad)</div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-1">Lodge & Track Private</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signInAsDemoAdmin();
                    setAuthModalOpen(false);
                  }}
                  className="p-3 text-left border border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Officer Persona
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Chief Vigilance Officer</div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-1">Full Admin Triage</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
