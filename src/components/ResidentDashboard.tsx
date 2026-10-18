import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Report, ReportStatus, IssueCategory, ReportPriority } from '../types';
import { CATEGORIES_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  reports: Report[];
  currentUser: User | null;
  onSelectReport: (report: Report) => void;
  onNavigateToReport: () => void;
  isDemoMode: boolean;
}

export const ResidentDashboard: React.FC<Props> = ({
  reports,
  currentUser,
  onSelectReport,
  onNavigateToReport,
  isDemoMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Stats calculation
  const totalCount = reports.length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);

      // Status Tab
      let matchesStatus = true;
      if (selectedStatusTab === 'my') {
        matchesStatus = currentUser ? r.userId === currentUser.uid : true;
      } else if (selectedStatusTab !== 'all') {
        matchesStatus = r.status === selectedStatusTab;
      }

      // Category filter
      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || r.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [reports, searchQuery, selectedStatusTab, selectedCategory, selectedPriority, currentUser]);

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hero Banner with Civic Stats */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Community Resolution Live Dispatch
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Community Issue Resolver
            </h1>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time municipal dispatch and tracking system. Report neighborhood hazards, inspect public works status, and track community resolutions powered by Gemini AI triage.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-3">
            <button
              onClick={onNavigateToReport}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Report New Issue
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center sm:text-left">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Total Community Reports
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 block">
              {totalCount}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
              Active In Progress
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-0.5 block">
              {inProgressCount}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
              Resolved Issues
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-0.5 block">
              {resolvedCount}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold block">
              Community Resolution Rate
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-300 mt-0.5 block">
              {resolutionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, keyword, address, or ID..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORIES_CONFIG).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical Urgent</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs">
          {[
            { id: 'all', label: `All Reports (${reports.length})` },
            { id: 'my', label: 'My Submissions' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Resolved', label: 'Resolved' },
          ].map((tab) => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No community reports found</h3>
          <p className="text-xs text-slate-500 mb-6">
            No issues match your current search or filter parameters. Try clearing filters or submit a new report.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusTab('all');
                setSelectedCategory('all');
                setSelectedPriority('all');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Report Issue
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const catConfig = CATEGORIES_CONFIG[report.category] || CATEGORIES_CONFIG['Other Community Issues'];
            const priorityConfig = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG['Medium'];
            const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG['Submitted'];

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <div>
                  {/* Photo Thumbnail if present */}
                  {report.imageUrl && (
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[240px]">{report.location}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-3.5">
                    {/* Header: Category Badge + Priority Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${catConfig.bgLight} ${catConfig.color} ${catConfig.borderColor}`}>
                        <CategoryIcon category={report.category} className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{report.category}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${priorityConfig.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                        {report.priority}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {report.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    {/* Location (if no photo displayed) */}
                    {!report.imageUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </div>
                    )}

                    {/* Gemini AI Recommendation Pill */}
                    {report.aiRecommendation && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-0.5">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          AI Advisory Triage ({report.aiRecommendation.confidence}% conf.)
                        </div>
                        <p className="text-[11px] text-emerald-950 line-clamp-1 italic">
                          "{report.aiRecommendation.explanation}"
                        </p>
                      </div>
                    )}

                    {/* 4-Step Status Visualizer */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                        <span className="text-slate-400 uppercase tracking-wider">Lifecycle Status:</span>
                        <span className={`px-2 py-0.5 rounded-md font-extrabold ${statusConfig.bg} ${statusConfig.color}`}>
                          {report.status}
                        </span>
                      </div>

                      {/* 4-segment progress bar */}
                      <div className="grid grid-cols-4 gap-1">
                        {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ReportStatus[]).map((stepName, idx) => {
                          const currentStep = statusConfig.step;
                          const isCompleted = idx + 1 <= currentStep;
                          const isCurrent = idx + 1 === currentStep;

                          let barColor = 'bg-slate-100';
                          if (isCompleted) {
                            if (currentStep === 4) barColor = 'bg-emerald-500';
                            else if (currentStep === 3) barColor = 'bg-indigo-500';
                            else if (currentStep === 2) barColor = 'bg-amber-500';
                            else barColor = 'bg-blue-500';
                          }

                          return (
                            <div key={stepName} className="space-y-1">
                              <div className={`h-1.5 rounded-full transition-all ${barColor} ${isCurrent ? 'ring-2 ring-emerald-500/30' : ''}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatRelativeTime(report.createdAt)}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                    Track Resolution
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
