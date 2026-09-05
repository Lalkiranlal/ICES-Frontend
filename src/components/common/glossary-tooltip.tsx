import React, { useState } from "react";

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

const GLOSSARY_DEFINITIONS: Record<string, { title: string; category: string; whatItIs: string; whatItDoes: string; realWorldImpact: string }> = {
  "SPF": {
    title: "SPF (Sender Policy Framework)",
    category: "RFC-7208 CRYPTOGRAPHIC AUTH",
    whatItIs: "A DNS-based protocol that authorizes specific IP addresses to send emails on behalf of a domain name.",
    whatItDoes: "Validates whether the receiving mail server IP matches the published DNS whitelist for the sender envelope domain.",
    realWorldImpact: "Prevents basic spoofing where attackers pretend to send mail from domains they do not own."
  },
  "DKIM": {
    title: "DKIM (DomainKeys Identified Mail)",
    category: "RFC-6376 CRYPTOGRAPHIC SIGNATURE",
    whatItIs: "An asymmetric cryptographic signature (RSA-2048 / Ed25519) embedded directly into MIME email headers.",
    whatItDoes: "Ensures the email body and critical headers were not tampered with, intercepted, or modified in transit.",
    realWorldImpact: "Protects against Man-in-the-Middle (MitM) alterations and email forgery."
  },
  "DMARC": {
    title: "DMARC (Domain-based Message Authentication)",
    category: "RFC-7489 POLICY ENFORCEMENT",
    whatItIs: "A policy layer that dictates what mail servers should do when SPF or DKIM checks fail (None, Quarantine, Reject).",
    whatItDoes: "Aligns the visible From address with authenticated SPF/DKIM domains and provides telemetry feedback loops.",
    realWorldImpact: "Stops domain impersonation attacks from reaching employee inboxes."
  },
  "BEC": {
    title: "Business Email Compromise (BEC)",
    category: "SOCIAL ENGINEERING & FRAUD",
    whatItIs: "A sophisticated cyberattack where bad actors impersonate executives, vendors, or colleagues to steal funds or credentials.",
    whatItDoes: "Uses display-name spoofing, lookalike domains, and urgent wire transfer requests without malware payloads.",
    realWorldImpact: "Accounts for over $55 billion in global corporate financial losses (FBI IC3 Report)."
  },
  "QUARANTINED": {
    title: "Autonomous Mailbox Quarantine",
    category: "ZERO-TRUST ENFORCEMENT",
    whatItIs: "An automated security policy that isolates high-confidence threats from the user inbox instantly.",
    whatItDoes: "Attaches a dynamic [SUSPICIOUS] label tag and moves the payload out of employee visibility.",
    realWorldImpact: "Prevents accidental credential submission and wire transfer execution."
  },
  "RELAY_HOPS": {
    title: "SMTP Relay Traversal Chain",
    category: "MIME TRANSPORT TELEMETRY",
    whatItIs: "The exact sequence of Mail Transfer Agents (MTAs) and IP relays an email passed through from origin to destination.",
    whatItDoes: "Extracts geographic coordinates, ASNs, and Tor exit nodes from raw Received headers.",
    realWorldImpact: "Reveals the true physical and network origin of an email regardless of forged sender headers."
  },
  "AI_TOKENS": {
    title: "Gemini 3.5 Flash Reasoning Compute",
    category: "LLM THREAT DECOMPOSITION",
    whatItIs: "Real-time prompt and candidate token ledger tracking Google Gemini compute usage for zero-shot intent reasoning.",
    whatItDoes: "Evaluates executive impersonation, payment diversion, and urgency heuristics with sub-second inference.",
    realWorldImpact: "Delivers deep semantic threat explanation at fractions of a cent per email."
  },
  "MTTR": {
    title: "Mean Time to Remediation (MTTR)",
    category: "SOC KPI & VELOCITY",
    whatItIs: "The total duration required to ingest, analyze, decompose, and apply containment actions to an incoming message.",
    whatItDoes: "CloudNet ICES executes full multi-layer analysis and mailbox containment in under 0.50 seconds.",
    realWorldImpact: "Neutralizes threats before the human recipient has opened their email client."
  }
};

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const definition = GLOSSARY_DEFINITIONS[term];

  if (!definition) {
    return <span>{children}</span>;
  }

  return (
    <span
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="border-b border-dotted border-slate-500 hover:border-blue-400 hover:text-blue-300 transition-colors">
        {children}
      </span>

      {isOpen && (
        <span 
          className="absolute top-full left-0 mt-2 w-80 p-4 rounded-xl bg-[#0E1524] border border-blue-500/30 text-left shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-150 block"
        >
          {/* Header Row: Clean Dot + Category (Screenshot 2 Style) */}
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider pb-2 border-b border-white/[0.08] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>{definition.category}</span>
          </span>

          <span className="text-sm font-semibold text-white font-sans tracking-tight mb-1.5 block">
            {definition.title}
          </span>

          <span className="space-y-1.5 text-xs text-slate-300 font-sans block leading-relaxed">
            <span className="block text-slate-200">
              <strong className="text-blue-400 font-medium">Definition:</strong> {definition.whatItIs}
            </span>
            <span className="block text-slate-300 pt-0.5">
              <strong className="text-white font-medium">Impact:</strong> {definition.realWorldImpact}
            </span>
          </span>
        </span>
      )}
    </span>
  );
};