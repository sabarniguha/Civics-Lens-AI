import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Report, IssueCategory, AICommunitySummaryResponse } from '../types';
import { CATEGORIES_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  isDemoMode: boolean;
}

export const CommunityInsights: React.FC<Props> = ({
  reports,
  onSelectReport,
  isDemoMode,
}) => {
  const [aiSummary, setAiSummary] = useState<AICommunitySummaryResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Calculate Category breakdown
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CATEGORIES_CONFIG).forEach((cat) => {
      counts[cat] = 0;
    });
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const total = reports.length || 1;
    return Object.entries(counts)
      .map(([cat, count]) => ({
        category: cat as IssueCategory,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // Calculate Status breakdown
  const statusCounts = React.useMemo(() => {
    const counts = {
      Submitted: 0,
      'Under Review': 0,
      'In Progress': 0,
      Resolved: 0,
    };
    reports.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });
    return counts;
  }, [reports]);

  // Calculate Priority breakdown
  const priorityCounts = React.useMemo(() => {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    reports.forEach((r) => {
      if (counts[r.priority] !== undefined) {
        counts[r.priority]++;
      }
    });
    return counts;
  }, [reports]);

  // Fetch or generate AI community summary
  const fetchCommunitySummary = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/insights-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchCommunitySummary();
  }, [reports.length]);

  const totalReports = reports.length || 1;
  const resolutionRate = Math.round((statusCounts.Resolved / totalReports) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Civic Intelligence & Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Insights & Infrastructure Trends
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Live municipal issue distributions, resolution throughput pipelines, and Gemini-synthesized neighborhood pattern analysis.
          </p>
        </div>

        <button
          onClick={fetchCommunitySummary}
          disabled={isLoadingAi}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-center disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingAi ? 'animate-spin' : ''}`} />
          {isLoadingAi ? 'Synthesizing with Gemini...' : 'Refresh AI Strategic Digest'}
        </button>
      </div>

      {/* AI Community Problem Summary Banner (Gemini 3.8 Flash) */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Gemini AI Neighborhood Problem Synthesis
                </h2>
                <p className="text-[11px] text-slate-400">
                  Automated strategic briefing synthesized from active civic reports
                </p>
              </div>
            </div>

            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Executive Briefing
            </span>
          </div>

          {/* AI Executive Summary paragraph */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {aiSummary ? (
                aiSummary.summary
              ) : (
                'Analyzing community data points... Road surface degradation and stormwater basin clearances currently represent the most frequent resident complaints.'
              )}
            </p>
          </div>

          {/* Key Recurring Problem Themes */}
          {aiSummary?.keyThemes && aiSummary.keyThemes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Recurring Themes & Recommended Civic Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiSummary.keyThemes.map((theme, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-2"
                  >
                    <span className="text-xs font-bold text-emerald-400 block">
                      {theme.theme}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Hotspot Focus:
                      </span>
                      <p className="text-xs text-slate-300 font-medium">{theme.affectedAreas}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400/80 uppercase font-semibold block">
                        Action:
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {theme.recommendedCivicAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Category Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Issues by Municipal Category
              </h2>
              <p className="text-xs text-slate-500">
                Breakdown of active and resolved community reports
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {reports.length} Total
            </span>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="space-y-3.5 pt-1">
            {categoryCounts.map((item) => {
              const catConfig = CATEGORIES_CONFIG[item.category] || CATEGORIES_CONFIG['Other Community Issues'];
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[240px] sm:max-w-none">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                      <span>{item.count}</span>
                      <span className="text-slate-400 font-normal text-[11px]">({item.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Status Pipeline & Priority Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Pipeline Funnel */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Lifecycle Resolution Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Turnaround status from submission to resolution
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {resolutionRate}% Resolved
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { status: 'Submitted', count: statusCounts.Submitted, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                { status: 'Under Review', count: statusCounts['Under Review'], color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                { status: 'In Progress', count: statusCounts['In Progress'], color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
                { status: 'Resolved', count: statusCounts.Resolved, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
              ].map((step) => {
                const pct = Math.round((step.count / totalReports) * 100);
                return (
                  <div key={step.status} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{step.status}</span>
                      <span className={`${step.text} font-mono`}>
                        {step.count} issues ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${step.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Urgency Distribution */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Severity Urgency Profile
            </h2>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { name: 'Critical Urgent', count: priorityCounts.Critical, badge: 'text-rose-700 bg-rose-50 border-rose-200' },
                { name: 'High Priority', count: priorityCounts.High, badge: 'text-amber-700 bg-amber-50 border-amber-200' },
                { name: 'Medium Priority', count: priorityCounts.Medium, badge: 'text-blue-700 bg-blue-50 border-blue-200' },
                { name: 'Low Priority', count: priorityCounts.Low, badge: 'text-slate-700 bg-slate-100 border-slate-200' },
              ].map((item) => (
                <div key={item.name} className={`p-3.5 rounded-2xl border ${item.badge} text-center space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    {item.name}
                  </span>
                  <span className="text-2xl font-black block font-mono">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
