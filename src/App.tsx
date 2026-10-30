/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GrievanceProvider } from './context/GrievanceContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ServiceDirectoryPage } from './pages/ServiceDirectoryPage';
import { GrievanceSubmissionPage } from './pages/GrievanceSubmissionPage';
import { TrackGrievancePage } from './pages/TrackGrievancePage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GrievanceSuggestion } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [trackRefId, setTrackRefId] = useState<string | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [prefillGrievance, setPrefillGrievance] = useState<
    (GrievanceSuggestion & { descriptionText?: string }) | null
  >(null);

  const handleNavigate = (page: string, params?: any) => {
    if (params?.refId) {
      setTrackRefId(params.refId);
    }
    if (params?.selectedId) {
      setSelectedServiceId(params.selectedId);
    }
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGrievanceFromAI = (
    data: GrievanceSuggestion & { descriptionText?: string }
  ) => {
    setPrefillGrievance(data);
    setActiveTab('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <GrievanceProvider>
          <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Global Civic Top Navigation */}
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1">
              {activeTab === 'home' && <HomePage onNavigate={handleNavigate} />}
              {activeTab === 'ai-assistant' && (
                <AIAssistantPage
                  onOpenGrievanceFormWithData={handleOpenGrievanceFromAI}
                />
              )}
              {activeTab === 'services' && (
                <ServiceDirectoryPage initialSelectedId={selectedServiceId} />
              )}
              {activeTab === 'submit' && (
                <GrievanceSubmissionPage
                  prefillData={prefillGrievance}
                  onNavigate={handleNavigate}
                />
              )}
              {activeTab === 'track' && (
                <TrackGrievancePage
                  initialRefId={trackRefId}
                  onNavigate={handleNavigate}
                />
              )}
              {activeTab === 'citizen-dash' && (
                <CitizenDashboardPage onNavigate={handleNavigate} />
              )}
              {activeTab === 'admin-dash' && <AdminDashboardPage />}
            </main>

            {/* Official Footer */}
            <Footer onNavigate={handleNavigate} />
          </div>
        </GrievanceProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
