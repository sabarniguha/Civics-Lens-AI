import React from 'react';
import {
  ShieldAlert,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  UserCheck,
  LogIn,
  LogOut,
  Info,
  Building2,
  Sparkles,
  Mail,
  Bell,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'resident' | 'report' | 'admin' | 'insights';
  setActiveTab: (tab: 'resident' | 'report' | 'admin' | 'insights') => void;
  currentUser: User | null;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isDemoMode: boolean;
  onOpenConfig: () => void;
  pendingReviewCount: number;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isAdminMode,
  setIsAdminMode,
  onSignIn,
  onSignOut,
  isDemoMode,
  onOpenConfig,
  pendingReviewCount,
  unreadNotificationCount,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Civic Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('resident')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-md ring-2 ring-emerald-500/30">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  CivicLens<span className="text-emerald-600">.ai</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Community Issue Resolver
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('resident')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'resident'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Resident Hub
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'report'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all relative ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              Admin Console
              {pendingReviewCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'insights'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Community Insights
            </button>
          </nav>

          {/* Right Area: Role Switcher & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode / Live Status Badge */}
            <button
              onClick={onOpenConfig}
              title="Click to view Firebase & Gemini API configuration status"
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{isDemoMode ? 'Demo Mode' : 'Live Firestore'}</span>
              <Info className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            </button>

            {/* Simulated Resident Email Inbox Button */}
            <button
              onClick={onOpenNotifications}
              title="Open Simulated Resident Email Inbox"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 transition-all border border-slate-200 flex items-center justify-center cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-700" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Admin / Resident Role Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setIsAdminMode(false)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  !isAdminMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch view to Resident role"
              >
                Resident
              </button>
              <button
                onClick={() => setIsAdminMode(true)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  isAdminMode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch view to City Administrator role"
              >
                Admin
              </button>
            </div>

            {/* Auth Section */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                    {currentUser.displayName || 'Resident User'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5 truncate max-w-[120px]">
                    {isAdminMode ? 'City Official' : 'Community Member'}
                  </p>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out of Firebase"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resident')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 ${
              activeTab === 'resident' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Hub
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-lg ${
              activeTab === 'report' ? 'text-emerald-700 bg-emerald-50' : 'text-emerald-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Report
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 ${
              activeTab === 'admin' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 ${
              activeTab === 'insights' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Insights
          </button>
        </div>
      </div>
    </header>
  );
};
