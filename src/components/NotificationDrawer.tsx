import React, { useState } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Building2,
  Trash2,
  Inbox,
  Send,
  Sparkles,
} from 'lucide-react';
import { EmailNotification, Report } from '../types';
import { STATUS_CONFIG } from '../utils/categories';
import { markNotificationAsReadInFirestore } from '../firebase/service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotification[];
  onSelectReportId?: (reportId: string) => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onSelectReportId,
}) => {
  if (!isOpen) return null;

  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(
    notifications.length > 0 ? notifications[0] : null
  );

  const handleOpenEmail = (notif: EmailNotification) => {
    setSelectedNotif(notif);
    if (!notif.read) {
      markNotificationAsReadInFirestore(notif.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] border border-slate-200 shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Simulated Resident Email Inbox
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Triggered automatically by Firestore status updates on reported issues
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area: Split List & Full Email Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Email List Column (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto bg-slate-50/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No email notifications received yet.</p>
                <p className="text-[11px] text-slate-400">
                  Change the status of an issue in the Admin Console to trigger an automated notification.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => {
                  const isSelected = selectedNotif?.id === notif.id;
                  const newStatusConfig = STATUS_CONFIG[notif.newStatus] || STATUS_CONFIG['Submitted'];

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleOpenEmail(notif)}
                      className={`p-4 cursor-pointer transition-colors relative ${
                        isSelected
                          ? 'bg-white shadow-xs border-l-4 border-l-emerald-600'
                          : notif.read
                          ? 'hover:bg-slate-100/60'
                          : 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                          To: {notif.recipientEmail}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(notif.sentAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold line-clamp-1 mb-1 ${notif.read ? 'text-slate-800' : 'text-slate-900 font-extrabold'}`}>
                        {notif.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded font-mono text-slate-400 bg-slate-100 border border-slate-200">
                          {notif.reportId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${newStatusConfig.bg} ${newStatusConfig.color}`}>
                          {notif.newStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Preview Column (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto bg-white p-6 sm:p-8">
            {selectedNotif ? (
              <div className="max-w-xl mx-auto space-y-6">
                {/* Email Meta Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-xs space-y-2">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>From: <strong className="text-slate-800">CivicLens Dispatch Service &lt;dispatch@civiclens.gov&gt;</strong></span>
                    <span>{new Date(selectedNotif.sentAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    To: <strong className="text-slate-800">{selectedNotif.recipientName} &lt;{selectedNotif.recipientEmail}&gt;</strong>
                  </div>
                  <div className="text-xs font-bold text-slate-900 pt-1 border-t border-slate-200/60">
                    Subject: {selectedNotif.subject}
                  </div>
                </div>

                {/* Simulated Email Body (Official Civic Tech Notice) */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {/* Municipal Branding Header */}
                  <div className="bg-slate-900 text-white p-6 text-center space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 font-bold text-sm shadow-md">
                      CL
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight">
                      City of CivicLens Public Works
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Automated Citizen Notification Dispatch System
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-5 bg-white text-xs leading-relaxed text-slate-700">
                    <p className="font-semibold text-slate-900 text-sm">
                      Hello {selectedNotif.recipientName},
                    </p>

                    <p>
                      This is an automated status notification regarding the community issue you submitted to CivicLens. The official municipal dispatch team has updated the lifecycle state for your report:
                    </p>

                    {/* Status Update Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Report Reference:</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {selectedNotif.reportId}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Issue Summary:</span>
                        <span className="font-bold text-slate-900 text-right truncate max-w-[220px]">
                          {selectedNotif.reportTitle}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">Status Transition:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through text-[11px]">{selectedNotif.previousStatus}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                            STATUS_CONFIG[selectedNotif.newStatus]?.bg || 'bg-emerald-100'
                          } ${
                            STATUS_CONFIG[selectedNotif.newStatus]?.color || 'text-emerald-800'
                          }`}>
                            {selectedNotif.newStatus}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Official Dispatcher Comment ({selectedNotif.dispatcherName}):
                        </span>
                        <p className="text-slate-800 font-medium italic bg-white p-2.5 rounded-xl border border-slate-200">
                          "{selectedNotif.message}"
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectReportId) {
                            onSelectReportId(selectedNotif.reportId);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
                      >
                        Track Progress in Resident Hub
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 text-center">
                      Thank you for taking an active role in maintaining our community infrastructure.
                    </p>
                  </div>

                  {/* Simulated Email Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                    <p>CivicLens Municipal Dispatch • 100 Civic Center Plaza • 24/7 Citizen 311 Services</p>
                    <p>This message was sent to {selectedNotif.recipientEmail} in response to community report #{selectedNotif.reportId}.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select an email notification from the left pane to view full contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
