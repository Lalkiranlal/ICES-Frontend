import React from "react";
import { TokenTelemetry } from "../../types/ices";
import { GlossaryTooltip } from "../common/glossary-tooltip";

interface MetricsBarProps {
  threatsCount: number;
  quarantinedCount: number;
  autoRemediationRate: number;
  mttrSec: number;
  totalEmailsCount: number;
  tokenUsage?: TokenTelemetry | null;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  threatsCount,
  quarantinedCount,
  autoRemediationRate,
  mttrSec,
  totalEmailsCount,
  tokenUsage
}) => {
  const totalTokens = tokenUsage?.total_tokens_consumed || (totalEmailsCount * 380);
  const costUsd = tokenUsage?.estimated_cost_usd || (totalTokens * 0.00000015);

  return (
    <div className="w-full mb-5 bg-[#0E1422] border border-white/[0.08] rounded-xl shadow-xl overflow-visible relative z-20">
      
      {/* Top Telemetry Rail */}
      <div className="px-4 py-2 bg-[#080C14] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-zinc-200 font-semibold">SOC TELEMETRY COCKPIT</span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline">PROTOCOL: GMAIL RFC-822</span>
        </div>

        <div className="flex items-center gap-3">
          <span>GATEWAY: <strong className="text-blue-300 font-semibold">AUTONOMOUS</strong></span>
        </div>
      </div>

      {/* 5-Column Restrained Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
        
        {/* Metric 1: Threat Incidents */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-white/[0.01] transition-colors">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <GlossaryTooltip term="BEC">High-Risk Incidents</GlossaryTooltip>
            {threatsCount > 0 ? (
              <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                CRITICAL
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                ALL CLEAR
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-numbers">
              {threatsCount}
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Intercepted in stream</p>
          </div>
        </div>

        {/* Metric 2: Containment Rate */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-white/[0.01] transition-colors">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <GlossaryTooltip term="QUARANTINED">Containment Rate</GlossaryTooltip>
            <span className="text-[10px] text-zinc-400 font-mono">Score &ge; 80</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-blue-300 tabular-numbers">
              {autoRemediationRate}%
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">{quarantinedCount} isolated in mailbox</p>
          </div>
        </div>

        {/* Metric 3: Remediation Speed */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-white/[0.01] transition-colors">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <GlossaryTooltip term="MTTR">Remediation Speed</GlossaryTooltip>
            <span className="text-[10px] text-zinc-500 font-mono">Live</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-numbers">
              {mttrSec}s
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Sub-second execution</p>
          </div>
        </div>

        {/* Metric 4: Payloads Swept */}
        <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-white/[0.01] transition-colors">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <GlossaryTooltip term="RELAY_HOPS">Payloads Swept</GlossaryTooltip>
            <span className="text-[10px] text-zinc-500 font-mono">Verified</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-numbers">
              {totalEmailsCount}
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Inbound stream verified</p>
          </div>
        </div>

        {/* Metric 5: AI Token Ledger */}
        <div className="p-4 sm:p-5 flex flex-col justify-between bg-blue-600/10 hover:bg-blue-600/20 transition-colors col-span-2 md:col-span-1">
          <div className="text-xs font-mono text-blue-300 flex items-center justify-between">
            <GlossaryTooltip term="AI_TOKENS">AI Token Ledger</GlossaryTooltip>
            <span className="text-[10px] text-blue-400 font-mono font-semibold">{"$" + costUsd.toFixed(4)}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-blue-300 tabular-numbers">
                {totalTokens > 1000 ? (totalTokens / 1000).toFixed(1) + "k" : totalTokens}
              </span>
              <span className="text-xs text-zinc-400 font-mono">tokens</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">Gemini 3.5 Flash Lite</p>
          </div>
        </div>

      </div>
    </div>
  );
};