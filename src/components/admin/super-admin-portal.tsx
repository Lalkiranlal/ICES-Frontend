import React, { useState, useEffect } from 'react';
import {
  Brain,
  Shield,
  Users,
  Sliders,
  Bell,
  History,
  Save,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Code,
  Globe,
  SlidersHorizontal,
  Send,
  Check
} from 'lucide-react';

interface PromptConfig {
  system_prompt: string;
  gemini_model: string;
  gemini_api_key?: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_output_tokens: number;
  response_mime_type: string;
}


interface TrustedDomain {
  domain: string;
  name: string;
  category: string;
  status: string;
}

interface VipTarget {
  id: string;
  name: string;
  title: string;
  corporate_email: string;
  personal_emails: string[];
  homoglyph_sensitivity: number;
  is_active: boolean;
}

interface HeuristicRules {
  payroll_phrases: string[];
  wire_phrases: string[];
  urgency_phrases: string[];
}

interface SecurityPolicies {
  auto_remediation_threshold: number;
  caution_banner_threshold: number;
  security_admin_email: string;
  notify_user_on_quarantine: boolean;
  slack_webhook_url: string;
  webhook_alerting_enabled: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details: string;
}

interface SuperAdminPortalProps {
  apiBase: string;
  onBackToSoc: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  apiBase,
  onBackToSoc
}) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'domains' | 'vips' | 'rules' | 'policies' | 'audit'>('prompts');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Core Dynamic Config State
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    system_prompt: '',
    gemini_model: 'gemini-1.5-flash',
    temperature: 0.1,
    top_p: 0.95,
    top_k: 40,
    max_output_tokens: 1024,
    response_mime_type: 'application/json'
  });

  const [trustedDomains, setTrustedDomains] = useState<TrustedDomain[]>([]);
  const [vipDirectory, setVipDirectory] = useState<VipTarget[]>([]);
  const [heuristicRules, setHeuristicRules] = useState<HeuristicRules>({
    payroll_phrases: [],
    wire_phrases: [],
    urgency_phrases: []
  });
  const [policies, setPolicies] = useState<SecurityPolicies>({
    auto_remediation_threshold: 80,
    caution_banner_threshold: 50,
    security_admin_email: 'security@company.com',
    notify_user_on_quarantine: true,
    slack_webhook_url: '',
    webhook_alerting_enabled: false
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Playground State
  const [testSubject, setTestSubject] = useState('Urgent: Wire Authorization for Acquisition Escrow');
  const [testSenderDisplay, setTestSenderDisplay] = useState('Sarah Jenkins (CFO)');
  const [testSenderEmail, setTestSenderEmail] = useState('sarah.jenkins@c0mpany-wire.com');
  const [testBody, setTestBody] = useState('Please authorize immediate $85,000 escrow wire transfer today. Routing: 121000248 Account: 9948201948.');
  const [testVipSim, setTestVipSim] = useState(true);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);

  // Modals / Input state
  const [newDomain, setNewDomain] = useState('');
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainCategory, setNewDomainCategory] = useState('Enterprise SaaS Partner');
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  const [newVipName, setNewVipName] = useState('');
  const [newVipTitle, setNewVipTitle] = useState('');
  const [newVipCorpEmail, setNewVipCorpEmail] = useState('');
  const [newVipPersonalEmail, setNewVipPersonalEmail] = useState('');
  const [newVipSensitivity, setNewVipSensitivity] = useState(85);
  const [isAddingVip, setIsAddingVip] = useState(false);

  // Heuristic phrase buffer state
  const [newPayrollPhrase, setNewPayrollPhrase] = useState('');
  const [newWirePhrase, setNewWirePhrase] = useState('');
  const [newUrgencyPhrase, setNewUrgencyPhrase] = useState('');

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${apiBase}/super-admin/config`);
      if (resp.ok) {
        const json = await resp.json();
        const data = json.data;
        if (data.prompt_config) setPromptConfig(data.prompt_config);
        if (data.trusted_domains) setTrustedDomains(data.trusted_domains);
        if (data.vip_directory) setVipDirectory(data.vip_directory);
        if (data.heuristic_rules) setHeuristicRules(data.heuristic_rules);
        if (data.policies) setPolicies(data.policies);
        if (data.audit_logs) setAuditLogs(data.audit_logs);
      }
    } catch (e) {
      console.error('Error loading super admin config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const triggerNotifySuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Save Prompt Settings
  const handleSavePrompt = async () => {
    setIsSaving(true);
    try {
      const resp = await fetch(`${apiBase}/super-admin/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...promptConfig,
          author: 'SuperAdmin'
        })
      });
      if (resp.ok) {
        triggerNotifySuccess('System Prompt & LLM Hyperparameters Deployed');
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error saving prompt config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Run Prompt Test Playground
  const handleRunPlaygroundTest = async () => {
    setIsTestingPrompt(true);
    try {
      const resp = await fetch(`${apiBase}/super-admin/prompt/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: promptConfig.system_prompt,
          gemini_model: promptConfig.gemini_model,
          temperature: promptConfig.temperature,
          sample_subject: testSubject,
          sample_sender_display: testSenderDisplay,
          sample_sender_email: testSenderEmail,
          sample_body: testBody,
          is_vip_simulated: testVipSim
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setPlaygroundResult(data);
      }
    } catch (e) {
      console.error('Error in prompt test playground:', e);
    } finally {
      setIsTestingPrompt(false);
    }
  };

  // Add Trusted Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      const resp = await fetch(`${apiBase}/super-admin/trusted-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain.trim().toLowerCase(),
          name: newDomainName.trim() || newDomain.trim(),
          category: newDomainCategory,
          status: 'ACTIVE',
          author: 'SuperAdmin'
        })
      });
      if (resp.ok) {
        setNewDomain('');
        setNewDomainName('');
        setIsAddingDomain(false);
        triggerNotifySuccess(`Domain '${newDomain}' added to allowlist`);
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error adding domain:', e);
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!confirm(`Are you sure you want to remove '${domain}' from trusted platform allowlist?`)) return;
    try {
      const resp = await fetch(`${apiBase}/super-admin/trusted-domains/${domain}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        triggerNotifySuccess(`Domain '${domain}' removed`);
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error removing domain:', e);
    }
  };

  // Add VIP Target
  const handleAddVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVipName.trim() || !newVipCorpEmail.trim()) return;
    try {
      const resp = await fetch(`${apiBase}/super-admin/vip-directory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVipName.trim(),
          title: newVipTitle.trim() || 'Executive Target',
          corporate_email: newVipCorpEmail.trim().toLowerCase(),
          personal_emails: newVipPersonalEmail ? [newVipPersonalEmail.trim().toLowerCase()] : [],
          homoglyph_sensitivity: newVipSensitivity,
          is_active: true,
          author: 'SuperAdmin'
        })
      });
      if (resp.ok) {
        setNewVipName('');
        setNewVipTitle('');
        setNewVipCorpEmail('');
        setNewVipPersonalEmail('');
        setIsAddingVip(false);
        triggerNotifySuccess('VIP Executive profile registered');
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error adding VIP:', e);
    }
  };

  const handleRemoveVip = async (vipId: string) => {
    if (!confirm('Remove this VIP from impersonation protection matrix?')) return;
    try {
      const resp = await fetch(`${apiBase}/super-admin/vip-directory/${vipId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        triggerNotifySuccess('VIP profile removed');
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error removing VIP:', e);
    }
  };

  // Save Heuristic Rules
  const handleSaveHeuristicRules = async () => {
    setIsSaving(true);
    try {
      const resp = await fetch(`${apiBase}/super-admin/heuristic-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...heuristicRules,
          author: 'SuperAdmin'
        })
      });
      if (resp.ok) {
        triggerNotifySuccess('Heuristic phrase matrices deployed');
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error saving heuristic rules:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Policies
  const handleSavePolicies = async () => {
    setIsSaving(true);
    try {
      const resp = await fetch(`${apiBase}/super-admin/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...policies,
          author: 'SuperAdmin'
        })
      });
      if (resp.ok) {
        triggerNotifySuccess('Remediation thresholds & routing policies saved');
        fetchSuperAdminData();
      }
    } catch (e) {
      console.error('Error saving policies:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-200 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Super Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SOC Console</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">
                  Super Admin <span className="text-zinc-500 font-normal">Control Plane</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[10px] font-mono text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-600 animate-pulse" />
                  {promptConfig.gemini_model}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMessage && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-mono animate-in fade-in duration-200 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveSuccessMessage}
              </span>
            )}
            <button
              onClick={fetchSuperAdminData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Vertical Sub-Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-1.5 bg-zinc-950/70 border border-white/[0.08] rounded-xl p-3">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
            Platform Configuration
          </div>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'prompts'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Prompt Engineering Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'domains'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Trusted Platform Allowlists</span>
          </button>

          <button
            onClick={() => setActiveTab('vips')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'vips'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>VIP &amp; Executive Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Heuristic Intent &amp; Keyword Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'policies'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Remediation &amp; Banner Customizer</span>
          </button>

          <div className="pt-2 border-t border-white/[0.08]" />

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Revision Audit Log ({auditLogs.length})</span>
          </button>
        </aside>

        {/* Right Tab Content View */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: AI Prompt Engineering Studio */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              {/* Studio Header Card */}
              <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Gemini System Instructions &amp; Hyperparameter Studio
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Fine-tune the reasoning instructions and hyperparameter weights used for BEC and Quishing inference.
                    </p>
                  </div>

                  <button
                    onClick={handleSavePrompt}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Deploying...' : 'Deploy System Prompt'}</span>
                  </button>
                </div>

                {/* Hyperparameter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-white/[0.08]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span>Gemini Model:</span>
                    </label>
                    <select
                      value={promptConfig.gemini_model}
                      onChange={e => setPromptConfig({ ...promptConfig, gemini_model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    >
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Sub-400ms High Throughput)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Semantic Reasoning)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen Multimodal)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span>Gemini API Key:</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 hover:underline font-mono"
                      >
                        Get Key &rarr;
                      </a>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter Gemini API key (or configure in .env)"
                      value={promptConfig.gemini_api_key || ''}
                      onChange={e => setPromptConfig({ ...promptConfig, gemini_api_key: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Temperature:</span>
                      <span className="font-mono text-zinc-400">{promptConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={promptConfig.temperature}
                      onChange={e => setPromptConfig({ ...promptConfig, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-white cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>0.0 (Deterministic)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Max Tokens:</span>
                      <span className="font-mono text-zinc-400">{promptConfig.max_output_tokens}</span>
                    </div>
                    <input
                      type="range"
                      min={256}
                      max={2048}
                      step={128}
                      value={promptConfig.max_output_tokens}
                      onChange={e => setPromptConfig({ ...promptConfig, max_output_tokens: parseInt(e.target.value) })}
                      className="w-full accent-white cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>256</span>
                      <span>2048 Tokens</span>
                    </div>
                  </div>
                </div>


                {/* System Prompt Code Area */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">ApexShield-NLP Core System Prompt:</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      Chars: {promptConfig.system_prompt.length} | Est. Tokens: ~{Math.round(promptConfig.system_prompt.length / 4)}
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={promptConfig.system_prompt}
                    onChange={e => setPromptConfig({ ...promptConfig, system_prompt: e.target.value })}
                    className="w-full p-4 rounded-xl bg-black border border-white/10 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-white/30 resize-y"
                    placeholder="Enter the system instructions for Gemini..."
                  />
                </div>
              </div>

              {/* Prompt Testing Playground */}
              <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Interactive Prompt Playground</h3>
                  </div>
                  <button
                    onClick={handleRunPlaygroundTest}
                    disabled={isTestingPrompt}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600 text-black font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isTestingPrompt ? 'Evaluating Prompt...' : 'Run Test Inference'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Sender Display Name</label>
                    <input
                      type="text"
                      value={testSenderDisplay}
                      onChange={e => setTestSenderDisplay(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Sender Email Header From</label>
                    <input
                      type="text"
                      value={testSenderEmail}
                      onChange={e => setTestSenderEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Subject</label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={e => setTestSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Raw Email Body Content</label>
                  <textarea
                    rows={4}
                    value={testBody}
                    onChange={e => setTestBody(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Playground Output */}
                {playgroundResult && (
                  <div className="p-4 rounded-xl bg-black border border-blue-500/40 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono text-blue-400 pb-2 border-b border-white/[0.08]">
                      <span>Model: {playgroundResult.model_used}</span>
                      <span>Latency: {playgroundResult.latency_ms}ms</span>
                      <span>Est. Tokens: {playgroundResult.estimated_tokens}</span>
                    </div>
                    <pre className="text-[11px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-60">
                      {JSON.stringify(playgroundResult.evaluation, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Trusted Platform Allowlists */}
          {activeTab === 'domains' && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Trusted Platforms &amp; Enterprise SaaS Allowlist
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Emails originating from authenticated trusted domains (e.g. LinkedIn, GitHub, Slack) bypass keyword false positives.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingDomain(!isAddingDomain)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingDomain ? 'Cancel' : 'Add Trusted Domain'}</span>
                </button>
              </div>

              {/* Add Domain Form */}
              {isAddingDomain && (
                <form onSubmit={handleAddDomain} className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3 animate-in fade-in duration-200">
                  <span className="text-xs font-semibold text-white block">Register New Trusted Domain:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. partner.corp.com"
                      value={newDomain}
                      onChange={e => setNewDomain(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      placeholder="Organization Name (e.g. Acme Corp)"
                      value={newDomainName}
                      onChange={e => setNewDomainName(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Payroll Provider)"
                      value={newDomainCategory}
                      onChange={e => setNewDomainCategory(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600 text-black font-semibold text-xs transition-all shadow-sm"
                  >
                    Confirm Allowlist Entry
                  </button>
                </form>
              )}

              {/* Domains Table */}
              <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-mono text-[11px]">
                      <th className="p-3">DOMAIN PATTERN</th>
                      <th className="p-3">PLATFORM NAME</th>
                      <th className="p-3">CATEGORY</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trustedDomains.map(d => (
                      <tr key={d.domain} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-mono text-zinc-300 font-medium">{d.domain}</td>
                        <td className="p-3 text-white">{d.name}</td>
                        <td className="p-3 text-zinc-400 font-mono text-[11px]">{d.category}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-600" />
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveDomain(d.domain)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove Domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VIP & Executive Matrix */}
          {activeTab === 'vips' && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Executive VIP Directory &amp; Homoglyph Strictness
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Protects corporate executives from display-name spoofing and lookalike domain attacks.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingVip(!isAddingVip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingVip ? 'Cancel' : 'Add VIP Executive'}</span>
                </button>
              </div>

              {/* Add VIP Form */}
              {isAddingVip && (
                <form onSubmit={handleAddVip} className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3 animate-in fade-in duration-200">
                  <span className="text-xs font-semibold text-white block">Register New VIP Target:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Alex Mercer)"
                      value={newVipName}
                      onChange={e => setNewVipName(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      placeholder="Title (e.g. Chief Executive Officer)"
                      value={newVipTitle}
                      onChange={e => setNewVipTitle(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Corporate Email (e.g. ceo@cloudnet.io)"
                      value={newVipCorpEmail}
                      onChange={e => setNewVipCorpEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="email"
                      placeholder="Personal / Secondary Email (e.g. personal@gmail.com)"
                      value={newVipPersonalEmail}
                      onChange={e => setNewVipPersonalEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-300">Homoglyph Sensitivity:</span>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      value={newVipSensitivity}
                      onChange={e => setNewVipSensitivity(parseInt(e.target.value))}
                      className="accent-white cursor-pointer w-48"
                    />
                    <span className="text-xs font-mono text-zinc-400">{newVipSensitivity}%</span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600 text-black font-semibold text-xs transition-all shadow-sm"
                  >
                    Save VIP Executive
                  </button>
                </form>
              )}

              {/* VIP Table */}
              <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-mono text-[11px]">
                      <th className="p-3">NAME &amp; TITLE</th>
                      <th className="p-3">OFFICIAL / CORPORATE EMAIL</th>
                      <th className="p-3">SECONDARY EMAILS</th>
                      <th className="p-3">FUZZINESS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vipDirectory.map(v => (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{v.name}</div>
                          <div className="text-[11px] text-zinc-400">{v.title}</div>
                        </td>
                        <td className="p-3 font-mono text-zinc-300">{v.corporate_email}</td>
                        <td className="p-3 font-mono text-zinc-400 text-[11px]">
                          {v.personal_emails?.join(', ') || 'None'}
                        </td>
                        <td className="p-3 font-mono text-zinc-300">{v.homoglyph_sensitivity}%</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveVip(v.id)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove VIP"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Heuristic & Intent Rule Engine */}
          {activeTab === 'rules' && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    Heuristic Keyword Triggers &amp; Compound Fraud Matrices
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configure the exact phrase sets evaluated for Payroll Diversion, Wire Fraud, and Urgency scoring.
                  </p>
                </div>
                <button
                  onClick={handleSaveHeuristicRules}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Deploying...' : 'Deploy Rule Sets'}</span>
                </button>
              </div>

              {/* Payroll Phrases */}
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <span className="text-xs font-semibold text-zinc-200 block">
                  Payroll Diversion Compound Intent Phrases ({heuristicRules.payroll_phrases?.length || 0})
                </span>
                <p className="text-[11px] text-zinc-400">
                  Strict compound expressions that indicate an attempt to subvert direct deposit.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {heuristicRules.payroll_phrases?.map((phrase, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
                      <span>{phrase}</span>
                      <button
                        onClick={() => {
                          const updated = heuristicRules.payroll_phrases.filter((_, i) => i !== idx);
                          setHeuristicRules({ ...heuristicRules, payroll_phrases: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400 text-xs ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add new payroll phrase..."
                    value={newPayrollPhrase}
                    onChange={e => setNewPayrollPhrase(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => {
                      if (newPayrollPhrase.trim()) {
                        setHeuristicRules({
                          ...heuristicRules,
                          payroll_phrases: [...(heuristicRules.payroll_phrases || []), newPayrollPhrase.trim().toLowerCase()]
                        });
                        setNewPayrollPhrase('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
                  >
                    Add Phrase
                  </button>
                </div>
              </div>

              {/* Wire Phrases */}
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <span className="text-xs font-semibold text-zinc-200 block">
                  Wire Transfer &amp; Financial Solicitations ({heuristicRules.wire_phrases?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {heuristicRules.wire_phrases?.map((phrase, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
                      <span>{phrase}</span>
                      <button
                        onClick={() => {
                          const updated = heuristicRules.wire_phrases.filter((_, i) => i !== idx);
                          setHeuristicRules({ ...heuristicRules, wire_phrases: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400 text-xs ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add new wire phrase..."
                    value={newWirePhrase}
                    onChange={e => setNewWirePhrase(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => {
                      if (newWirePhrase.trim()) {
                        setHeuristicRules({
                          ...heuristicRules,
                          wire_phrases: [...(heuristicRules.wire_phrases || []), newWirePhrase.trim().toLowerCase()]
                        });
                        setNewWirePhrase('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
                  >
                    Add Phrase
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Policies & Warning Banners */}
          {activeTab === 'policies' && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    Remediation Governance &amp; Threat Scoring Policies
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Define automated quarantine thresholds, SIEM webhooks, and in-mailbox alert banners.
                  </p>
                </div>
                <button
                  onClick={handleSavePolicies}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Deploy Policies'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Automated Quarantine Threshold:</span>
                    <span className="font-mono text-white">{policies.auto_remediation_threshold} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={policies.auto_remediation_threshold}
                    onChange={e => setPolicies({ ...policies, auto_remediation_threshold: parseInt(e.target.value) })}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Security Operations Admin Email:
                  </label>
                  <input
                    type="email"
                    value={policies.security_admin_email}
                    onChange={e => setPolicies({ ...policies, security_admin_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    SIEM / Slack Alert Webhook URL:
                  </label>
                  <input
                    type="url"
                    value={policies.slack_webhook_url}
                    onChange={e => setPolicies({ ...policies, slack_webhook_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Revision Audit Log */}
          {activeTab === 'audit' && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  Configuration Revision Log &amp; Author Audit Trail
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chronological record of all prompt adjustments, allowlist updates, and policy redeployments.
                </p>
              </div>

              <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-mono text-[11px]">
                      <th className="p-3 w-40">TIMESTAMP</th>
                      <th className="p-3 w-36">AUTHOR</th>
                      <th className="p-3 w-44">ACTION</th>
                      <th className="p-3">REVISION DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-mono text-zinc-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-white">{log.author}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[10px] font-mono text-zinc-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300 text-xs">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
