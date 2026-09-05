import React, { useState } from "react";
import { 
  Zap, 
  RefreshCw, 
  Lock, 
  Settings, 
  Wand2, 
  BookOpen, 
  Bell, 
  BellOff 
} from "lucide-react";

interface FloatingActionDockProps {
  onOpenSimulator: () => void;
  onRefreshLive: () => void;
  isSyncing: boolean;
  onOpenSuperAdmin: () => void;
  onOpenAdmin: () => void;
  onOpenOnboarding: () => void;
  onOpenStudyGuide: () => void;
  isPushEnabled: boolean;
  onTogglePush: () => void;
}

export const FloatingIndexBar: React.FC<FloatingActionDockProps> = ({
  onOpenSimulator,
  onRefreshLive,
  isSyncing,
  onOpenSuperAdmin,
  onOpenAdmin,
  onOpenOnboarding,
  onOpenStudyGuide,
  isPushEnabled,
  onTogglePush
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    {
      id: "simulator",
      label: "Attack Payload Simulator",
      category: "CYBER WARFARE MATRIX",
      desc: "Simulate zero-day wire fraud, payroll diversion, and quishing attacks.",
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      onClick: onOpenSimulator,
      highlight: true
    },
    {
      id: "sync",
      label: "Autonomous Radar Sweep",
      category: "OPTICAL AIRSPACE SCAN",
      desc: "Trigger an optical and NLP threat sweep across your connected mailbox.",
      icon: <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? "animate-spin" : ""}`} />,
      onClick: onRefreshLive
    },
    {
      id: "super_admin",
      label: "Super Admin Command",
      category: "POLICY CALIBRATION",
      desc: "Adjust AI confidence prompts, calibrate auto-remediation score thresholds, and inspect raw logs.",
      icon: <Lock className="w-4 h-4 text-blue-400" />,
      onClick: onOpenSuperAdmin
    },
    {
      id: "admin",
      label: "Enterprise VIP Directory",
      category: "EXECUTIVE HONEYPOTS",
      desc: "Manage executive VIP targets, lookalike protected domains, and quarantine policies.",
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      onClick: onOpenAdmin
    },
    {
      id: "wizard",
      label: "Mailbox Setup Wizard",
      category: "OAUTH2 GATEWAY",
      desc: "Connect and provision new Google Workspace or Microsoft 365 enterprise mailboxes.",
      icon: <Wand2 className="w-4 h-4 text-blue-400" />,
      onClick: onOpenOnboarding
    },
    {
      id: "guide",
      label: "Defense Architecture Matrix",
      category: "SOC OPERATIONAL GUIDE",
      desc: "Interactive 5-stage educational guide explaining ICES threat models and MITRE ATT&CK mappings.",
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      onClick: onOpenStudyGuide
    },
    {
      id: "push",
      label: isPushEnabled ? "Live Telemetry Chimes: Active" : "Live Telemetry Chimes: Muted",
      category: "AUDIO-VISUAL TELEMETRY",
      desc: "Toggle real-time browser audio chimes and system notifications on threat detection.",
      icon: isPushEnabled ? <Bell className="w-4 h-4 text-blue-400" /> : <BellOff className="w-4 h-4 text-slate-500" />,
      onClick: onTogglePush
    }
  ];

  return (
    <div className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center pointer-events-auto">
      
      {/* Sleek Slim Vertical Dock Rail */}
      <div className="p-1.5 rounded-2xl bg-[#0E1524] border border-slate-700/60 shadow-2xl flex flex-col items-center gap-2">
        {actions.map((act) => {
          const isHovered = hoveredAction === act.id;

          return (
            <div
              key={act.id}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredAction(act.id)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={act.onClick}
            >
              {/* Action Button: Smooth leftward bulge */}
              <button
                className={`w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 ${
                  isHovered
                    ? "-translate-x-2.5 scale-110 bg-[#1E2B45] border border-blue-400 text-white shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                    : act.highlight
                    ? "bg-[#121B2E] border border-blue-500/30 hover:bg-[#1A253E] text-slate-300"
                    : "bg-[#0B111D] border border-white/[0.08] hover:border-slate-500 hover:bg-[#151E30] text-slate-400"
                }`}
              >
                {act.icon}

                {/* Status indicator dot */}
                {act.id === "push" && isPushEnabled && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#3B82F6]" />
                )}
              </button>

              {/* Clean, Sleek Screenshot 2 Style Flyout Card */}
              {isHovered && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3.5 w-80 p-4 rounded-xl bg-[#0E1524] border border-blue-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.85)] pointer-events-none animate-in fade-in slide-in-from-right-3 duration-150 z-50">
                  
                  {/* Arrow Indicator */}
                  <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-[#0E1524] border-t border-r border-blue-500/30" />

                  {/* Header Row: Clean Dot + Category */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider pb-2 border-b border-white/[0.08] mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span>{act.category}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white font-sans tracking-tight mb-1.5">
                    {act.label}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
                    {act.desc}
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};