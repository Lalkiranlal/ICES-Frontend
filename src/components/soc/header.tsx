import React, { useState, useEffect } from "react";
import { CloudNetLogo } from "../common/cloudnet-logo";
import { Radio, Activity, Cpu, LogIn, ChevronDown, Check } from "lucide-react";

interface HeaderProps {
  onRefreshFeed?: () => void;
  onRefreshLive?: (isManualSync?: boolean) => Promise<void>;
  isSyncing?: boolean;
  activeMailbox?: string;
  userEmail?: string;
  onSwitchUserEmail?: (email: string) => void;
  onOpenSimulator?: () => void;
  onOpenAdmin?: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenOnboarding?: () => void;
  onOpenStudyGuide?: () => void;
  isSimulating?: boolean;
  isPushEnabled?: boolean;
  onTogglePush?: () => void;
  threatsDetected?: number;
  currentView?: string;
  activeView?: string;
  onSelectView?: (view: any) => void;
  theme?: string;
  onToggleTheme?: () => void;
  apiBase?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  activeMailbox,
  onSwitchUserEmail,
  onOpenOnboarding,
  apiBase
}) => {
  const [utcTime, setUtcTime] = useState("");
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [monitoredAccounts, setMonitoredAccounts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ices_monitored_accounts");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const currentEmail = userEmail || activeMailbox || (monitoredAccounts.length > 0 ? monitoredAccounts[0] : "Select Monitored Mailbox");

  // Keep monitored accounts up to date when userEmail changes
  useEffect(() => {
    if (userEmail && !monitoredAccounts.includes(userEmail.toLowerCase().trim())) {
      const updated = [userEmail.toLowerCase().trim(), ...monitoredAccounts];
      setMonitoredAccounts(updated);
      try {
        localStorage.setItem("ices_monitored_accounts", JSON.stringify(updated));
      } catch (e) {}
    }
  }, [userEmail]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectEmail = (email: string) => {
    if (onSwitchUserEmail) {
      onSwitchUserEmail(email);
    }
    setIsSwitcherOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmailInput.trim().toLowerCase();
    if (clean) {
      if (!monitoredAccounts.includes(clean)) {
        const updated = [clean, ...monitoredAccounts];
        setMonitoredAccounts(updated);
        try {
          localStorage.setItem("ices_monitored_accounts", JSON.stringify(updated));
        } catch (e) {}
      }
      if (onSwitchUserEmail) {
        onSwitchUserEmail(clean);
      }
      setCustomEmailInput("");
      setIsSwitcherOpen(false);
    }
  };

  const handleGoogleOAuthLogin = () => {
    const base = apiBase || (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";
    window.location.href = `${base}/auth/google/login`;
  };

  return (
    <header className="mb-5 p-4 rounded-xl bg-[#0E1422] border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 relative z-30">
      
      {/* Left: Vector Logo + Identity */}
      <div className="flex items-center gap-3">
        <CloudNetLogo size={32} glow={false} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white font-sans tracking-tight">
              CloudNet ICES
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase">
              ZERO-TRUST SOC
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Autonomous Integrated Cloud Email Security &amp; Inbound Threat Defense Matrix
          </p>
        </div>
      </div>

      {/* Right: Telemetry & UTC Mission Clock */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-end text-xs font-mono">
        
        {/* Interactive Target Mailbox Uplink Capsule */}
        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="px-3 py-1.5 rounded-lg bg-[#080C14] hover:bg-[#121B2D] border border-white/[0.08] hover:border-blue-500/40 flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
            title="Click to switch active monitored mailbox or connect Google account"
          >
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 hidden sm:inline">UPLINK:</span>
            <span className="text-blue-300 font-medium text-xs truncate max-w-[180px]">{currentEmail}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Mailbox Switcher Dropdown */}
          {isSwitcherOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-xl bg-[#0E1524] border border-blue-500/30 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-sans">
              <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span>Active Monitored Mailbox</span>
                <span className="text-[9px] text-slate-400 font-normal">TENANT ISOLATION</span>
              </div>

              {/* Monitored Accounts List */}
              {monitoredAccounts.length > 0 ? (
                <div className="space-y-1 mb-3 max-h-36 overflow-y-auto">
                  {monitoredAccounts.map((email) => {
                    const isCurrent = currentEmail.toLowerCase() === email.toLowerCase();
                    return (
                      <button
                        key={email}
                        onClick={() => handleSelectEmail(email)}
                        className={`w-full p-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          isCurrent
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-[#141B2E] text-slate-300 hover:bg-[#1A253E] hover:text-white"
                        }`}
                      >
                        <span className="truncate">{email}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-2 mb-2 rounded bg-white/[0.03] text-[11px] text-slate-400 font-mono text-center">
                  No mailboxes connected yet.
                </div>
              )}

              {/* Custom Email Input */}
              <form onSubmit={handleCustomSubmit} className="mb-2">
                <input
                  type="email"
                  placeholder="Enter mailbox email (e.g. user@domain.com)..."
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#080C14] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono mb-1.5"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Switch to Mailbox
                </button>
              </form>

              {/* Connect New Google Account via OAuth */}
              <button
                onClick={handleGoogleOAuthLogin}
                className="w-full py-1.5 rounded-lg bg-[#141B2E] hover:bg-[#1B273E] border border-white/10 text-blue-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Connect via Google OAuth</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Mission Clock */}
        <div className="px-3 py-1.5 rounded-lg bg-[#080C14] border border-white/[0.08] flex items-center gap-2 text-slate-400 text-xs">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="tabular-numbers text-slate-200">{utcTime || "SYNCHRONIZING..."}</span>
        </div>

        {/* Engine Armed Beacon */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-[10px]">
          <Cpu className="w-3.5 h-3.5" />
          <span>GEMINI 3.5 FLASH</span>
        </div>

      </div>

    </header>
  );
};