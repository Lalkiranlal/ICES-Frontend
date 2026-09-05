import { StudyGuide } from "./study-guide";
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BookOpen,
  Shield,
  Settings,
  Mail,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Save,
  Cpu,
  RefreshCw,
  Globe
} from 'lucide-react';
import { humanizeThreatCategory, humanizeRemediationStatus } from '../../lib/utils';


interface MonitoredUser {
  id: string;
  email: string;
  display_name: string;
  provider: string;
  status: string;
  registered_at: string;
  total_scanned: number;
  threats_blocked: number;
  last_active: string;
}

interface AdminConfig {
  security_admin_email: string;
  notify_user_on_quarantine: boolean;
  auto_remediation_threshold: number;
  environment: string;
  gemini_model: string;
}

interface IncidentReport {
  id: string;
  timestamp: string;
  reported_by: string;
  message_id: string;
  subject: string;
  sender: string;
  threat_category: string;
  status: string;
  analyst_notes: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  apiBase
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'routing' | 'guide' | 'system'>('users');
  const [users, setUsers] = useState<MonitoredUser[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [config, setConfig] = useState<AdminConfig>({
    security_admin_email: 'security@company.com',
    notify_user_on_quarantine: true,
    auto_remediation_threshold: 80,
    environment: 'development',
    gemini_model: 'gemini-1.5-flash'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersResp, reportsResp] = await Promise.all([
        fetch(`${apiBase}/admin/users`),
        fetch(`${apiBase}/remediation/reports`).catch(() => null)
      ]);

      if (usersResp.ok) {
        const data = await usersResp.json();
        setUsers(data.users || []);
        if (data.config) {
          setConfig(data.config);
        }
      }

      if (reportsResp && reportsResp.ok) {
        const reportData = await reportsResp.json();
        setReports(reportData.reports || []);
      }
    } catch (e) {
      console.warn('Error fetching admin directory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);


  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const resp = await fetch(`${apiBase}/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (resp.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error updating admin config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const resp = await fetch(`${apiBase}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          display_name: newName.trim() || 'Employee Mailbox',
          provider: 'Google Workspace'
        })
      });
      if (resp.ok) {
        setNewEmail('');
        setNewName('');
        setIsAddingUser(false);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error registering new user:', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this mailbox from ICES monitoring?')) return;
    try {
      const resp = await fetch(`${apiBase}/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error removing user:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0c0c10] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-white">
              <Settings className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white tracking-tight">
                Organization Mailbox Directory &amp; Policy
              </h2>
              <p className="text-xs text-zinc-400">
                Manage monitored mailboxes, automated quarantine thresholds, and ingestion policies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-black/20 text-xs font-medium">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'users'
                ? 'text-white border-white bg-white/[0.05]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Monitored Mailboxes ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'reports'
                ? 'text-white border-white bg-white/[0.05]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Incident &amp; Employee Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'routing'
                ? 'text-white border-white bg-white/[0.05]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert Routing &amp; Policy</span>
          </button>


          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'guide'
                ? 'text-blue-300 border-purple-400 bg-blue-600/15'
                : 'text-blue-400/70 border-transparent hover:text-blue-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">📖 About Us &amp; Platform Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'system'
                ? 'text-white border-white bg-white/[0.05]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Telemetry</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    {/* TAB: Learning Lab & Architecture Guide */}
          {activeTab === 'guide' && (
            <StudyGuide />
          )}

          {/* TAB 1: Monitored Users Directory */}
          {activeTab === 'users' && (

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Registered Protected Mailboxes</h3>
                  <p className="text-xs text-zinc-400">All inbound messages to these accounts are inspected in real time.</p>
                </div>
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingUser ? 'Cancel' : 'Register Mailbox'}</span>
                </button>
              </div>

              {/* Add User Form */}

              {isAddingUser && (
                <form onSubmit={handleAddUser} className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3 animate-in fade-in duration-200">
                  <span className="text-xs font-semibold text-white block">Register New Mailbox for Protection:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="employee@company.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      placeholder="Display Name (e.g. John Doe - Finance)"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="px-3.5 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm"
                  >
                    Confirm Registration
                  </button>
                </form>
              )}

              {/* Users Table */}
              <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-zinc-400 font-mono text-[11px] border-b border-white/[0.06]">
                    <tr>
                      <th className="p-3">Mailbox &amp; User</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Emails Scanned</th>
                      <th className="p-3">Threats Blocked</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{u.email}</div>
                          <div className="text-[11px] text-zinc-400">{u.display_name}</div>
                        </td>
                        <td className="p-3 text-zinc-300 font-mono text-[11px]">{u.provider}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[11px] font-mono text-zinc-300 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-[2px] bg-blue-600 animate-pulse" />
                            {u.status === 'PROTECTED' ? 'Active Shield' : u.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-200 font-semibold">{u.total_scanned}</td>
                        <td className="p-3 font-mono text-red-400 font-semibold">{u.threats_blocked}</td>
                        <td className="p-3 text-right">
                          {u.id !== 'usr-01' ? (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Remove Mailbox"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono">Primary</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Independent Incident & Employee Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Employee Phish Reports &amp; Containment Incidents</h3>
                  <p className="text-xs text-zinc-400">Stream of independently submitted phishing reports via in-mail warning banners and automated SOC escalations.</p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Stream</span>
                </button>
              </div>

              {/* Responsive Scroll Container */}
              <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                <table className="w-full text-left text-xs border-collapse font-sans min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-mono text-[11px]">
                      <th className="p-3 whitespace-nowrap w-28">INCIDENT ID</th>
                      <th className="p-3 whitespace-nowrap w-44">REPORTED BY</th>
                      <th className="p-3">SUBJECT &amp; SENDER</th>
                      <th className="p-3 whitespace-nowrap w-36">CATEGORY</th>
                      <th className="p-3 whitespace-nowrap w-36">STATUS</th>
                      <th className="p-3 whitespace-nowrap w-24 text-right">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">
                          No independent incident reports submitted yet.
                        </td>
                      </tr>
                    ) : (
                      reports.map((rep) => (
                        <tr key={rep.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-mono text-zinc-300 font-semibold whitespace-nowrap">{rep.id}</td>
                          <td className="p-3 font-mono text-zinc-300 whitespace-nowrap truncate max-w-[160px]">{rep.reported_by}</td>
                          <td className="p-3 min-w-[200px]">
                            <div className="text-white font-medium truncate max-w-sm">{rep.subject}</div>
                            <div className="text-[10px] text-zinc-500 font-mono truncate">{rep.sender}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-[2px] bg-red-400 shrink-0" />
                              <span>{humanizeThreatCategory(rep.threat_category)}</span>
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-[2px] bg-blue-600 shrink-0" />
                              <span>{humanizeRemediationStatus(rep.status)}</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono text-zinc-500 text-[10px] whitespace-nowrap text-right">
                            {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Alert Routing & Policy Preferences */}
          {activeTab === 'routing' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Security Alert Notification Routing</h3>
                <p className="text-xs text-zinc-400">Configure where automated SOC incident briefings and quarantine notices are dispatched.</p>
              </div>


              <div className="space-y-4">
                {/* Admin Destination Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Designated Security Operations / Admin Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      value={config.security_admin_email}
                      onChange={e => setConfig({ ...config, security_admin_email: e.target.value })}
                      placeholder="security@yourcompany.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Real-time technical incident briefings and wire fraud alerts will be dispatched to this address.
                  </span>
                </div>

                {/* Auto-Remediation Threshold */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Automated Quarantine Threat Threshold:</span>
                    <span className="font-bold text-white font-mono">{config.auto_remediation_threshold} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={config.auto_remediation_threshold}
                    onChange={e => setConfig({ ...config, auto_remediation_threshold: Number(e.target.value) })}
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>50 (Aggressive)</span>
                    <span>80 (Recommended Standard)</span>
                    <span>95 (Conservative)</span>
                  </div>
                </div>

                {/* User Notification Toggle */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Notify End-Users on Quarantine</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Automatically send a warning notice to the employee when an incoming malicious email is secured.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.notify_user_on_quarantine}
                    onChange={e => setConfig({ ...config, notify_user_on_quarantine: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>

                  {saveSuccess && (
                    <span className="flex items-center gap-1 text-xs text-blue-400 font-semibold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved Successfully!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: System Status */}
          {activeTab === 'system' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">System Infrastructure &amp; AI Engines</h3>
                <p className="text-xs text-zinc-400">Live operational status of all background detectors.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold font-mono">Gemini AI Model</span>
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {config.gemini_model}
                  </div>
                  <p className="text-[11px] text-zinc-500">Structured JSON BEC inference &amp; NLP extraction</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold font-mono">Ingestion Mode</span>
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Google Cloud Pub/Sub &amp; Live API
                  </div>
                  <p className="text-[11px] text-zinc-500">Zero-touch post-delivery event streaming</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold font-mono">GeoIP &amp; ASN Engine</span>
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Team Cymru ASN + Reverse DNS PTR
                  </div>
                  <p className="text-[11px] text-zinc-500">Real-time mail relay hop network tracing</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold font-mono">Environment</span>
                  <div className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    {config.environment.toUpperCase()}
                  </div>
                  <p className="text-[11px] text-zinc-500">Local-first cached memory architecture</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

