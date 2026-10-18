/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, testConnection } from './firebase/config';
import { Report, EmailNotification } from './types';
import {
  subscribeToReports,
  subscribeToNotifications,
  seedInitialReportsToFirestore,
  INITIAL_SAMPLE_REPORTS,
  INITIAL_SAMPLE_NOTIFICATIONS,
} from './firebase/service';
import { Navbar } from './components/Navbar';
import { ResidentDashboard } from './components/ResidentDashboard';
import { ReportIssuePage } from './components/ReportIssuePage';
import { AdminDashboard } from './components/AdminDashboard';
import { CommunityInsights } from './components/CommunityInsights';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ConfigModal } from './components/ConfigModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DemoGuideModal } from './components/DemoGuideModal';
import { CivicChatModal } from './components/CivicChatModal';
import {
  ShieldAlert,
  Sparkles,
  Flame,
  CheckCircle2,
  Info,
  Building2,
  Mail,
  ArrowRight,
  X,
  Video,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'resident' | 'report' | 'admin' | 'insights'>('resident');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>(INITIAL_SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Simulated Email Notifications state
  const [notifications, setNotifications] = useState<EmailNotification[]>(INITIAL_SAMPLE_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [activeEmailToast, setActiveEmailToast] = useState<EmailNotification | null>(null);
  const previousNotifCount = useRef(INITIAL_SAMPLE_NOTIFICATIONS.length);

  // Initialize Firebase connection, Auth listener, and Notification listener
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

    // 4. Real-time simulated email notifications subscription
    const unsubscribeNotifications = subscribeToNotifications(
      currentUser?.email,
      currentUser?.uid,
      (updatedNotifs) => {
        // If a new email was just dispatched, show interactive floating toast
        if (updatedNotifs.length > previousNotifCount.current) {
          const newest = updatedNotifs[0];
          setActiveEmailToast(newest);
          setTimeout(() => setActiveEmailToast(null), 8000);
        }
        previousNotifCount.current = updatedNotifs.length;
        setNotifications(updatedNotifs);
      }
    );

    // 5. Optionally seed sample records if needed
    seedInitialReportsToFirestore();

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
      unsubscribeNotifications();
    };
  }, [currentUser]);

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
  // Unread emails count
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

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
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
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

      {/* Simulated Email Inbox Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelectReportId={(reportId) => {
          const found = reports.find((r) => r.id === reportId);
          if (found) setSelectedReport(found);
        }}
      />

      {/* System Configuration & Deployment Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        currentUserEmail={currentUser?.email}
      />

      {/* 5-Minute Demo Video Presenter Teleprompter Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Gemini Civic Chatbot Modal */}
      <CivicChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Floating CivicBot Chatbot Launcher */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 transition-all hover:scale-105 group cursor-pointer"
        title="Open Gemini AI Civic Assistant"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-xs font-bold block leading-none">Ask CivicBot</span>
          <span className="text-[10px] text-emerald-400 block leading-none mt-0.5">Gemini 3.8 Flash</span>
        </div>
      </button>

      {/* Live Animated Floating Email Notification Toast */}
      {activeEmailToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Simulated Email Dispatched
                </span>
                <button
                  onClick={() => setActiveEmailToast(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-white truncate mt-0.5">
                {activeEmailToast.subject}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                Sent to: {activeEmailToast.recipientEmail}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveEmailToast(null);
                    setIsNotificationsOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  View Email
                  <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-slate-400">
                  Status: {activeEmailToast.newStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              Simulated Email Inbox ({unreadNotificationCount})
            </button>
            <span>•</span>
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
