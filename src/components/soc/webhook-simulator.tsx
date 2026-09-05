import React, { useState, useRef } from 'react';
import { X, Play, Terminal, Upload, FileText, CheckCircle2, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';

interface WebhookSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateIngestion: (rawEml: string) => void;
  recipientEmail?: string;
}

export const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({
  isOpen,
  onClose,
  onSimulateIngestion,
  recipientEmail = 'user@organization.com'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preset'>('upload');
  const [emlContent, setEmlContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setEmlContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setEmlContent(text);
      };
      reader.readAsText(file);
    }
  };

  const loadPreset = (type: 'vip_ceo' | 'quishing' | 'pdf_invoice' | 'payroll' | 'clean') => {
    const now = new Date().toUTCString();
    const targetUser = recipientEmail;
    if (type === 'vip_ceo') {
      setEmlContent(`Received: from mail-relay.c0mpany-wire.com (relay.c0mpany-wire.com [185.220.101.5])
    by mx.google.com with ESMTPS id gcp_vip_01
    for <${targetUser}>; ${now}
Authentication-Results: mx.google.com;
    dkim=fail header.i=@c0mpany-wire.com;
    spf=fail (google.com: domain does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=sarah.jenkins@c0mpany-wire.com;
    dmarc=fail (p=QUARANTINE) header.from=c0mpany-wire.com
Message-ID: <vip-threat-${Date.now()}@c0mpany-wire.com>
From: "Sarah Jenkins (CFO)" <sarah.jenkins@c0mpany-wire.com>
Reply-To: executive-desk-wire@gmail.com
To: ${targetUser}
Subject: URGENT: Confidential Acquisition Escrow Wire Authorization
Date: ${now}
Content-Type: text/plain; charset="utf-8"

Hi Team,
I am currently in a closed-door acquisition meeting with the board. Please do not call my mobile.
We need to wire the initial escrow deposit of $148,500.00 immediately before 3 PM today.

Beneficiary: Apex Global Holdings LLC
Bank: Wells Fargo NA
Routing Number: 121000248
Account Number: 99482019482

Please confirm once the wire transfer confirmation receipt is generated.
Sarah Jenkins
Chief Financial Officer`);
    } else if (type === 'quishing') {
      setEmlContent(`Received: from mail-sender.sec-auth.eu (sec-auth.eu [194.26.29.112])
    by mx.google.com with ESMTPS id gcp_quish_02
    for <${targetUser}>; ${now}
Authentication-Results: mx.google.com;
    dkim=none;
    spf=softfail;
    dmarc=fail
Message-ID: <quish-${Date.now()}@sec-auth.eu>
From: "IT Security Helpdesk" <security-portal@sec-auth.eu>
Reply-To: support@sec-auth.eu
To: ${targetUser}
Subject: Action Required: Re-authenticate Microsoft Authenticator MFA Device
Date: ${now}
Content-Type: text/plain; charset="utf-8"

SECURITY ADVISORY:
Your 2FA mobile authenticator device registration has expired. 
To avoid account lockout, scan the attached QR code with your mobile camera immediately:

[EMBEDDED_ATTACHMENT: qr_authenticator_login.png]
QR Destination: https://microsoft-online-secure-auth.eu-west-1.id-verify.com/login?token=8x9Fk2

Do not forward this email to colleagues.`);
    } else if (type === 'pdf_invoice') {
      setEmlContent(`Received: from billing-mta.supply-vendor.cc (supply-vendor.cc [193.32.162.88])
    by mx.google.com with ESMTPS id gcp_inv_03
    for <${targetUser}>; ${now}
Authentication-Results: mx.google.com;
    dkim=fail;
    spf=fail;
    dmarc=fail
Message-ID: <invoice-${Date.now()}@supply-vendor.cc>
From: "Apex Logistics Accounts" <invoicing@supply-vendor.cc>
Reply-To: vendor-payments@proton.me
To: ${targetUser}
Subject: Updated Supplier Invoice #94821 & Remittance Routing Changes
Date: ${now}
Content-Type: text/plain; charset="utf-8"

Dear Accounts Payable Team,
Please find attached our updated monthly logistics invoice #94821 for $45,000.00 USD.
Note that our receiving banking coordinates have changed due to our bank merger.
Please remit all pending wire payments to our new account:
ABA Routing: 121000248
Account: 9948201948
Beneficiary: Apex Logistics Global`);
    } else if (type === 'payroll') {
      setEmlContent(`Received: from hr-portal.org (hr-portal.org [194.26.29.112])
    by mx.google.com with ESMTPS id gcp_test_02
    for <${targetUser}>; ${now}
Authentication-Results: mx.google.com;
    dkim=none;
    spf=softfail;
    dmarc=fail
Message-ID: <payroll-${Date.now()}@hr-portal.org>
From: "David Miller" <david.miller.payroll@gmail.com>
Reply-To: staff-change99@gmail.com
To: ${targetUser}
Subject: Direct Deposit Account Change Request for Next Pay Period
Date: ${now}
Content-Type: text/plain; charset="utf-8"

Hello,
Please update my direct deposit bank coordinates for the upcoming payroll run:
Routing Number: 122000496
Account Number: 88391029481
Bank: Digital Trust Bank
Do not send to my previous account.`);
    } else {
      setEmlContent(`Received: from mail-sor-f41.google.com (mail-sor-f41.google.com [209.85.220.41])
    by mx.google.com with ESMTPS id gcp_clean_03
    for <${targetUser}>; ${now}
Authentication-Results: mx.google.com;
    dkim=pass header.i=@cloudnet.io;
    spf=pass (google.com: domain designates 209.85.220.41 as permitted sender);
    dmarc=pass
Message-ID: <update-${Date.now()}@cloudnet.io>
From: "CloudNet Security Operations" <team@cloudnet.io>
Reply-To: team@cloudnet.io
To: ${targetUser}
Subject: Weekly System Health & Threat Stream Report
Date: ${now}
Content-Type: text/plain; charset="utf-8"

Hi Team,
All mailbox ingestion pipelines, RFC header forensic parsers, and Gemini 1.5 threat evaluation nodes are operating normally with 0 false evictions.`);
    }
  };

  const handleRun = () => {
    if (!emlContent.trim()) return;
    setIsExecuting(true);
    setTimeout(() => {
      onSimulateIngestion(emlContent);
      setIsExecuting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c0c10] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <h3 className="font-semibold text-sm text-white">
              Threat Vector Simulator &amp; EML Sandbox
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="text-xs text-zinc-400">
            Inject synthetic BEC attacks, QR Code Quishing payloads, and raw RFC 822 emails into the live detection pipeline to evaluate relay hop tracing, VIP lookalike algorithms, and Gemini semantic intent.
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('preset')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'preset'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Attack Presets</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .EML</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw Buffer</span>
            </button>
          </div>

          {/* Tab 1: Attack Presets */}
          {activeTab === 'preset' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => loadPreset('vip_ceo')}
                className="p-3 rounded-xl border border-white/10 bg-zinc-900/50 hover:border-red-500/40 text-left transition-all group"
              >
                <div className="text-red-400 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> VIP CFO Spoof
                </div>
                <div className="text-[11px] text-zinc-400">Homoglyph domain ($148k wire demand)</div>
              </button>

              <button
                onClick={() => loadPreset('quishing')}
                className="p-3 rounded-xl border border-white/10 bg-zinc-900/50 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> QR Quishing MFA
                </div>
                <div className="text-[11px] text-zinc-400">Embedded 2FA device phishing link</div>
              </button>

              <button
                onClick={() => loadPreset('pdf_invoice')}
                className="p-3 rounded-xl border border-white/10 bg-zinc-900/50 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Supplier PDF Invoice
                </div>
                <div className="text-[11px] text-zinc-400">Bank routing coordinate change</div>
              </button>

              <button
                onClick={() => loadPreset('payroll')}
                className="p-3 rounded-xl border border-white/10 bg-zinc-900/50 hover:border-yellow-500/40 text-left transition-all group"
              >
                <div className="text-yellow-400 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Payroll Deposit
                </div>
                <div className="text-[11px] text-zinc-400">Direct deposit account swap</div>
              </button>

              <button
                onClick={() => loadPreset('clean')}
                className="p-3 rounded-xl border border-white/10 bg-zinc-900/50 hover:border-blue-500/50 text-left transition-all group sm:col-span-2"
              >
                <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Clean Pass
                </div>
                <div className="text-[11px] text-zinc-400">Passing SPF, DKIM, and DMARC aligned signatures</div>
              </button>
            </div>
          )}

          {/* Tab 2: Upload */}
          {activeTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-white/25 rounded-xl p-6 text-center cursor-pointer bg-zinc-900/30 transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".eml,.txt,.msg"
                className="hidden"
              />
              <Upload className="w-7 h-7 text-zinc-400" />
              <div className="text-xs text-zinc-300">
                {uploadedFileName ? (
                  <span className="text-blue-400 font-medium">Loaded: {uploadedFileName}</span>
                ) : (
                  <span>Drag &amp; Drop <strong className="text-white">.EML</strong> file or click to browse</span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Standard RFC 822 MIME format</span>
            </div>
          )}


          {/* Textarea for EML Content */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>RFC 822 Payload Buffer:</span>
              <span className="text-[10px] text-zinc-500">{emlContent.length} bytes</span>
            </div>
            <textarea
              value={emlContent}
              onChange={e => setEmlContent(e.target.value)}
              placeholder="Paste raw RFC 822 email text here..."
              rows={7}
              className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-all resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleRun}
            disabled={!emlContent.trim() || isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs shadow-sm hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Evaluating Pipeline...' : 'Inject & Evaluate'}</span>
          </button>
        </div>
      </div>
    </div>
  );

};
