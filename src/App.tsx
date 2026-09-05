import { StudyGuide } from "./components/soc/study-guide";
import { FloatingIndexBar } from "./components/soc/floating-index-bar";
import { LaunchSplash } from "./components/soc/launch-splash";
import { RadarScanner } from "./components/soc/radar-scanner";
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/soc/header';
import { MetricsBar } from './components/soc/metrics-bar';
import { AlertFeed } from './components/soc/alert-feed';
import { ProgressivePanel } from './components/soc/progressive-panel';
import { WebhookSimulator } from './components/soc/webhook-simulator';
import { AdminPanel } from './components/soc/admin-panel';
import { SuperAdminPortal } from './components/admin/super-admin-portal';
import { OnboardingWizard } from './components/soc/onboarding-wizard';
import { EmailAlert, TokenTelemetry } from './types/ices';
import { ShieldCheck, CheckCircle2, Bell, AlertTriangle } from 'lucide-react';

import { soundManager } from './lib/sound';

interface ActiveToast {
  title: string;
  sender: string;
  subject: string;
  threat_score: number;
  is_threat: boolean;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("ices_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("ices_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };
    const [showSplash, setShowSplash] = useState(false);
  const [alerts, setAlerts] = useState<EmailAlert[]>(() => {
    try {
      const cached = localStorage.getItem("ices_cached_alerts");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [tokenStats, setTokenStats] = useState<TokenTelemetry | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('ices_onboarding_completed');
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [liveMttr, setLiveMttr] = useState<number>(0.35);
  const [mobileView, setMobileView] = useState<'feed' | 'detail'>('feed');
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);


  const prevAlertCountRef = useRef<number>(0);

  const [userSessionEmail, setUserSessionEmail] = useState<string>(() => {
    return localStorage.getItem('ices_user_email') || '';
  });

  const handleSwitchUserEmail = (email: string) => {
    const clean = email.toLowerCase().trim();
    setUserSessionEmail(clean);
    localStorage.setItem('ices_user_email', clean);
    localStorage.removeItem('ices_cached_alerts');
    fetchLiveAlerts(true);
  };

  // Handle Google OAuth callback redirect (?auth=success&email=... or ?auth_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authedEmail = params.get('email');
    const authErr = params.get('auth_error');

    if (params.get('auth') === 'success' && authedEmail) {
      localStorage.setItem('ices_user_email', authedEmail);
      localStorage.setItem('ices_onboarding_completed', 'true');
      setUserSessionEmail(authedEmail);
      setIsOnboardingOpen(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchLiveAlerts();
    } else if (authErr) {
      setActiveToast({
        title: 'Google Authorization Notice',
        sender: 'OAuth Gateway',
        subject: `Authorization returned: ${decodeURIComponent(authErr)}`,
        threat_score: 0,
        is_threat: true
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsPushEnabled(true);
    }
  }, []);

  const handleTogglePush = async () => {
    // 1. Play test affirmative chime
    soundManager.playSafeChime();

    // 2. Request browser OS notification permission if supported
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        try {
          const perm = await Notification.requestPermission();
          setIsPushEnabled(perm === 'granted');
        } catch (e) {
          setIsPushEnabled(true);
        }
      } else {
        setIsPushEnabled(true);
      }
    } else {
      setIsPushEnabled(true);
    }

    // 3. Show instant in-app confirmation toast
    setActiveToast({
      title: 'Shield Alerts Activated',
      sender: 'CloudNet ICES',
      subject: 'Real-time audio chimes and desktop push notifications are now active.',
      threat_score: 0,
      is_threat: false
    });
    setTimeout(() => setActiveToast(null), 5000);
  };

  // Dispatch both Audio Chime + In-App Toast + Desktop OS Notification
  const triggerAlert = (alertItem: EmailAlert) => {
    const isThreat = alertItem.threat_score >= 80;

    // 1. Play Audio Chime
    if (isThreat) {
      soundManager.playThreatAlert();
    } else {
      soundManager.playSafeChime();
    }

    // 2. Trigger In-App Visual Toast
    setActiveToast({
      title: isThreat ? '🚨 Threat Auto-Quarantined!' : '✓ Email Verified Safe',
      sender: alertItem.sender_display_name || alertItem.sender_header_from,
      subject: alertItem.subject,
      threat_score: alertItem.threat_score,
      is_threat: isThreat
    });
    setTimeout(() => setActiveToast(null), 6000);

    // 3. Trigger Browser OS Push Notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(isThreat ? '🚨 High Risk Threat Quarantined!' : '✓ Email Scanned & Verified Safe', {
          body: `From: ${alertItem.sender_display_name || alertItem.sender_header_from}\n${alertItem.subject}`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        // Notification constructor catch
      }
    }
  };

  // Fetch live emails from backend with multi-tenant mailbox isolation
  const fetchLiveAlerts = async (isManualSync = false) => {
    setIsSyncing(true);
    try {
      const queryParams = new URLSearchParams();
      if (userSessionEmail) {
        queryParams.set("user_email", userSessionEmail);
      }
      if (isManualSync) {
        queryParams.set("force_sync", "true");
      }
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const [alertsResp, metricsResp] = await Promise.all([
        fetch(`${API_BASE}/alerts/${queryString}`),
        fetch(`${API_BASE}/alerts/metrics${userSessionEmail ? `?user_email=${encodeURIComponent(userSessionEmail)}` : ""}`).catch(() => null)
      ]);

      if (metricsResp && metricsResp.ok) {
        const metricData = await metricsResp.json();
        if (metricData.mean_time_to_remediate_sec !== undefined) {
          setLiveMttr(metricData.mean_time_to_remediate_sec);
        }
        if (metricData.token_telemetry) {
          setTokenStats(metricData.token_telemetry);
        }
      }

      if (alertsResp.ok) {
        const data: EmailAlert[] = await alertsResp.json();
        if (Array.isArray(data)) {
          const sanitized = data.map(item => ({
            ...item,
            subject: item.subject?.trim() || `(No Subject) — from ${item.sender_display_name || item.sender_header_from}`
          }));

          // If new emails arrived since last scan, trigger real-time alert
          if (prevAlertCountRef.current > 0 && sanitized.length > prevAlertCountRef.current) {
            const newest = sanitized[0];
            triggerAlert(newest);
          }
          prevAlertCountRef.current = sanitized.length;

          setAlerts(sanitized);
          try {
            localStorage.setItem("ices_cached_alerts", JSON.stringify(sanitized));
          } catch {}
          setSelectedAlertId(prevId => {
            if (prevId && sanitized.some(a => a.id === prevId)) {
              return prevId;
            }
            return sanitized[0]?.id || null;
          });
        }
      }
    } catch (e) {
      console.warn('Backend API fetch error:', e);
    } finally {
      setIsSyncing(false);
      setHasLoadedInitially(true);
    }
  };


  // Smart background polling (only when tab is active)
  // Empty dependency array intentional — polling runs once on mount.
  // isPushEnabled intentionally excluded to avoid restarting the interval on every toggle.
  useEffect(() => {
    fetchLiveAlerts();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveAlerts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLiveAlerts();
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0] || null;

  // Keyboard-first SOC navigation (J/K or Up/Down to navigate, Q to Quarantine, R to Release)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when typing in search or input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (alerts.length === 0) return;
      const currentIndex = alerts.findIndex(a => a.id === selectedAlertId);

      if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        const nextIndex = currentIndex < alerts.length - 1 ? currentIndex + 1 : 0;
        setSelectedAlertId(alerts[nextIndex].id);
      } else if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : alerts.length - 1;
        setSelectedAlertId(alerts[prevIndex].id);
      } else if ((e.key === "q" || e.key === "Q") && selectedAlert) {
        e.preventDefault();
        handleRemediate("QUARANTINE");
      } else if ((e.key === "r" || e.key === "R") && selectedAlert) {
        e.preventDefault();
        handleRemediate("RELEASE");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alerts, selectedAlertId, selectedAlert]);


  // Real-time metrics
  const highRiskThreatsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
  const quarantinedCount = alerts.filter(a => a.remediation_status.includes('QUARANTINED')).length;
  const autoRemediationRate = alerts.length > 0 ? Math.round((quarantinedCount / Math.max(1, highRiskThreatsCount)) * 100) : 100;

  const handleSelectAlert = (alert: EmailAlert) => {
    setSelectedAlertId(alert.id);
    setMobileView('detail'); // Automatically switch to inspector on mobile
  };

  const handleRemediate = async (action: 'QUARANTINE' | 'RELEASE') => {
    if (!selectedAlert) return;
    setIsActionLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/remediation/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: selectedAlert.id,
          user_email: selectedAlert.recipient_to[0] || activeUserEmail,
          provider_message_id: selectedAlert.provider_message_id,
          action: action,
          reason: action === 'QUARANTINE' ? 'Manual SOC Enforcement' : 'Marked as False Positive'
        })
      });

      if (resp.ok) {
        setAlerts(prev =>
          prev.map(a => {
            if (a.id === selectedAlert.id) {
              return {
                ...a,
                remediation_status: action === 'QUARANTINE' ? 'MANUAL_QUARANTINED' : 'RELEASED_FALSE_POSITIVE',
                threat_score: action === 'RELEASE' ? 0 : a.threat_score,
                severity: action === 'RELEASE' ? 'INFORMATIONAL' : a.severity
              };
            }
            return a;
          })
        );
      }
    } catch (e) {
      console.error('Error executing remediation action:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSimulateIngestion = async (rawEml: string) => {
    try {
      const resp = await fetch(`${API_BASE}/forensics/analyze-raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_eml_text: rawEml })
      });

      if (resp.ok) {
        const forensicData = await resp.json();
        const headers = forensicData.headers || {};
        const geminiNlp = forensicData.gemini_bec_analysis || {};
        const originatingIntel = forensicData.originating_intel || {};
        const currentUserMail = userSessionEmail || alerts[0]?.recipient_to?.[0] || 'monitored-user@organization.com';
        
        const simulatedAlert: EmailAlert = {
          id: `sim-${Date.now()}`,
          provider_message_id: `sim-msg-${Date.now()}`,
          rfc822_message_id: headers.message_id || `<simulated-${Date.now()}@internal.sec>`,
          sender_envelope: headers.from || 'threat@attack-vector.org',
          sender_display_name: headers.display_name || headers.from || 'External Inbound Mail',
          sender_header_from: headers.from || 'threat@attack-vector.org',
          reply_to: headers.reply_to || headers.from || 'threat@attack-vector.org',
          recipient_to: [currentUserMail],
          recipient_cc: headers.recipients ? (Array.isArray(headers.recipients) ? headers.recipients : [headers.recipients]) : [],
          subject: headers.subject || 'Simulated Test Payload',
          threat_score: forensicData.threat_score || 85,
          threat_category: geminiNlp.bec_subtype || (forensicData.threat_score >= 80 ? 'BEC_EXECUTIVE_IMPERSONATION' : 'CLEAN'),
          severity: forensicData.severity || (forensicData.threat_score >= 80 ? 'CRITICAL' : 'MEDIUM'),
          remediation_status: forensicData.threat_score >= 80 ? 'AUTO_QUARANTINED' : 'ALLOWLISTED',
          applied_labels: forensicData.threat_score >= 80 ? ['[SUSPICIOUS]', 'QUARANTINED'] : ['INBOX'],
          spf_status: forensicData.authentication?.spf || 'FAIL',
          dkim_status: forensicData.authentication?.dkim || 'FAIL',
          dmarc_status: forensicData.authentication?.dmarc || 'FAIL',
          received_timestamp: new Date().toISOString(),
          forensic_logs: [
            {
              id: `fl-sim-${Date.now()}`,
              alert_id: `sim-${Date.now()}`,
              originating_ip: originatingIntel.ip || '185.220.101.5',
              originating_country: originatingIntel.country || 'DE',
              originating_country_name: originatingIntel.country_name || 'Germany',
              originating_city: originatingIntel.city || 'Frankfurt',
              originating_asn: originatingIntel.asn || 'AS60729',
              originating_isp: originatingIntel.isp || 'Tor Anonymity Network',
              is_tor_or_vpn: originatingIntel.is_tor_or_vpn ?? true,
              reply_to_mismatch: headers.reply_to_mismatch ?? false,
              display_name_spoofing: geminiNlp.impersonation_analysis?.is_impersonation ?? false,
              lookalike_domain_detected: geminiNlp.lookalike_details ? true : false,
              smtp_hops: forensicData.smtp_hops || [],
              raw_authentication_results: forensicData.authentication?.raw || `spf=${forensicData.authentication?.spf} dkim=${forensicData.authentication?.dkim} dmarc=${forensicData.authentication?.dmarc}`,
              raw_received_headers: headers.raw_received_headers || [],
              raw_eml_snippet: rawEml.slice(0, 1500)
            } as any
          ],
          nlp_evaluations: [
            {
              id: `nlp-sim-${Date.now()}`,
              alert_id: `sim-${Date.now()}`,
              model_version: 'gemini-1.5-flash',
              executive_summary: geminiNlp.executive_summary || forensicData.nlp_reasoning || 'Evaluated via live Gemini AI engine.',
              bec_subtype: geminiNlp.bec_subtype || 'BEC_EXECUTIVE_IMPERSONATION',
              urgency_score: geminiNlp.urgency_score || 85,
              confidence_score: geminiNlp.confidence_score || 0.95,
              financial_request_detected: geminiNlp.financial_analysis?.financial_request_detected ?? false,
              requested_amount_usd: geminiNlp.financial_analysis?.requested_amount_usd ?? null,
              impersonated_executive: geminiNlp.impersonation_analysis?.impersonated_name || headers.display_name,
              linguistic_cues: geminiNlp.linguistic_cues || ['Urgent Request', 'Wire Instruction'],
              deception_techniques: geminiNlp.deception_techniques || ['Display Name Spoofing'],
              extracted_bank_entities: geminiNlp.financial_analysis?.extracted_entities || {}
            } as any
          ]
        };

        setAlerts(prev => [simulatedAlert, ...prev]);
        setSelectedAlertId(simulatedAlert.id);
        setMobileView('detail');
        triggerAlert(simulatedAlert);
      }
    } catch (e) {
      console.error('Error during raw forensic simulation:', e);
    }
  };

  const activeUserEmail = userSessionEmail || alerts[0]?.recipient_to?.[0] || 'Live Monitored Mailbox';

  if (isSuperAdminOpen) {
    return (
      <SuperAdminPortal
        apiBase={API_BASE}
        onBackToSoc={() => setIsSuperAdminOpen(false)}
      />
    );
  }

  // Loading skeleton — shown only on very first load before any data arrives
  if (!hasLoadedInitially) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1700px] items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-white">CloudNet <span className="text-zinc-400 font-normal">ICES</span></span>
                <p className="text-[11px] text-zinc-500">Connecting to Gmail inbox...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 rounded-lg bg-zinc-900 animate-pulse" />
              <div className="h-6 w-20 rounded-lg bg-zinc-900 animate-pulse" />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 flex flex-col">
          {/* Skeleton Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-5 h-28 animate-pulse" />
            ))}
          </div>
          {/* Skeleton Feed + Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            <div className="lg:col-span-5 h-[720px] rounded-xl border border-white/[0.08] bg-zinc-900/40 animate-pulse">
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-zinc-800" />
                <div className="h-4 w-32 rounded bg-zinc-800" />
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-zinc-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-zinc-800" />
                      <div className="h-3 w-1/2 rounded bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 h-[720px] rounded-xl border border-white/[0.08] bg-zinc-900/40 animate-pulse" />
          </div>
        </main>
        <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Syncing Gmail inbox…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col pt-5 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1780px] mx-auto w-full selection:bg-blue-500/30 selection:text-white font-sans">
      {/* Top Header */}
            {showSplash && (
        <LaunchSplash onComplete={() => setShowSplash(false)} />
      )}
      <Header
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        isSimulating={false}
        onRefreshLive={fetchLiveAlerts}
        isSyncing={isSyncing}
        userEmail={activeUserEmail}
        onSwitchUserEmail={handleSwitchUserEmail}
        theme={theme}
        onToggleTheme={toggleTheme}
        isPushEnabled={isPushEnabled}
        onTogglePush={handleTogglePush}
        activeView={mobileView}
        onSelectView={setMobileView}
        apiBase={API_BASE}
      />

      {/* Floating Action Dock extending top-to-bottom on Right Hand Side */}
      <FloatingIndexBar
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onRefreshLive={() => fetchLiveAlerts(true)}
        isSyncing={isSyncing}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenStudyGuide={() => setIsStudyGuideOpen(true)}
        isPushEnabled={isPushEnabled}
        onTogglePush={handleTogglePush}
      />

      {/* Main SOC Dashboard Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 flex flex-col">

        {/* Metrics Banner */}
        <MetricsBar
          threatsCount={highRiskThreatsCount}
          quarantinedCount={quarantinedCount}
          autoRemediationRate={autoRemediationRate}
          mttrSec={liveMttr}
          totalEmailsCount={alerts.length}
          tokenUsage={tokenStats}
        />

        {/* Tactical Inbound Radar Scanner */}
        <RadarScanner
          isScanning={isSyncing}
          onTriggerScan={() => fetchLiveAlerts(true)}
          scannedCount={alerts.length}
          threatsDetected={highRiskThreatsCount}
          activeMailbox={activeUserEmail}
        />


        {/* STEP 3 & 4: Intentional Asymmetrical Split & Overlapping Forensic Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start relative z-10">
          
          {/* Left Column (38% Desktop Width): High-Density Inbound Stream */}
          <div className={`lg:col-span-5 h-[620px] lg:h-[730px] ${
            mobileView === 'detail' ? 'hidden lg:block' : 'block'
          }`}>
            <AlertFeed
              alerts={alerts}
              selectedAlertId={selectedAlertId}
              onSelectAlert={handleSelectAlert}
              apiBase={API_BASE}
            />
          </div>

          {/* Right Column (62% Desktop Width): Offset Floating Forensic Workbench (Overlaps by 8px with Soft Depth) */}
          <div className={`lg:col-span-7 h-[620px] lg:h-[730px] lg:-mt-2 floating-overlay-panel ${
            mobileView === 'feed' ? 'hidden lg:block' : 'block'
          }`}>
            <ProgressivePanel
              alert={selectedAlert}
              onRemediate={handleRemediate}
              isActionLoading={isActionLoading}
              onBackToFeed={() => setMobileView('feed')}
              apiBase={API_BASE}
            />
          </div>
        </div>
      </main>

      {/* Real-Time Security Alert Toast */}
      {activeToast && (
        <div className={`fixed top-12 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-start gap-3.5 max-w-sm w-full border animate-in slide-in-from-top-4 duration-300 backdrop-blur-md ${
          activeToast.is_threat
            ? 'bg-[#12080a]/95 border-red-500/30'
            : 'bg-[#0a120c]/95 border-blue-500/40'
        }`}>
          <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
            activeToast.is_threat ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          }`}>
            {activeToast.is_threat ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-semibold ${activeToast.is_threat ? 'text-red-400' : 'text-blue-400'}`}>
                {activeToast.title}
              </span>
              {activeToast.is_threat && (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {activeToast.threat_score} RISK
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-white truncate mt-1">
              {activeToast.sender}
            </p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {activeToast.subject}
            </p>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-zinc-500 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Threat Sandbox Modal */}
      <WebhookSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulateIngestion={handleSimulateIngestion}
        recipientEmail={activeUserEmail}
      />

      {/* Organization Admin & User Directory Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        apiBase={API_BASE}
      />

      {/* Educational Architecture Guide Modal */}
      {isStudyGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-4xl w-full max-h-[88vh] overflow-y-auto rounded-2xl bg-[#0A0F1D] border border-blue-500/40 p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <button
              onClick={() => setIsStudyGuideOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all font-mono text-sm"
            >
              ✕
            </button>
            <StudyGuide />
          </div>
        </div>
      )}

      {/* Guided Onboarding & Setup Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(config) => {
          localStorage.setItem("ices_onboarding_completed", "true");
          if (config?.domain && config.domain.includes("@")) {
            localStorage.setItem("ices_user_email", config.domain.toLowerCase().trim());
            localStorage.removeItem("ices_cached_alerts");
            setUserSessionEmail(config.domain.toLowerCase().trim());
          }
          setIsOnboardingOpen(false);
          fetchLiveAlerts();
        }}
        apiBase={API_BASE}
        userEmail={activeUserEmail}
      />
    </div>
  );
};


