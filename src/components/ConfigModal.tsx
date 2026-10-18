import React from 'react';
import {
  X,
  ShieldCheck,
  Flame,
  Sparkles,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  currentUserEmail?: string | null;
}

export const ConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDemoMode,
  setIsDemoMode,
  currentUserEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              System & Integration Status
            </h2>
            <p className="text-xs text-slate-500">
              CivicLens AI Services & Cloud Run Readiness
            </p>
          </div>
        </div>

        {/* Services Status Cards */}
        <div className="space-y-3">
          {/* Cloud Firestore */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Flame className="w-4 h-4 text-orange-500" />
                Cloud Firestore & Firebase Auth
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Provisioned
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
              <p>Project ID: <span className="text-slate-900 font-bold">{firebaseConfig.projectId}</span></p>
              <p>Database: <span className="text-slate-900">{firebaseConfig.firestoreDatabaseId}</span></p>
              <p>Auth Status: <span className="text-slate-900 font-bold">{currentUserEmail ? `Signed in as ${currentUserEmail}` : 'Guest session active'}</span></p>
            </div>
          </div>

          {/* Gemini AI */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Gemini 3.8 Flash AI Engine
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Server-Side Secure
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              API calls are made exclusively from server-side code (<code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/analyze-issue</code>). API keys are never exposed to browser bundles.
            </p>
          </div>

          {/* Google Cloud Run Deployment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Cloud className="w-4 h-4 text-blue-600" />
                Google Cloud Run Deployment
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full-stack Node.js + Express backend serving the production React bundle and API routes on <code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded text-[11px]">PORT 3000</code>.
            </p>
          </div>
        </div>

        {/* Demo Mode Switch */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 block">
              Sample Data / Demo Mode
            </span>
            <p className="text-[11px] text-amber-700">
              Populates realistic civic issues across neighborhoods for immediate demonstration.
            </p>
          </div>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isDemoMode
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {isDemoMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
