/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, testConnection } from './firebase/config';
import { Report } from './types';
import {
  subscribeToReports,
  seedInitialReportsToFirestore,
  INITIAL_SAMPLE_REPORTS,
} from './firebase/service';
import { Navbar } from './components/Navbar';
import { ResidentDashboard } from './components/ResidentDashboard';
import { ReportIssuePage } from './components/ReportIssuePage';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunityInsights } from './components/CommunityInsights';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ConfigModal } from './components/ConfigModal';
import {
  ShieldAlert,
  Sparkles,
  Flame,
  CheckCircle2,
  Info,
  Building2,
  Heart,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'resident' | 'report' | 'admin' | 'insights'>('resident');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>(INITIAL_SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Initialize Firebase connection & Auth listener
  useEffect(() => {
    // 1. Test Firestore connection on boot per Firebase skill guidelines
    testConnection().then((isOnline) => {
      if (!isOnline) {
        setIsDemoMode(true);
      }
    });

    // 2. Firebase Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      // Auto-enable admin mode if user is city staff or default test user
      if (user?.email === 'sabarni.guha15@gmail.com' || user?.email?.includes('admin')) {
        setIsAdminMode(true);
      }
    });

    // 3. Real-time reports subscription
    const unsubscribeReports = subscribeToReports((updatedList, isDemo) => {
      setReports(updatedList);
      if (isDemo) {
        setIsDemoMode(true);
      }
    });

    // 4. Optionally seed sample records if needed
    seedInitialReportsToFirestore();

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
    };
  }, []);

  // Sync selectedReport if updated in list
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated) setSelectedReport(updated);
    }
  }, [reports]);

  // Google Sign-In
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Sign in with popup canceled or blocked:', err.message);
      // Don't alert if user merely closed popup
      if (err.code !== 'auth/popup-closed-by-user') {
        alert(`Authentication: ${err.message}. You can continue reporting issues in guest mode.`);
      }
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Pending reviews count
  const pendingReviewCount = reports.filter((r) => r.status === 'Submitted').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isDemoMode={isDemoMode}
        onOpenConfig={() => setIsConfigOpen(true)}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'resident' && (
          <ResidentDashboard
            reports={reports}
            currentUser={currentUser}
            onSelectReport={(report) => setSelectedReport(report)}
            onNavigateToReport={() => setActiveTab('report')}
            isDemoMode={isDemoMode}
          />
        )}

        {activeTab === 'report' && (
          <ReportIssuePage
            currentUser={currentUser}
            onReportCreated={(newReport) => {
              setSelectedReport(newReport);
            }}
            onNavigateToHub={() => setActiveTab('resident')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            reports={reports}
            currentUser={currentUser}
            onSelectReport={(report) => setSelectedReport(report)}
            isDemoMode={isDemoMode}
          />
        )}

        {activeTab === 'insights' && (
          <CommunityInsights
            reports={reports}
            onSelectReport={(report) => setSelectedReport(report)}
            isDemoMode={isDemoMode}
          />
        )}
      </main>

      {/* Detail & History Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        currentUser={currentUser}
        isAdminMode={isAdminMode}
        onStatusUpdated={() => {}}
      />

      {/* System Configuration & Deployment Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        currentUserEmail={currentUser?.email}
      />

      {/* Civic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs">
              CL
            </div>
            <span className="font-bold text-slate-800">CivicLens AI</span>
            <span>— Smart Community Issue Resolver</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Gemini 3.8 Flash
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Cloud Firestore
            </span>
            <span>•</span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              System Setup & Credentials
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
