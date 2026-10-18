import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
  Send,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Report, ReportStatus } from '../types';
import { CATEGORIES_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';
import { updateReportStatusInFirestore } from '../firebase/service';

interface Props {
  report: Report | null;
  onClose: () => void;
  currentUser: User | null;
  isAdminMode: boolean;
  onStatusUpdated?: () => void;
}

export const ReportDetailModal: React.FC<Props> = ({
  report,
  onClose,
  currentUser,
  isAdminMode,
  onStatusUpdated,
}) => {
  if (!report) return null;

  const [newStatus, setNewStatus] = useState<ReportStatus>(report.status);
  const [dispatchNote, setDispatchNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateControls, setShowUpdateControls] = useState(false);

  const catConfig = CATEGORIES_CONFIG[report.category] || CATEGORIES_CONFIG['Other Community Issues'];
  const priorityConfig = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG['Medium'];
  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG['Submitted'];

  const handleCommitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const adminName = currentUser?.displayName || 'City Administrator (Staff)';
      const adminEmail = currentUser?.email || 'admin@civiclens.gov';

      await updateReportStatusInFirestore(
        report.id,
        newStatus,
        dispatchNote.trim() || `Status updated to ${newStatus}`,
        adminName,
        adminEmail
      );
      setShowUpdateControls(false);
      setDispatchNote('');
      onStatusUpdated?.();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Error updating status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl relative overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {report.id}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${catConfig.bgLight} ${catConfig.color} ${catConfig.borderColor}`}>
              <CategoryIcon category={report.category} className="w-3.5 h-3.5" />
              <span>{report.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${priorityConfig.badge}`}>
              {report.priority}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Reporter Meta */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {report.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
              <span>Reported by: <strong className="text-slate-800">{report.userName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {/* Location Bar with Map Link */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-medium truncate mr-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold shrink-0 flex items-center gap-1"
            >
              <span>Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Photo preview if present */}
          {report.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-80 flex items-center justify-center">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="max-h-80 w-full object-contain"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Citizen Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* AI Advisory Analysis Card */}
          {report.aiRecommendation && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Gemini AI Advisory Analysis ({report.aiRecommendation.confidence}% Confidence)
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Human Review Required
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Triage Justification: </strong>
                {report.aiRecommendation.explanation}
              </p>

              <p className="text-xs text-emerald-950 leading-relaxed">
                <strong className="text-emerald-900 font-semibold">Recommended Dispatch: </strong>
                {report.aiRecommendation.recommendedAction}
              </p>

              {report.aiRecommendation.detectedUrgencyFlags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.aiRecommendation.detectedUrgencyFlags.map((flag) => (
                    <span
                      key={flag}
                      className="text-[10px] px-2 py-0.5 rounded bg-white font-semibold text-amber-800 border border-amber-200"
                    >
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4-Step Status Progress Tracker */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Municipal Resolution Lifecycle
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                {report.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ReportStatus[]).map((stepName, idx) => {
                const currentStep = statusConfig.step;
                const isPassed = idx + 1 <= currentStep;
                const isCurrent = idx + 1 === currentStep;

                return (
                  <div key={stepName} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? currentStep === 4
                            ? 'bg-emerald-500'
                            : 'bg-slate-900'
                          : 'bg-slate-200'
                      } ${isCurrent ? 'ring-2 ring-emerald-500/40' : ''}`}
                    />
                    <span className={`text-[10px] font-bold block ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status History Audit Trail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Resolution Audit Trail & Timeline
            </h3>

            <div className="space-y-3 pl-2 border-l-2 border-slate-200">
              {report.statusHistory.map((item, index) => {
                const isLatest = index === report.statusHistory.length - 1;
                return (
                  <div key={item.id} className="relative pl-5 space-y-1">
                    {/* Timeline dot */}
                    <span
                      className={`absolute -left-[11px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                        isLatest ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-400'
                      }`}
                    />

                    <div className="flex items-baseline justify-between text-xs">
                      <div className="font-bold text-slate-900">
                        {item.status}
                        <span className="font-normal text-slate-500 ml-1.5 text-[11px]">
                          by {item.updatedBy}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administrator Status Update Controls */}
          {isAdminMode && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Administrator Actions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpdateControls(!showUpdateControls)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  {showUpdateControls ? 'Hide Controls' : 'Change Status / Add Dispatch Note'}
                </button>
              </div>

              {showUpdateControls && (
                <form onSubmit={handleCommitStatus} className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ReportStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                          newStatus === st
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    placeholder="Dispatch note (e.g. Assigned to crew #2 under work order 4910)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Save Status Update
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
