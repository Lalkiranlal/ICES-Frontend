
export interface TokenUsage {
  prompt_tokens: number;
  candidate_tokens: number;
  total_tokens: number;
  model: string;
}

export interface TokenTelemetry {
  active_model: string;
  total_tokens_consumed: number;
  prompt_tokens: number;
  candidate_tokens: number;
  total_ai_calls: number;
  avg_tokens_per_email: number;
  estimated_cost_usd: number;
  status: string;
}

export type ThreatCategory =
  | 'BEC_EXECUTIVE_IMPERSONATION'
  | 'BEC_PAYROLL_DIVERSION'
  | 'BEC_SUPPLIER_INVOICE_FRAUD'
  | 'CREDENTIAL_HARVESTING'
  | 'MALICIOUS_ATTACHMENT'
  | 'QR_CODE_PHISHING'
  | 'EXTORTION_RANSOM'
  | 'SUSPICIOUS_ANOMALY'
  | 'CLEAN';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type RemediationStatus =
  | 'PENDING_ANALYSIS'
  | 'AUTO_QUARANTINED'
  | 'AUTO_TAGGED_SUSPICIOUS'
  | 'MANUAL_QUARANTINED'
  | 'RELEASED_FALSE_POSITIVE'
  | 'PERMANENTLY_DELETED'
  | 'CLUSTER_PURGED'
  | 'ALLOWLISTED';

export type AuthResultStatus = 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE' | 'PERMERROR';

export interface SmtpHop {
  hop_index: number;
  from_relay: string;
  by_relay: string;
  protocol: string;
  ip: string;
  is_originating: boolean;
  country: string;
  country_name: string;
  city: string;
  asn: string;
  isp: string;
  is_tor_or_vpn: boolean;
  is_suspicious: boolean;
  anomaly_reasons: string[];
  delay_ms: number;
}

export interface VipAnalysis {
  is_impersonation_threat: boolean;
  display_name_spoofing: boolean;
  lookalike_domain_detected: boolean;
  spoofing_technique: string;
  impersonated_vip?: {
    name: string;
    title: string;
    official_email: string;
  } | null;
  lookalike_details?: {
    sender_domain: string;
    target_domain: string;
    similarity_score: number;
    homoglyph_detected: boolean;
    technique: string;
  } | null;
  recommendation_risk_score?: number;
}

export interface AttachmentItem {
  filename: string;
  content_type: string;
  size_bytes: number;
  is_image: boolean;
  is_pdf: boolean;
  is_qr_code: boolean;
  decoded_qr_url?: string | null;
  ocr_text_snippet?: string | null;
  financial_detected: boolean;
  risk_flags: string[];
}

export interface AttachmentForensics {
  total_attachments: number;
  scanned_items: AttachmentItem[];
  is_quishing_detected: boolean;
  is_malicious_attachment: boolean;
  extracted_qr_urls: string[];
  extracted_financial_entities: {
    routing_number?: string;
    account_number?: string;
    amount?: string;
  };
  combined_ocr_text?: string | null;
}

export interface WarningBanner {
  banner_type: 'CRITICAL_RED' | 'CAUTION_YELLOW' | 'VERIFIED_GREEN';
  title: string;
  body_message: string;
  badge_text: string;
  accent_color: string;
  html_markup: string;
}

export interface ClusterPurgeMetrics {
  total_mailboxes_scanned: number;
  purged_messages_count: number;
  affected_mailboxes: string[];
  execution_duration_ms: number;
  policy_action: string;
}

export interface ClusterPurgeResponse {
  status: string;
  action: string;
  criteria: {
    subject_pattern?: string;
    sender_domain?: string;
    threat_cluster_id?: string;
  };
  metrics: ClusterPurgeMetrics;
  analyst_id: string;
  timestamp: number;
}

export interface GeminiNLPEval {
  bec_subtype: string;
  confidence_score: number;
  urgency_score: number;
  financial_request_detected: boolean;
  requested_amount_usd?: number | null;
  impersonated_executive?: string | null;
  executive_summary: string;
  linguistic_cues: string[];
  deception_techniques: string[];
  extracted_bank_entities?: {
    beneficiary?: string;
    bank_name?: string;
    iban?: string;
    routing_number?: string;
    account_number?: string;
  };
}

export interface ForensicLog {
  id: string;
  alert_id: string;
  originating_ip: string;
  originating_country: string;
  originating_country_name: string;
  originating_city: string;
  originating_asn: string;
  originating_isp: string;
  is_tor_or_vpn: boolean;
  reply_to_mismatch: boolean;
  display_name_spoofing: boolean;
  lookalike_domain_detected?: boolean;
  smtp_hops: SmtpHop[];
  raw_authentication_results?: string;
  raw_received_headers?: string[];
  raw_eml_snippet?: string;
}

export interface SenderBehavioralBaseline {
  sender_email: string;
  sender_domain?: string;
  is_new_sender: boolean;
  total_emails_count: number;
  avg_threat_score: number;
  is_allowlisted: boolean;
  is_blocklisted: boolean;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  vip_impersonation_attempts?: number;
}

export interface EmailAlert {
  id: string;
  provider_message_id: string;
  rfc822_message_id?: string;
  sender_envelope: string;
  sender_header_from: string;
  sender_display_name: string;
  reply_to: string;
  recipient_to: string[];
  recipient_cc?: string[];
  subject: string;
  received_timestamp: string;
  threat_score: number; // 0 - 100
  threat_category: ThreatCategory;
  severity: ThreatSeverity;
  spf_status: AuthResultStatus;
  dkim_status: AuthResultStatus;
  dmarc_status: AuthResultStatus;
  remediation_status: RemediationStatus;
  applied_labels: string[];
  vip_analysis?: VipAnalysis;
  attachment_forensics?: AttachmentForensics;
  warning_banner?: WarningBanner;
  sender_behavioral_baseline?: SenderBehavioralBaseline;
  forensic_logs?: ForensicLog[];
  nlp_evaluations?: GeminiNLPEval[];
  token_usage?: TokenUsage;
}


