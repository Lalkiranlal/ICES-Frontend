import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScoreColor(score: number): { text: string; bg: string; border: string; label: string } {
  if (score >= 80) {
    return {
      text: 'text-red-400',
      bg: 'bg-red-950/30',
      border: 'border-red-500/30',
      label: 'CRITICAL'
    };
  }
  if (score >= 50) {
    return {
      text: 'text-blue-400',
      bg: 'bg-amber-950/30',
      border: 'border-blue-500/40',
      label: 'HIGH'
    };
  }
  if (score >= 20) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-950/30',
      border: 'border-yellow-500/20',
      label: 'MEDIUM'
    };
  }
  return {
    text: 'text-zinc-400',
    bg: 'bg-zinc-900/80',
    border: 'border-white/[0.08]',
    label: 'CLEAN'
  };
}


export function humanizeThreatCategory(category: string): string {
  if (!category) return 'Clean';
  switch (category.toUpperCase()) {
    case 'BEC_EXECUTIVE_IMPERSONATION':
      return 'VIP Impersonation';
    case 'BEC_PAYROLL_DIVERSION':
      return 'Payroll Diversion';
    case 'BEC_SUPPLIER_INVOICE_FRAUD':
      return 'Invoice Fraud';
    case 'CREDENTIAL_HARVESTING':
      return 'Credential Harvester';
    case 'QR_CODE_PHISHING':
      return 'QR Quishing';
    case 'MALICIOUS_ATTACHMENT':
      return 'Malicious File';
    case 'EXTORTION_RANSOM':
      return 'Extortion';
    case 'SUSPICIOUS_ANOMALY':
      return 'Suspicious Pattern';
    case 'EMPLOYEE_REPORTED_PHISH':
      return 'Employee Reported';
    case 'CLEAN':
      return 'Authenticated';
    default:
      return category.replace(/^BEC_/, '').replace(/_/g, ' ');
  }
}

export function humanizeRemediationStatus(status: string): string {
  if (!status) return 'Delivered';
  switch (status.toUpperCase()) {
    case 'AUTO_QUARANTINED':
      return 'Quarantined';
    case 'MANUAL_QUARANTINED':
      return 'Quarantined (Manual)';
    case 'CLUSTER_PURGED':
      return 'Campaign Purged';
    case 'AUTO_TAGGED_SUSPICIOUS':
      return 'Tagged Suspicious';
    case 'RELEASED_FALSE_POSITIVE':
      return 'Released';
    case 'ALLOWLISTED':
      return 'Allowlisted';
    case 'PENDING_ANALYSIS':
      return 'Analyzing';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function formatAuthBadge(status: string): { text: string; bg: string; border: string; dot: string } {
  switch (status?.toUpperCase()) {
    case 'PASS':
      return { text: 'text-zinc-300', bg: 'bg-zinc-900', border: 'border-white/[0.08]', dot: 'bg-blue-600' };
    case 'FAIL':
      return { text: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-500/30', dot: 'bg-red-400' };
    case 'SOFTFAIL':
    case 'NEUTRAL':
      return { text: 'text-blue-400', bg: 'bg-amber-950/30', border: 'border-blue-500/40', dot: 'bg-blue-600' };
    default:
      return { text: 'text-zinc-500', bg: 'bg-zinc-900/60', border: 'border-white/[0.04]', dot: 'bg-zinc-600' };
  }
}

