import React, { useState, useEffect } from "react";
import { CloudNetLogo } from "../common/cloudnet-logo";
import { ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2, Lock, Eye, Radio, Server, X } from "lucide-react";

interface LaunchSplashProps {
  onComplete: () => void;
}

export const LaunchSplash: React.FC<LaunchSplashProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"booting" | "slides">("booting");
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Boot Simulation
  useEffect(() => {
    const logs = [
      "ESTABLISHING SECURE PROTOCOL LINK...",
      "CALIBRATING GEMINI 3.5 FLASH REASONING MATRIX...",
      "INITIALIZING OPTICAL QR / OCR DECODER...",
      "CONNECTING GOOGLE WORKSPACE API GATEWAY...",
      "SYSTEM ARMED // ZERO-TRUST ACTIVE"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setBootProgress((prev) => {
        const next = prev + 20;
        if (logs[currentLogIndex]) {
          setBootLogs((l) => [...l, logs[currentLogIndex]]);
          currentLogIndex++;
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase("slides");
          }, 400);
          return 100;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      step: "STAGE 01",
      title: "Autonomous Inbound Interception",
      subtitle: "Sub-Second Ingestion & RFC Authentication",
      desc: "Every incoming email packet is captured via Gmail REST API & PubSub webhooks in 0.35s. The cryptographic engine verifies SPF IP whitelists, DKIM RSA signatures, and DMARC alignment before the user opens the message.",
      badge: "RFC-822 / MIME PIPELINE",
      icon: <Server className="w-8 h-8 text-blue-400" />
    },
    {
      step: "STAGE 02",
      title: "Deep AI Intent & Quishing Radar",
      subtitle: "Gemini 3.5 Flash + Optical QR Computer Vision",
      desc: "Optical sensors extract embedded QR codes and inline base64 images to uncover hidden phishing trap URLs. Meanwhile, Google Gemini decomposes urgent wire transfer requests, payroll fraud, and CEO impersonation with 96% confidence.",
      badge: "GEMINI 3.5 FLASH + OCR VISION",
      icon: <Sparkles className="w-8 h-8 text-blue-400" />
    },
    {
      step: "STAGE 03",
      title: "Live Mailbox Containment",
      subtitle: "Dynamic [SUSPICIOUS] Labeling & 1-Click Purge",
      desc: "When high-confidence threats are identified (Score >= 80), ICES dynamically attaches a high-contrast [SUSPICIOUS] label tag inside Gmail and prepends an executive warning banner, allowing analysts to purge attack clusters across all mailboxes.",
      badge: "NON-DESTRUCTIVE REMEDIATION",
      icon: <ShieldCheck className="w-8 h-8 text-blue-400" />
    }
  ];

  const handleFinish = () => {
    localStorage.setItem("ices_intro_completed", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00008b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[120px] pointer-events-none" />

      {/* PHASE 1: BOOT ANIMATION */}
      {phase === "booting" && (
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-center">
            <CloudNetLogo size={64} className="w-16 h-16" glow />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-sans text-white tracking-tight">
              CloudNet <span className="text-blue-400 font-mono">ICES</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              INITIALIZING ZERO-TRUST DEFENSE GATEWAY
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 shadow-[0_0_12px_#00008b]"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>SYSTEM BOOT</span>
              <span className="text-blue-400 font-bold">{bootProgress}%</span>
            </div>
          </div>

          {/* Terminal Boot Log */}
          <div className="p-3 rounded-lg bg-black/70 border border-white/[0.06] text-left font-mono text-[10px] space-y-1 h-24 overflow-hidden text-zinc-400">
            {bootLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-blue-400">&gt;</span>
                <span className={i === bootLogs.length - 1 ? "text-blue-300 font-bold" : "text-zinc-500"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 2: 3-SLIDE FLOW EXPLAINER */}
      {phase === "slides" && (
        <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl bg-[#0D1117] border border-blue-500/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-300 space-y-6">
          
          {/* Top Bar with Step Indicators */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <CloudNetLogo size={28} className="w-7 h-7" glow={false} />
              <div>
                <span className="text-xs font-bold text-white font-mono block tracking-tight">
                  CLOUDNET ICES ARCHITECTURE
                </span>
                <span className="text-[10px] text-blue-400 font-mono block">
                  FLOW {currentSlide + 1} OF 3 // {slides[currentSlide].step}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
            >
              Skip Tour &rarr;
            </button>
          </div>

          {/* Slide Content Card */}
          <div className="space-y-4 min-h-[220px]">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/40">
                {slides[currentSlide].icon}
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                  {slides[currentSlide].badge}
                </span>
                <h3 className="text-xl font-bold text-white font-sans tracking-tight mt-1">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-xs text-blue-400/90 font-mono">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/[0.04]">
              {slides[currentSlide].desc}
            </p>
          </div>

          {/* Slide Navigation & Indicator Dots */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? "w-8 bg-blue-600 shadow-[0_0_8px_#00008b]" : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide((c) => c - 1)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold font-sans bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition-all"
                >
                  Back
                </button>
              )}

              {currentSlide < slides.length - 1 ? (
                <button
                  onClick={() => setCurrentSlide((c) => c + 1)}
                  className="px-4 py-2 rounded-lg text-xs font-bold font-sans bg-blue-600 hover:bg-blue-600 text-slate-950 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-5 py-2 rounded-lg text-xs font-bold font-sans bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Launch SOC Cockpit</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};