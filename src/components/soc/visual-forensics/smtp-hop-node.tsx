import React from "react";
import { Handle, Position } from "@xyflow/react";
import { ShieldCheck, Globe, Server, Radio, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface SmtpHopNodeData {
  hopIndex: number;
  totalHops: number;
  nodeRole: "ORIGIN" | "INTERMEDIATE_RELAY" | "GATEWAY_DEST";
  nodeRoleLabel: string;
  fromRelay: string;
  byRelay: string;
  ip: string;
  country: string;
  countryName: string;
  city: string;
  asn: string;
  isp: string;
  protocol: string;
  isSuspicious: boolean;
  isTorOrVpn: boolean;
  anomalies: string[];
  delayMs: number;
}

export const SmtpHopNode: React.FC<{ data: SmtpHopNodeData }> = ({ data }) => {
  const isOrigin = data.nodeRole === "ORIGIN";
  const isGateway = data.nodeRole === "GATEWAY_DEST";
  const isSuspicious = data.isSuspicious;

  const displayHost = isOrigin
    ? (data.fromRelay || data.ip)
    : isGateway
    ? (data.byRelay || "mx.google.com")
    : (data.fromRelay || data.byRelay || data.ip);

  const displayOrg = data.isp || (data.asn.includes("(") ? data.asn.split("(")[1].replace(")", "") : data.asn);

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 w-72 text-left transition-all duration-200 font-sans shadow-lg",
        isSuspicious
          ? "bg-[#1F1215] border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
          : isOrigin
          ? "bg-[#171922] border-blue-500/40"
          : isGateway
          ? "bg-[#111C18] border-blue-500/40"
          : "bg-[#141A26] border-white/10 hover:border-white/20"
      )}
    >
      {/* ReactFlow Connection Handles */}
      {!isOrigin && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 !bg-slate-300 border-2 !border-[#050811]"
        />
      )}
      {!isGateway && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 !bg-slate-300 border-2 !border-[#050811]"
        />
      )}

      {/* Header Bar with Role and Step */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {isSuspicious ? (
            <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            </div>
          ) : isOrigin ? (
            <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
          ) : isGateway ? (
            <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="p-1 rounded-md bg-slate-800 text-slate-400">
              <Server className="w-3.5 h-3.5" />
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-wide text-slate-100 block">
              {`HOP ${data.hopIndex} // ${data.nodeRoleLabel}`}
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">
              {isOrigin ? "Originating Client Host" : isGateway ? "Ingestion Gateway Point" : "Intermediate Transit Relay"}
            </span>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-mono font-medium shrink-0 border",
            isSuspicious
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : "bg-slate-800 text-slate-300 border-white/10"
          )}
        >
          +{data.delayMs || 10}ms
        </span>
      </div>

      {/* Primary Host Information */}
      <div className="space-y-2 text-xs">
        <div>
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-tight">
            {isOrigin ? "Origin Domain / Host" : isGateway ? "Destination Gateway" : "Relaying Host"}
          </div>
          <div className="text-slate-200 font-semibold text-xs truncate mt-0.5" title={displayHost}>
            {displayHost}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={displayOrg}>
            {displayOrg}
          </div>
        </div>

        {/* IP Address & Protocol */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/10 text-[11px] font-mono">
          <div>
            <div className="text-[9px] text-slate-500 uppercase">IP Address</div>
            <div className="text-slate-300 truncate" title={data.ip}>
              {data.ip}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase">Protocol</div>
            <div className="text-slate-300 flex items-center justify-end gap-1">
              <Lock className="w-2.5 h-2.5 text-blue-400" />
              <span>{data.protocol}</span>
            </div>
          </div>
        </div>

        {/* GeoIP Location & ASN */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]" title={`${data.city}, ${data.countryName}`}>
              {data.city}, {data.country}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
            {data.asn.split(" ")[0]}
          </span>
        </div>

        {/* Security / Threat Anomaly Banner if detected */}
        {isSuspicious && data.anomalies.length > 0 ? (
          <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-200 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span>{data.anomalies[0]}</span>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-400 font-medium">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>{isOrigin ? "Verified Origin MTA" : isGateway ? "Security Verified" : "Standard Relay"}</span>
          </div>
        )}
      </div>
    </div>
  );
};