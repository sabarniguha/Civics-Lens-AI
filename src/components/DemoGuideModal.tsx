import React, { useState } from 'react';
import {
  X,
  Video,
  Clock,
  Play,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Flame,
  Cloud,
  Copy,
  Check,
  Building2,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Mail,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'resident' | 'report' | 'admin' | 'insights') => void;
  onOpenNotifications: () => void;
}

interface ScriptSegment {
  timecode: string;
  duration: string;
  title: string;
  icon: any;
  script: string;
  screenAction: string;
  targetTab?: 'resident' | 'report' | 'admin' | 'insights';
  specialAction?: 'notifications';
}

const SEGMENTS: ScriptSegment[] = [
  {
    timecode: '0:00 – 0:35',
    duration: '35s',
    title: 'Introduction & Civic Mission',
    icon: LayoutDashboard,
    targetTab: 'resident',
    script: `Hello everyone! Today, I am presenting CivicLens AI, a smart community issue resolver designed to improve how civic problems are reported, prioritized, and tracked.

Issues such as potholes, overflowing garbage, water leakage, and broken streetlights affect everyday life. However, reporting these problems and tracking their resolution can be difficult when information is scattered across different channels.

CivicLens AI aims to bring reporting, AI-assisted analysis, and transparent status tracking together in one platform.`,
    screenAction:
      'Show the CivicLens AI homepage on Resident Hub. Highlight the civic statistics banner (Total Community Reports, Active In Progress, Resolved Rate). Scroll through recent community cards.',
  },
  {
    timecode: '0:35 – 1:30',
    duration: '55s',
    title: 'Resident Reporting Flow',
    icon: PlusCircle,
    targetTab: 'report',
    script: `Let's begin with the resident experience.

A resident can report a civic issue by entering its description, selecting a category, providing the location, and attaching a photo where supported.

For example, a resident may report a large pothole on a main road.

The platform is designed to keep the reporting process simple and organize each issue into a structured record. This helps administrators understand what the problem is, where it occurred, and what action may be required.`,
    screenAction:
      'Click "Report Issue". Show the clean form with Title, Description, Location, and Photo Upload. Click "Use My GPS" or one of the Quick Pick landmarks to demonstrate one-click location entry.',
  },
  {
    timecode: '1:30 – 2:25',
    duration: '55s',
    title: 'AI-Assisted Analysis with Gemini',
    icon: Sparkles,
    targetTab: 'report',
    script: `Next comes the AI-assisted analysis.

Using Google Gemini, CivicLens AI can analyze an issue description and suggest an appropriate category, a priority level, and a brief explanation.

For example, a pothole report may be categorized under roads and infrastructure, with a suggested high priority based on the description provided.

These results are recommendations, not final decisions. An administrator should review them before deciding what action to take.

This approach aims to make initial report assessment more consistent while keeping human judgment involved.`,
    screenAction:
      'Type or paste a pothole description near a school zone. Click "Analyze with CivicLens AI". Watch Gemini 3.8 Flash return category, High Priority, confidence meter, hazard explanation, and dispatch action. Point out the clear "Human Review Required" safeguard.',
  },
  {
    timecode: '2:25 – 3:35',
    duration: '70s',
    title: 'Administrator Dashboard & Community Insights',
    icon: Building2,
    targetTab: 'admin',
    script: `Now let's look at the administrator experience.

The dashboard is designed to organize reports by category, priority, location, and current status.

Administrators can review incoming reports and update their progress through stages such as Submitted, Under Review, In Progress, and Resolved.

Residents can then track the progress of their submissions.

The community insights section can help summarize recurring categories of problems and identify areas that may need additional attention.

By combining structured reports and status history, CivicLens AI aims to improve visibility and accountability throughout the resolution process.`,
    screenAction:
      'Switch to the Admin Console. Show the filterable ledger. Click "Update Status" on a report to advance it to "In Progress" with a crew note. Then click "Community Insights" to show the category bar charts and AI Strategic Digest.',
  },
  {
    timecode: '3:35 – 4:25',
    duration: '50s',
    title: 'Google Technology Stack',
    icon: Cloud,
    script: `CivicLens AI is designed around Google technologies.

Google Gemini provides AI-assisted classification and explanatory insights.

Firebase Authentication supports user sign-in and access management. Cloud Firestore stores issue records and their status history.

Google Cloud Run hosts the backend service that processes requests and connects the application to the relevant services.

Together, these technologies provide a foundation for an application that can be expanded as its needs grow.`,
    screenAction:
      'Open the "System Setup & Credentials" modal (or show the footer badges). Point to Google Gemini 3.8 Flash, Cloud Firestore database ID, Firebase Auth with Google Sign-In, and Cloud Run server-side deployment.',
  },
  {
    timecode: '4:25 – 5:00',
    duration: '35s',
    title: 'Impact, Notifications & Closing',
    icon: Mail,
    specialAction: 'notifications',
    script: `CivicLens AI aims to make civic reporting easier for residents and issue management more organized for administrators.

Future improvements could include regional-language support, map-based issue visualization, duplicate-report detection, notifications, and more detailed resolution analytics.

Our goal is simple: to connect community reporting with AI-assisted insights and transparent follow-up.

Thank you for watching this demonstration of CivicLens AI — smarter reporting for better communities.`,
    screenAction:
      'Click the Mail icon in the navbar to showcase the Simulated Resident Email Notification Inbox, showing real-time emails triggered on status updates. Return to Resident Hub with a final view of the resolution board.',
  },
];

