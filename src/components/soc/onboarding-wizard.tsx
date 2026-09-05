import React, { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  User, 
  CheckCircle2, 
  Sliders, 
  Lock, 
  Sparkles, 
  Mail, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { CloudNetLogo } from "../common/cloudnet-logo";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config?: any) => void;
  apiBase: string;
  userEmail?: string;
}

export interface OnboardingConfig {
  accountType: "business" | "individual";
  orgName: string;
  domain: string;
  vipList: Array<{ name: string; email: string; title: string }>;
  quarantineThreshold: number;
  bannerEnabled: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  apiBase,
  userEmail
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<"business" | "individual">("business");
  const [orgName, setOrgName] = useState("");
  const [domain, setDomain] = useState("");
  const [quarantineThreshold, setQuarantineThreshold] = useState(80);
  const [bannerEnabled, setBannerEnabled] = useState(true);

  // VIP List
  const [vipName, setVipName] = useState("");
  const [vipEmail, setVipEmail] = useState("");
  const [vipTitle, setVipTitle] = useState("");
  const [vipList, setVipList] = useState<Array<{ name: string; email: string; title: string }>>([
    { name: "Executive Leadership", email: "leadership@yourdomain.com", title: "Chief Executive Officer" }
  ]);

  // Freelance / Individual Personal Contacts
  const [personalContacts, setPersonalContacts] = useState<Array<{ name: string; email: string; title: string }>>([
    { name: "Accountant / CPA", email: "advisor@financialfirm.com", title: "Personal Tax CPA" }
  ]);

