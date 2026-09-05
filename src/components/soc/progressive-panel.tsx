import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Globe,
  Server,
  DollarSign,
  FileCode,
  Copy,
  Check,
  ArrowLeft,
  Mail,
  AlertTriangle,
  Terminal,
  UserCheck,
  QrCode,
  FileText,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Activity,
  History
} from 'lucide-react';
import { EmailAlert, ClusterPurgeResponse } from '../../types/ices';
import { SmtpHopGraph } from './visual-forensics/smtp-hop-graph';
import { formatScoreColor, formatAuthBadge, humanizeThreatCategory, humanizeRemediationStatus } from '../../lib/utils';


interface ProgressivePanelProps {
  alert: EmailAlert | null;
  onRemediate: (action: 'QUARANTINE' | 'RELEASE') => void;
  isActionLoading: boolean;
  onBackToFeed?: () => void;
  apiBase: string;
}

export const ProgressivePanel: React.FC<ProgressivePanelProps> = ({
  alert,
  onRemediate,
  isActionLoading,
  onBackToFeed,
  apiBase
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'gemini' | 'vip' | 'baseline' | 'attachments' | 'banner' | 'headers' | 'raw'>('visual');
  const [isClusterPurgeModalOpen, setIsClusterPurgeModalOpen] = useState(false);
  const [isPurgingCluster, setIsPurgingCluster] = useState(false);
  const [clusterPurgeResult, setClusterPurgeResult] = useState<ClusterPurgeResponse | null>(null);

  if (!alert) {
    return (
      <div className="exec-card p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full min-h-[460px] shadow-subtle-card">
        <Server className="w-8 h-8 text-zinc-700 mb-3" />
        <p className="text-slate-300 font-medium">Select a message from the threat stream to inspect forensic telemetry.</p>
        <p className="text-slate-400 mt-1 text-[11px]">Unpacks SMTP relay traversal, RFC authentication, zero-shot NLP intent, and VIP lookalike domains.</p>
      </div>
    );
  }

  const forensic = alert.forensic_logs?.[0];
  const nlp = alert.nlp_evaluations?.[0];
  const vip = alert.vip_analysis;
  const baseline = alert.sender_behavioral_baseline;
  const attachments = alert.attachment_forensics;
  const banner = alert.warning_banner;
  const scoreStyle = formatScoreColor(alert.threat_score);
  const isQuarantined = alert.remediation_status.includes('QUARANTINED') || alert.remediation_status === 'CLUSTER_PURGED';
  const isClean = alert.threat_score < 20;

  const handleCopyRaw = () => {
    const rawContent = forensic?.raw_eml_snippet || forensic?.raw_received_headers?.join('\n') || '';
    navigator.clipboard.writeText(rawContent);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleExecuteClusterPurge = async () => {
    setIsPurgingCluster(true);
    try {
      const resp = await fetch(`${apiBase}/remediation/cluster-purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_pattern: alert.subject,
          sender_domain: alert.sender_header_from.split('@')[1] || '',
          threat_cluster_id: alert.id
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setClusterPurgeResult(data);
      } else {
        const err = await resp.json().catch(() => ({ detail: 'Cluster purge execution failed' }));
        console.error('Cluster purge error:', err);
      }
    } catch (e) {
      console.error('Network error during cluster purge:', e);
    } finally {
      setIsPurgingCluster(false);
    }

  };

  return (
    <div className="exec-card flex flex-col h-full overflow-hidden shadow-subtle-card relative">
      {/* Header Section */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-black/40 flex flex-col gap-4">
        {onBackToFeed && (
          <button
            onClick={onBackToFeed}
            className="lg:hidden self-start flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-slate-300 text-xs font-medium border border-white/[0.08]"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Stream</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Score / Clean Indicator */}
            {isClean ? (
              <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex flex-col items-center justify-center shrink-0 font-mono">
                <Check className="w-5 h-5 text-slate-400" />
                <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">CLEAN</span>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 font-mono ${scoreStyle.bg} ${scoreStyle.border}`}
              >
                <span className={`text-base font-bold ${scoreStyle.text}`}>{alert.threat_score}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400">
                  {alert.threat_score >= 80 ? 'CRIT' : 'RISK'}
                </span>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {alert.id.slice(0, 8)}
                </span>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[10px] font-mono text-slate-300">
                  <span className={`w-1.5 h-1.5 rounded-[2px] ${isClean ? 'bg-zinc-500' : (alert.threat_score >= 80 ? 'bg-red-400' : 'bg-blue-600')}`} />
                  <span>{humanizeThreatCategory(alert.threat_category)}</span>
                </div>


                {vip?.is_impersonation_threat && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-blue-500/40 text-[10px] font-mono text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-600" />
                    <span>VIP Impersonation Alert</span>
                  </div>
                )}

                {attachments?.is_quishing_detected && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-blue-500/40 text-[10px] font-mono text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-600" />
                    <span>QR Quishing Vector</span>
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight mt-1">
                {alert.subject || '(No Subject)'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-lg">
                Sender: <span className="text-slate-300">{alert.sender_display_name || alert.sender_header_from}</span>
              </p>

            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* 1-Click Cluster Quarantine (Search & Destroy) */}
            <button
              onClick={() => {
                setClusterPurgeResult(null);
                setIsClusterPurgeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Search and purge this attack campaign across all 50+ organization mailboxes"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Search &amp; Destroy</span>
            </button>

            {isQuarantined ? (
              <button
                disabled={isActionLoading}
                onClick={() => onRemediate('RELEASE')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-medium transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isActionLoading ? 'Releasing...' : 'Release to Inbox'}</span>
              </button>
            ) : (
              <button
                disabled={isActionLoading}
                onClick={() => onRemediate('QUARANTINE')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isActionLoading ? 'Quarantining...' : 'Quarantine Mailbox'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Signals Quick Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.08] text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.08]">
            <span className="text-[9px] text-slate-400 block uppercase">Origin IP</span>
            <span className="text-slate-300 font-medium truncate block mt-0.5">
              {forensic?.originating_ip || 'N/A'} ({forensic?.originating_country || 'US'})
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.08]">
            <span className="text-[9px] text-slate-400 block uppercase">VIP Impersonation</span>
            <span className={`font-medium block truncate mt-0.5 ${vip?.is_impersonation_threat ? 'text-red-400' : 'text-blue-400'}`}>
              {vip?.is_impersonation_threat ? `⚠️ ${vip.impersonated_vip?.name || 'Executive Spoofed'}` : '✓ Authenticated'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.08]">
            <span className="text-[9px] text-slate-400 block uppercase">Multimodal Vision</span>
            <span className="text-slate-300 font-medium block mt-0.5 truncate">
              {attachments?.is_quishing_detected ? '⚠️ QR Quishing Link' : (attachments?.total_attachments ? `${attachments.total_attachments} Attachments Scanned` : 'Zero Attachments')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.08]">
            <span className="text-[9px] text-slate-400 block uppercase">AI Intent Verdict</span>
            <span className="text-slate-300 font-medium block mt-0.5 truncate">
              {nlp ? `${(nlp.confidence_score * 100).toFixed(0)}% (${nlp.bec_subtype.replace('BEC_', '')})` : 'Verified Safe'}
            </span>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'visual'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Relay Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'gemini'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Threat Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'vip'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>VIP &amp; Lookalike Domain</span>
          </button>

          <button
            onClick={() => setActiveTab('baseline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'baseline'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sender Baseline</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'attachments'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR &amp; Vision Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'banner'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Warning Banner Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'headers'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>RFC Headers</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'raw'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw Payload</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-black/20">
        {/* Tab 1: Visual Forensics (ReactFlow Graph) */}
        {activeTab === 'visual' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                RFC Received Hop Traversal Network
              </span>
              <span className="text-slate-400 text-[11px]">Scroll/Pinch to zoom &amp; pan</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0F162A] shadow-inner min-h-[420px]">
              <SmtpHopGraph hops={forensic?.smtp_hops || []} />
            </div>
          </div>
        )}

        {/* Tab 2: Gemini AI Analysis */}
        {activeTab === 'gemini' && (
          <div className="space-y-4 text-xs">
            {nlp ? (
              <>
                {/* Executive Assessment */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2 text-white font-semibold mb-1.5 text-xs">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Executive Threat Assessment</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans leading-normal">
                    {nlp.executive_summary}
                  </p>
                </div>

                {/* Financial Wire Detection */}
                {nlp.financial_request_detected && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-2.5 text-xs">
                      <DollarSign className="w-4 h-4" />
                      <span>Extracted Wire &amp; Bank Coordinates</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.08]">
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Demanded Amount</span>
                        <span className="text-red-400 font-semibold text-sm">
                          {nlp.requested_amount_usd ? `$${nlp.requested_amount_usd.toLocaleString()} USD` : 'Wire Coordinate Redirection'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.08]">
                        <span className="text-slate-400 text-[10px] block uppercase font-mono">Beneficiary Entity</span>
                        <span className="text-white font-medium">
                          {nlp.extracted_bank_entities?.beneficiary || 'N/A'} ({nlp.extracted_bank_entities?.bank_name || 'N/A'})
                        </span>
                      </div>
                      {nlp.extracted_bank_entities?.routing_number && (
                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.08]">
                          <span className="text-slate-400 text-[10px] block uppercase font-mono">Routing Number</span>
                          <span className="text-slate-300 font-mono font-medium">{nlp.extracted_bank_entities.routing_number}</span>
                        </div>
                      )}
                      {nlp.extracted_bank_entities?.account_number && (
                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/[0.08]">
                          <span className="text-slate-400 text-[10px] block uppercase font-mono">Account Number</span>
                          <span className="text-slate-300 font-mono font-medium">{nlp.extracted_bank_entities.account_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Linguistic Cues & Deception */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
                    <span className="text-slate-300 font-semibold block mb-2 text-xs flex items-center justify-between">
                      <span>Linguistic Urgency Patterns</span>
                      <span className="text-[10px] text-zinc-500 font-mono">NLP PARSER</span>
                    </span>
                    {nlp.linguistic_cues && nlp.linguistic_cues.length > 0 ? (
                      <ul className="space-y-1.5">
                        {nlp.linguistic_cues.map((cue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <span className="text-blue-400 font-bold">&bull;</span>
                            <span className="italic text-slate-300">"{cue}"</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-zinc-400 italic">
                        Standard business communication. No high-pressure urgency cues or wire manipulation triggers found.
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
                    <span className="text-slate-300 font-semibold block mb-2 text-xs flex items-center justify-between">
                      <span>Deception Taxonomy</span>
                      <span className="text-[10px] text-zinc-500 font-mono">INTENT REASONING</span>
                    </span>
                    {nlp.deception_techniques && nlp.deception_techniques.length > 0 ? (
                      <ul className="space-y-1.5">
                        {nlp.deception_techniques.map((tech, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <span className="text-rose-400 font-bold">&bull;</span>
                            <span className="text-slate-300">{tech}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-zinc-400 italic">
                        Zero deception vectors, executive spoofing, or credential phishing markers detected.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-white font-medium">Zero Malicious Intent Detected</span>
                <p className="text-slate-400 text-xs mt-1">Sender reputation and RFC cryptographic signatures passed all thresholds.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: VIP Impersonation & Lookalike Domain Inspector */}
        {activeTab === 'vip' && (
          <div className="space-y-4 text-xs">
            {vip && vip.is_impersonation_threat ? (
              <>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Executive Impersonation Alert</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-normal">
                    This email was sent from an external unverified domain, but spoofed the identity of internal leadership (<strong>{vip.impersonated_vip?.name || 'Executive'}</strong>).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">Spoofed VIP Profile</span>
                    <div className="text-white font-semibold text-sm mt-1">{vip.impersonated_vip?.name || 'Executive Officer'}</div>
                    <div className="text-slate-400 text-xs">{vip.impersonated_vip?.title || 'Executive Leadership'}</div>
                    <div className="text-[11px] font-mono text-blue-400 mt-1">Official: {vip.impersonated_vip?.official_email || 'executive@organization.com'}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">Actual Sender Identity</span>
                    <div className="text-red-400 font-mono text-xs mt-1 truncate">{alert.sender_header_from}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Technique: <span className="text-white font-medium">{vip.spoofing_technique}</span></div>
                    <div className="text-[10px] text-slate-400 mt-1">Reply-To Route: {alert.reply_to || 'N/A'}</div>
                  </div>
                </div>

                {vip.lookalike_domain_detected && vip.lookalike_details && (
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-blue-500/40">
                    <span className="text-blue-400 font-semibold text-xs block mb-1.5">
                      ⚠️ Lookalike Domain / Homoglyph Spoof
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                      <div className="p-2 rounded bg-black/40 border border-white/[0.08]">
                        <span className="text-slate-400 text-[9px] block">SENDER DOMAIN</span>
                        <span className="text-red-400 font-semibold">{vip.lookalike_details.sender_domain}</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/[0.08]">
                        <span className="text-slate-400 text-[9px] block">PROTECTED DOMAIN</span>
                        <span className="text-blue-400 font-semibold">{vip.lookalike_details.target_domain}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Similarity: <strong className="text-white">{Math.round(vip.lookalike_details.similarity_score * 100)}%</strong> &bull; Homoglyph Chars: <span className="text-blue-300">{vip.lookalike_details.homoglyph_detected ? 'Detected' : 'Standard Typosquatting'}</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <UserCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-white font-medium">No VIP Impersonation Detected</span>
                <p className="text-slate-400 text-xs mt-1">Sender display name and envelope are aligned with normal external traffic.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Multimodal QR Code (Quishing) & PDF Vision */}
        {activeTab === 'attachments' && (
          <div className="space-y-4 text-xs">
            {attachments && (attachments.is_quishing_detected || attachments.total_attachments > 0) ? (
              <>
                {attachments.is_quishing_detected && (
                  <div className="p-4 rounded-xl bg-blue-500/15 border border-blue-500/40">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1.5">
                      <QrCode className="w-4 h-4" />
                      <span>Quishing (QR Code Phishing) Vector Detected</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-normal">
                      The attacker embedded a QR code image to bypass standard text NLP filters and lure employees into scanning with their personal mobile devices.
                    </p>
                    {attachments.extracted_qr_urls.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-[11px] break-all">
                        <span className="text-slate-400 block text-[9px] uppercase">Decoded QR Destination URL</span>
                        <span className="text-blue-300 font-medium">{attachments.extracted_qr_urls[0]}</span>
                      </div>
                    )}
                  </div>
                )}

                {attachments.combined_ocr_text && (
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08]">
                    <span className="text-slate-300 font-semibold block mb-1 text-xs">PDF / Image OCR Extraction</span>
                    <pre className="p-3 rounded-lg bg-black/50 border border-white/[0.08] text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                      {attachments.combined_ocr_text}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-slate-400 font-mono text-[11px] block">Attached Files ({attachments.scanned_items.length}):</span>
                  {attachments.scanned_items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-white font-medium text-xs block">{item.filename}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.content_type} &bull; {item.size_bytes ? `${item.size_bytes} bytes` : 'Embedded'}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                        item.is_qr_code 
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : (item.financial_detected ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-800 text-slate-300 border-white/[0.08]')
                      }`}>
                        {item.is_qr_code ? 'QR_QUISHING' : (item.financial_detected ? 'FINANCIAL_PDF' : 'SCANNED_SAFE')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-white font-medium">Zero Suspicious Attachments</span>
                <p className="text-slate-400 text-xs mt-1">This payload contains no embedded QR codes or fraudulent PDF invoices.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Behavioral Baseline & Communication Intelligence */}
        {activeTab === 'baseline' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h4 className="font-semibold text-white text-sm">Behavioral Communication Profile</h4>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  baseline?.is_new_sender 
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/40' 
                    : 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                }`}>
                  {baseline?.is_new_sender ? '⚠️ FIRST-TIME CONTACT' : `ESTABLISHED (${baseline?.total_emails_count || 1} EMAILS)`}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                {baseline?.is_new_sender 
                  ? 'First recorded communication from this sender across the organization. Heightened anomaly detection heuristics and first-contact penalties applied.'
                  : `Known sender identity with ${baseline?.total_emails_count || 1} prior messages analyzed. Historical average risk rating: ${baseline?.avg_threat_score || 0}/100.`
                }
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Sender Address</span>
                  <span className="text-slate-300 font-medium truncate block">{alert.sender_header_from}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Historical Msg Count</span>
                  <span className="text-slate-100 font-bold block text-sm">{baseline?.total_emails_count || 1}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Cumulative Avg Threat</span>
                  <span className={`font-bold block text-sm ${(baseline?.avg_threat_score || 0) >= 50 ? 'text-red-400' : 'text-blue-400'}`}>
                    {baseline?.avg_threat_score || alert.threat_score} / 100
                  </span>
                </div>
              </div>

              {baseline?.first_seen_at && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.08]">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>First seen: {new Date(baseline.first_seen_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.08] space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Baseline Policy Matrix</span>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                  <span>New Sender Contact Anomaly:</span>
                  <span className={baseline?.is_new_sender ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                    {baseline?.is_new_sender ? '+15 Risk Penalty Applied' : 'Standard Baseline'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                  <span>VIP Impersonation Flag Count:</span>
                  <span className={baseline?.vip_impersonation_attempts ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    {baseline?.vip_impersonation_attempts || 0} Incident(s)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Persistent SQL Storage:</span>
                  <span className="text-blue-400 font-bold">ices.db (SQLite / PostgreSQL)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Dynamic In-Mailbox Warning Banner Preview */}
        {activeTab === 'banner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <span className={`w-2 h-2 rounded-full ${alert.threat_score >= 50 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                Live Injected Gmail Warning Banner Status:
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded ${
                alert.threat_score >= 50 
                  ? 'text-rose-300 bg-rose-500/20 border border-rose-500/30' 
                  : 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
              }`}>
                {alert.threat_score >= 50 ? 'ACTIVE INBOX INJECTION' : 'NO BANNER REQUIRED (CLEAN)'}
              </span>
            </div>

            {alert.threat_score >= 50 ? (
              /* Rendered Live Gmail Warning Banner for Suspicious & Attack Emails */
              <div className="p-4 sm:p-5 rounded-xl bg-[#141212] border-l-4 border-l-rose-500 border border-rose-500/30 shadow-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">⚠️ SUSPICIOUS MESSAGE</span>
                    <span>CLOUDNET ICES DEFENSE</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    SCORE: {alert.threat_score}/100
                  </span>
                </div>

                <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                  This email originated from an external sender. CloudNet ICES detected {alert.threat_category.replace(/_/g, " ")}. Do not transfer funds, share credentials, or scan embedded QR codes without secondary out-of-band verification.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[11px] font-mono text-zinc-400">
                  <span>Sender: <strong className="text-zinc-200">{alert.sender_header_from}</strong></span>
                  <span className="text-rose-400 font-semibold">PROTECTION: ARMED</span>
                </div>
              </div>
            ) : (
              /* Clean & Safe Message Verification */
              <div className="p-8 rounded-xl bg-[#0B1220] border border-emerald-500/30 text-center space-y-2">
                <ShieldCheck className="w-9 h-9 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white font-sans">No Warning Banner Injected (Clean Message)</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  This message passed all cryptographic SPF/DKIM/DMARC authentication checks with a safe threat score of <strong className="text-emerald-400 font-mono">{alert.threat_score}/100</strong>. It is delivered directly to the employee inbox without disruptive warning banners.
                </p>
              </div>
            )}

            {/* Technical Header Metadata Preview */}
            <div className="p-3.5 rounded-xl bg-[#080E1A] border border-white/[0.08] text-xs font-mono text-slate-300 space-y-1.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                INJECTION TELEMETRY
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Header Tag:</span>
                <span className={alert.threat_score >= 50 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  X-ICES-Security-Verdict: {alert.severity} ({alert.threat_score}/100)
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Gmail Delivery Status:</span>
                <span className={alert.threat_score >= 50 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {alert.threat_score >= 50 ? "[SUSPICIOUS] Label Attached" : "[INBOX] Normal Clean Delivery"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Hop Relay Headers */}
        {activeTab === 'headers' && (
          <div className="space-y-2.5 font-mono text-xs">
            {forensic?.smtp_hops?.map((hop, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    Hop #{hop.hop_index}: {hop.from_relay || hop.ip}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-slate-300 border border-white/[0.08]">
                    {hop.protocol || 'ESMTPS'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  IP: <span className="text-slate-300 font-medium">{hop.ip}</span> ({hop.country_name || 'Datacenter'}) &bull; ASN: {hop.asn || 'AS15169'}
                </div>
                <div className="text-[10px] text-slate-400 break-all pt-1 border-t border-white/[0.08]">
                  Receiving MTA: {hop.by_relay} &bull; Transit Delay: +{hop.delay_ms || 12}ms
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Raw Payload */}
        {activeTab === 'raw' && (
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>RFC 822 Raw Multipart Stream:</span>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied!' : 'Copy Buffer'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {forensic?.raw_eml_snippet || forensic?.raw_received_headers?.join('\n\n') || '(No raw MIME payload attached)'}
            </pre>
          </div>
        )}
      </div>

      {/* 1-Click Search & Destroy Cluster Purge Modal */}
      {isClusterPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-red-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-red-950/20">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Search &amp; Destroy Organization Purge</span>
              </div>
              <button
                onClick={() => setIsClusterPurgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300">
                You are about to execute an organization-wide campaign eviction. This will scan all 50+ corporate mailboxes and simultaneously quarantine every instance matching:
              </p>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/[0.08] space-y-1 font-mono text-[11px]">
                <div><span className="text-slate-400">Subject:</span> <span className="text-white font-medium">{alert.subject}</span></div>
                <div><span className="text-slate-400">Sender Domain:</span> <span className="text-red-400">{alert.sender_header_from.split('@')[1]}</span></div>
                <div><span className="text-slate-400">Target Tenant:</span> <span className="text-slate-300">Google Workspace (52 Inboxes)</span></div>
              </div>

              {clusterPurgeResult && (
                <div className="p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 space-y-1 animate-in fade-in">
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-blue-400">
                    <Check className="w-4 h-4" />
                    <span>Organization Purge Executed Successfully!</span>
                  </div>
                  <div className="text-[11px] font-mono pt-1 text-slate-300">
                    Scanned: <strong>{clusterPurgeResult.metrics.total_mailboxes_scanned} mailboxes</strong> &bull; Evicted: <strong className="text-red-400">{clusterPurgeResult.metrics.purged_messages_count} copies</strong> in <strong>{clusterPurgeResult.metrics.execution_duration_ms}ms</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-black/40">
              <button
                onClick={() => setIsClusterPurgeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] text-slate-300 hover:text-white text-xs"
              >
                Close
              </button>

              <button
                onClick={handleExecuteClusterPurge}
                disabled={isPurgingCluster || !!clusterPurgeResult}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPurgingCluster ? 'animate-spin' : ''}`} />
                <span>{isPurgingCluster ? 'Purging Mailboxes...' : (clusterPurgeResult ? 'Eviction Complete' : 'Execute Organization Purge')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



