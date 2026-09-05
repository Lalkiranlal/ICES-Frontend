import React, { useState, useMemo } from "react";
import { EmailAlert } from "../../types/ices";
import { Search, Mail, ShieldAlert, ShieldCheck, ArrowRight, Clock, User, CheckCircle2 } from "lucide-react";
import { GlossaryTooltip } from "../common/glossary-tooltip";

interface AlertFeedProps {
  alerts: EmailAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (alert: EmailAlert) => void;
  pageSize?: number;
  apiBase?: string;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  pageSize = 12,
  apiBase
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch =
        a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.sender_header_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.sender_display_name && a.sender_display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.forensic_logs?.[0]?.originating_ip && a.forensic_logs[0].originating_ip.includes(searchTerm));

      const matchSev =
        severityFilter === "ALL" ||
        (severityFilter === "CRITICAL" && a.threat_score >= 80) ||
        (severityFilter === "HIGH_RISK" && a.threat_score >= 50 && a.threat_score < 80) ||
        (severityFilter === "CLEAN" && a.threat_score < 50);

      return matchSearch && matchSev;
    });
  }, [alerts, searchTerm, severityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAlerts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAlerts.slice(startIndex, startIndex + pageSize);
  }, [filteredAlerts, safeCurrentPage, pageSize]);

  const getInitials = (name: string, email: string) => {
    const target = name || email || "User";
    const parts = target.split(/[ <@]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1422] border border-white/10 rounded-xl shadow-lg overflow-hidden font-sans">
      
      {/* Search & Filter Top Header */}
      <div className="p-3.5 bg-[#080C14] border-b border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase">INCOMING MESSAGES</span>
            <span className="text-slate-500 font-mono text-[11px]">({filteredAlerts.length})</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">RECENT FIRST</span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search subject, sender, IP, or payload..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#141B2E] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-sans transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono scrollbar-none">
          {["ALL", "CRITICAL", "HIGH_RISK", "CLEAN"].map(f => (
            <button
              key={f}
              onClick={() => {
                setSeverityFilter(f);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-md border font-semibold transition-all ${
                severityFilter === f
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-[#141B2E] text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
        {paginatedAlerts.length === 0 ? (
          <div className="p-8 text-center font-sans text-xs text-slate-400 flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">No Emails In Stream</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Connect your Google Workspace / Gmail account to ingest real-time inbound emails and analyze zero-day threats.
              </p>
            </div>
            <a
              href={`${apiBase || (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/google/login`}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Connect with Google Account</span>
            </a>
          </div>
        ) : (
          paginatedAlerts.map(alert => {
            const isSelected = selectedAlertId === alert.id;
            const isCrit = alert.threat_score >= 80;
            const isQuarantined = alert.remediation_status.includes("QUARANTINED");
            const senderName = alert.sender_display_name || alert.sender_header_from.split("@")[0];
            const initials = getInitials(senderName, alert.sender_header_from);

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 relative ${
                  isSelected
                    ? "bg-[#18233C] border-2 border-blue-500 shadow-md"
                    : "bg-[#11182A] border border-white/[0.06] hover:border-white/20 hover:bg-[#141E34]"
                }`}
              >
                {/* Top Row: Sender Info + Time + Score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Sender Initial Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isCrit 
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {initials}
                    </div>

                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate">
                        {senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {alert.sender_header_from}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.received_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isCrit 
                        ? "bg-rose-600 text-white" 
                        : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    }`}>
                      {alert.threat_score} {isCrit ? "CRIT" : "SAFE"}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Subject */}
                <div className="pt-0.5">
                  <h4 className={`text-xs font-semibold tracking-tight truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                    {alert.subject || "(No Subject)"}
                  </h4>
                </div>

                {/* Bottom Row: Tags + Auth Status */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[9px] text-slate-500">AUTH:</span>
                    <span className={alert.spf_status === "PASS" ? "text-blue-300" : "text-rose-400"}>
                      SPF:{alert.spf_status || "NONE"}
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className={alert.dkim_status === "PASS" ? "text-blue-300" : "text-rose-400"}>
                      DKIM:{alert.dkim_status || "NONE"}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isQuarantined ? "text-rose-300 bg-rose-500/20 border border-rose-500/30" : "text-blue-300 bg-blue-500/10 border border-blue-500/20"
                  }`}>
                    {isQuarantined ? "QUARANTINED" : "PROTECTED"}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-2.5 bg-[#080C14] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Page {safeCurrentPage} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage <= 1}
            className="px-2 py-0.5 rounded bg-[#141B2E] border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="px-2 py-0.5 rounded bg-[#141B2E] border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};