  const [isTestingSim, setIsTestingSim] = useState(false);
  const [simTestResult, setSimTestResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentVipList = accountType === "business" ? vipList : personalContacts;

  const handleAddEntity = () => {
    if (!vipName || !vipEmail) return;
    const newEntry = { name: vipName, email: vipEmail, title: vipTitle || "Key Entity" };
    if (accountType === "business") {
      setVipList([...vipList, newEntry]);
    } else {
      setPersonalContacts([...personalContacts, newEntry]);
    }
    setVipName("");
    setVipEmail("");
    setVipTitle("");
  };

  const handleRemoveEntity = (index: number) => {
    if (accountType === "business") {
      setVipList(vipList.filter((_, i) => i !== index));
    } else {
      setPersonalContacts(personalContacts.filter((_, i) => i !== index));
    }
  };

  const runLiveInspectionTest = async () => {
    setIsTestingSim(true);
    setSimTestResult(null);
    try {
      const resp = await fetch(`${apiBase}/webhooks/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attack_type: accountType === "business" ? "vip_wire_fraud" : "quishing_qr_attack",
          target_recipient: vipEmail || (accountType === "business" ? "finance@yourcompany.com" : "me@gmail.com")
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setSimTestResult(data);
      }
    } catch (e) {
      console.error("Simulation error during wizard test:", e);
    } finally {
      setIsTestingSim(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      const config: OnboardingConfig = {
        accountType,
        orgName: orgName || (accountType === "business" ? "My Enterprise" : "Personal Inbox"),
        domain: domain || (accountType === "business" ? "company.com" : "gmail.com"),
        vipList: currentVipList,
        quarantineThreshold,
        bannerEnabled
      };

      // Persist onboarding in SQL database & DynamicConfigManager via Backend API
      try {
        await fetch(`${apiBase}/admin/onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            org_name: config.orgName,
            domain: config.domain,
            admin_email: userEmail || (config.domain.includes("@") ? config.domain : `admin@${config.domain}`),
            provider: "google_workspace",
            auto_remediation_threshold: config.quarantineThreshold,
            vips: config.vipList.map(v => ({
              name: v.name,
              title: v.title,
              email: v.email
            }))
          })
        });
      } catch (apiErr) {
        console.warn("Backend onboarding persist warning:", apiErr);
      }

      onComplete(config);
      onClose();
    } catch (e) {
      console.error("Error saving onboarding configuration:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Account" },
    { num: 2, label: "Trusted Contacts" },
    { num: 3, label: "AI Policy" },
    { num: 4, label: "Verification" },
    { num: 5, label: "Launch" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#080C14] border border-white/10 shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#0E1422] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudNetLogo size={28} glow={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  CloudNet ICES Onboarding Wizard
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase">
                  SETUP GUIDE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Personal Gmail, Google Workspace &amp; Enterprise Mailbox Protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Stepper Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0B0F1A] border-b border-white/[0.06] flex items-center justify-between overflow-x-auto scrollbar-none">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  isCurrent 
                    ? "bg-blue-600 text-white font-bold shadow-sm" 
                    : isCompleted 
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium" 
                    : "bg-[#141B2E] text-slate-400 border border-white/5"
                }`}>
                  <span>{isCompleted ? "✓" : `0${s.num}`}</span>
                  <span className="font-sans font-medium">{s.label}</span>
                </div>
                {s.num < 5 && <span className="text-slate-700 font-mono text-xs hidden sm:inline">&rarr;</span>}
              </div>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-5">
          
          {/* STEP 1: Account Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Select Environment Type</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose how CloudNet ICES should calibrate its VIP lookalike domain and wire fraud heuristics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setAccountType("business")}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    accountType === "business"
                      ? "bg-[#121B2D] border-blue-500 shadow-md"
                      : "bg-[#0E1422] border-white/10 hover:border-white/20"
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-2 ${accountType === "business" ? "text-blue-400" : "text-slate-400"}`} />
                  <h5 className="text-xs font-bold text-white mb-0.5">Enterprise Organization</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Google Workspace domain with executive VIP impersonation and payroll diversion defense.
                  </p>
                </div>

                <div
                  onClick={() => setAccountType("individual")}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    accountType === "individual"
                      ? "bg-[#121B2D] border-blue-500 shadow-md"
                      : "bg-[#0E1422] border-white/10 hover:border-white/20"
                  }`}
                >
                  <User className={`w-5 h-5 mb-2 ${accountType === "individual" ? "text-blue-400" : "text-slate-400"}`} />
                  <h5 className="text-xs font-bold text-white mb-0.5">Personal / Individual Inbox</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Personal @gmail.com protecting against escrow scams, tax phishing, and QR code quishing.
                  </p>
                </div>
              </div>

              {/* 1-Click Google OAuth 2.0 Gateway (Primary Recommended Path) */}
              <div className="p-4 rounded-xl bg-[#0E1422] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Automated Google OAuth 2.0 Ingestion</span>
                      <span className="text-[11px] text-slate-400">Connect Google Workspace or personal @gmail.com mailbox with 1 click</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                    RECOMMENDED
                  </span>
                </div>

                <a
                  href={`${apiBase}/auth/google/login`}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Authorize &amp; Connect with Google Account</span>
                </a>
              </div>

              {/* Manual Email / Domain Configuration */}
              <div className="space-y-3 pt-1 border-t border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">Or configure manually:</span>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    {accountType === "business" ? "Organization / Company Name" : "Account Display Name"}
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder={accountType === "business" ? "e.g. Acme Financial Technologies" : "e.g. Alex Mercer"}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1422] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Primary Monitored Domain / Email</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder={accountType === "business" ? "e.g. acmefintech.com" : "e.g. user@gmail.com"}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1422] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Trusted VIP Entities */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {accountType === "business" ? "Protected Executive VIPs" : "High-Trust Personal Contacts"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {accountType === "business"
                    ? "Inbound emails matching these executive names from external domains will be flagged as BEC impersonation."
                    : "Add trusted advisors (CPAs, attorneys, escrow agents) to monitor for lookalike phishing."}
                </p>
              </div>

              {/* Add Input Bar */}
              <div className="p-3.5 rounded-xl bg-[#0E1422] border border-white/10 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={vipName}
                    onChange={e => setVipName(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141B2E] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={vipEmail}
                    onChange={e => setVipEmail(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141B2E] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Title / Role"
                    value={vipTitle}
                    onChange={e => setVipTitle(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141B2E] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEntity}
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Protected Directory</span>
                </button>
              </div>

              {/* Entity List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {currentVipList.map((entity, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0E1422] border border-white/[0.08] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{entity.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{entity.email} &bull; {entity.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntity(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: AI Policy & Quarantine Thresholds */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">AI Policy &amp; Containment Thresholds</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure autonomous zero-trust enforcement rules across your connected mailbox.
                </p>
              </div>

              {/* Threshold Slider */}
              <div className="p-4 rounded-xl bg-[#0E1422] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Auto-Quarantine Threat Score Threshold</span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    &ge; {quarantineThreshold} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={quarantineThreshold}
                  onChange={e => setQuarantineThreshold(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Emails with composite threat scores &ge; {quarantineThreshold} will be immediately isolated with the [SUSPICIOUS] label to prevent accidental credential submission.
                </p>
              </div>

              {/* Warning Banner Toggle */}
              <div className="p-4 rounded-xl bg-[#0E1422] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">In-Mail Security Warning Banners</span>
                  <span className="text-slate-400 text-[11px]">Inject dynamic HTML warning tags into suspicious emails for visual awareness.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerEnabled(!bannerEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${bannerEnabled ? "bg-blue-600" : "bg-[#141B2E] border border-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${bannerEnabled ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Live Verification & Gemini Inspection Test */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Step 4: AI &amp; Database Verification Test
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Run an on-demand synthetic test to verify Gemini AI connectivity and Neon PostgreSQL telemetry logging.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1422] border border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-medium text-white">
                    {accountType === "business" ? "Live Synthetic Executive BEC Wire Test" : "Live Synthetic Escrow / Bank Phishing Test"}
                  </span>
                  <button
                    type="button"
                    onClick={runLiveInspectionTest}
                    disabled={isTestingSim}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isTestingSim ? "Analyzing with Gemini..." : "Run Verification Test"}</span>
                  </button>
                </div>

                {simTestResult && (
                  <div className="p-3.5 rounded-xl bg-[#080C14] border border-blue-500/30 font-mono text-[11px] space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-blue-400 font-semibold">
                      <span>✓ Threat Detected &amp; Scored</span>
                      <span>Score: {simTestResult.threat_score}/100 ({simTestResult.severity})</span>
                    </div>
                    <div className="text-slate-300">
                      <strong>AI Verdict:</strong> {simTestResult.gemini_bec_analysis?.threat_category} ({simTestResult.gemini_bec_analysis?.bec_subtype})
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      <strong>Recommendation:</strong> {simTestResult.recommended_action} &bull; <strong>Origin Geo:</strong> {simTestResult.originating_intel?.country_name || "US"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Launch & Go Live */}
          {currentStep === 5 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {accountType === "business" ? "Organization Successfully Protected!" : "Personal Inbox Successfully Protected!"}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  <strong>{orgName || "Your Account"}</strong> ({domain || "gmail.com"}) is now guarded by CloudNet ICES. All incoming messages will be analyzed in real time.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto text-left font-mono text-[11px] p-3 rounded-xl bg-[#0E1422] border border-white/10">
                <div>
                  <span className="text-slate-500 block text-[9px]">Protected</span>
                  <span className="text-white font-bold">{currentVipList.length} Entities</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Auto Policy</span>
                  <span className="text-blue-400 font-bold">&ge; {quarantineThreshold}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">Database</span>
                  <span className="text-white font-bold">Neon SQL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-white/10 bg-[#0E1422] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#141B2E] border border-white/10 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
            >
              <span>{isSaving ? "Saving Configuration..." : "Launch Live SOC Dashboard"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};