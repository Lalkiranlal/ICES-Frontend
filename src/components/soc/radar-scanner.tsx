import React from "react";
import { RefreshCw, Radio, Shield, CheckCircle2, Cpu } from "lucide-react";

interface RadarScannerProps {
  isScanning: boolean;
  onTriggerScan: () => void;
  scannedCount: number;
  threatsDetected: number;
  activeMailbox: string;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({
  isScanning,
  onTriggerScan,
  scannedCount,
  threatsDetected,
  activeMailbox
}) => {
  return (
    <div className="w-full mb-5 p-4 sm:p-5 rounded-xl bg-[#0E1422] border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Left: Clean Telemetry Info */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-[#141B2E] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              INBOUND THREAT STREAM
            </span>
            <span className="text-slate-400 text-xs font-mono truncate">
              TARGET: <strong className="text-slate-200 font-normal">{activeMailbox}</strong>
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Autonomous Mailbox Protection &amp; Ingestion Engine
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Continuous optical OCR and Gemini AI decomposition checking inbound traffic for zero-day BEC wire requests and quishing vectors.
          </p>
        </div>
      </div>

      {/* Right: Telemetry Counter + Trigger Button */}
      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/[0.08] pt-3 md:pt-0">
        <div className="text-right font-mono text-xs hidden sm:block">
          <span className="text-slate-400 text-[10px] block uppercase">PAYLOADS VERIFIED</span>
          <span className="text-white font-bold text-sm tabular-numbers">{scannedCount} Messages</span>
        </div>

        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "SWEEPING STREAM..." : "RUN RADAR SWEEP"}</span>
        </button>
      </div>

    </div>
  );
};