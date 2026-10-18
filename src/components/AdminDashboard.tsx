import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Report, ReportStatus, ReportPriority, IssueCategory } from '../types';
import { CATEGORIES_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';
import { updateReportStatusInFirestore, deleteReportFromFirestore } from '../firebase/service';

interface Props {
  reports: Report[];
  currentUser: User | null;
  onSelectReport: (report: Report) => void;
  isDemoMode: boolean;
}

export const AdminDashboard: React.FC<Props> = ({
  reports,
  currentUser,
  onSelectReport,
  isDemoMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Status Update Modal state
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Statistics
  const pendingTriageCount = reports.filter((r) => r.status === 'Submitted').length;
  const criticalCount = reports.filter((r) => r.priority === 'Critical' || r.priority === 'High').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || r.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [reports, searchQuery, selectedStatus, selectedPriority, selectedCategory]);

  const handleOpenStatusModal = (report: Report) => {
    setEditingReport(report);
    setNewStatus(report.status);
    setStatusNote('');
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    setIsUpdating(true);
    try {
      const adminName = currentUser?.displayName || 'City Administrator (Staff)';
      const adminEmail = currentUser?.email || 'admin@civiclens.gov';

      await updateReportStatusInFirestore(
        editingReport.id,
        newStatus,
        statusNote || `Status updated to ${newStatus} by municipal triage.`,
        adminName,
        adminEmail
      );
      setEditingReport(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating report status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm(`Are you sure you want to remove report ${reportId} from the municipal record?`)) {
      try {
        await deleteReportFromFirestore(reportId);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Location', 'Priority', 'Status', 'ReportedBy', 'CreatedDate'];
    const rows = filteredReports.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.location.replace(/"/g, '""')}"`,
      r.priority,
      r.status,
      `"${r.userName}"`,
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicLens_Municipal_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            City Administrator Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Triage & Dispatch Console
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review citizen submissions, inspect Gemini AI hazard recommendations, assign departments, and update repair progress.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Triage Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Pending New Intake
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {pendingTriageCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Submitted by residents</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700">
              Critical & High Risks
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {criticalCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Urgent safety priority</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Active In Field
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-1">
            {inProgressCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to municipal crews</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800">
              Resolved Work Orders
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            {resolvedCount}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Completed & verified</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, street..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Filter by Status (All)</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Filter by Priority (All)</option>
            <option value="Critical">Critical Urgent</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Filter by Category (All)</option>
            {Object.keys(CATEGORIES_CONFIG).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Report Details</th>
                <th className="py-3.5 px-4">Category & Department</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">AI Advisory Triage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No reports match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const catConfig = CATEGORIES_CONFIG[report.category] || CATEGORIES_CONFIG['Other Community Issues'];
                  const priorityConfig = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG['Medium'];
                  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG['Submitted'];

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* ID & Title */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 mb-0.5">
                          <span>{report.id}</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p
                          onClick={() => onSelectReport(report)}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
                        >
                          {report.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          By: {report.userName}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 max-w-[180px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                          <CategoryIcon category={report.category} className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{report.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {catConfig.department}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 max-w-[160px]">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${priorityConfig.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                          {report.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                          {report.status}
                        </span>
                      </td>

                      {/* AI Triage */}
                      <td className="py-4 px-4 max-w-[180px]">
                        {report.aiRecommendation ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{report.aiRecommendation.suggestedPriority}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({report.aiRecommendation.confidence}%)
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                              "{report.aiRecommendation.explanation}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None logged</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStatusModal(report)}
                            className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title="Update Status & Add Dispatch Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Update Status
                          </button>

                          <button
                            onClick={() => onSelectReport(report)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Full Incident File"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Archive / Remove Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingReport(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
              <span>{editingReport.id}</span>
              <span>•</span>
              <span className="font-bold text-slate-700">{editingReport.category}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Update Resolution Status
            </h3>
            <p className="text-xs text-slate-500 mb-6 line-clamp-2">
              {editingReport.title}
            </p>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-5">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Lifecycle State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ReportStatus[]).map((st) => {
                    const isSelected = newStatus === st;
                    const stConfig = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? `${stConfig.bg} ${stConfig.color} border-slate-900 ring-2 ring-slate-900/10 shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span>{st}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-normal text-slate-500 block">
                          Step {stConfig.step} of 4
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Note Input */}
              <div>
                <label htmlFor="dispatch-note" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Dispatcher / Field Crew Note
                </label>
                <textarea
                  id="dispatch-note"
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Work order #4920 issued to Road Maintenance crew. Cold patch completed at 2:30 PM."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This update is permanently appended to the public status audit trail.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Update...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Commit Status Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