export const DemoGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenNotifications,
}) => {
  if (!isOpen) return null;

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const currentSeg = SEGMENTS[activeSegmentIndex];

  const handleCopyFullScript = () => {
    const fullText = SEGMENTS.map(
      (s) => `## ${s.timecode} | ${s.title}\n\n${s.script}\n\n[Visual Action: ${s.screenAction}]\n`
    ).join('\n---\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerScreenAction = (seg: ScriptSegment) => {
    if (seg.specialAction === 'notifications') {
      onClose();
      onOpenNotifications();
    } else if (seg.targetTab) {
      onNavigateTab(seg.targetTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] border border-slate-200 shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  CivicLens AI — 5-Minute Demo Video Presenter Guide
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Interactive Teleprompter
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Segment-by-segment script pacing, camera cues, and one-click app navigation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullScript}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Full Script' : 'Copy Full Script'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Segments Timeline + Right Teleprompter */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Segments List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto bg-slate-50/40 divide-y divide-slate-100">
            {SEGMENTS.map((seg, idx) => {
              const isSelected = activeSegmentIndex === idx;
              const Icon = seg.icon;
              return (
                <div
                  key={seg.timecode}
                  onClick={() => setActiveSegmentIndex(idx)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-l-4 border-l-emerald-600 shadow-xs'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {seg.timecode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Duration: {seg.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-slate-900 text-emerald-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {seg.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {seg.script}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Teleprompter & Live Stage Directions (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Segment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg">
                      {currentSeg.timecode}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      ({currentSeg.duration} segment)
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {currentSeg.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleTriggerScreenAction(currentSeg)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-center"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jump to Screen
                </button>
              </div>

              {/* What to Show On Screen (Visual Stage Direction) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  🎥 Visual Screen Action (What to record)
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {currentSeg.screenAction}
                </p>
              </div>

              {/* Narration Script (Teleprompter view) */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  🎙️ Spoken Narration Script
                </span>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 font-sans text-sm sm:text-base leading-relaxed text-slate-800 space-y-3 font-normal">
                  {currentSeg.script.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Paging Footer Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={activeSegmentIndex === 0}
                onClick={() => setActiveSegmentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous Segment
              </button>

              <span className="text-xs font-semibold text-slate-500 font-mono">
                Segment {activeSegmentIndex + 1} of {SEGMENTS.length}
              </span>

              <button
                disabled={activeSegmentIndex === SEGMENTS.length - 1}
                onClick={() => setActiveSegmentIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Segment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
