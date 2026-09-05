import React, { useState } from "react";
import { 
  Info, 
  Layers, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Sparkles, 
  Lock, 
  Share2, 
  Server, 
  Mail, 
  FileCode,
  Network
} from "lucide-react";

export const StudyGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lifecycle" | "integrations" | "ip_hopping" | "gemini_ai" | "kid_mode">("lifecycle");

  return (
    <div className="space-y-6 text-zinc-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-black border border-blue-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[10px] font-mono uppercase font-bold">
                Platform Architecture &amp; Deep Technical Guide
              </span>
              <span className="text-zinc-500 text-xs font-mono">CloudNet ICES Zero-Trust Engineering</span>
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-white mt-2">
              How CloudNet ICES Works: Step-by-Step Architecture 🛡️
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Explore the exact technical engineering behind mailbox integrations, email lifecycle pipelines, Smtp relay IP hopping, and Gemini 3.6 Flash zero-shot intelligence.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap md:flex-col gap-1.5 shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab("lifecycle")}
              className={"px-3.5 py-2 rounded-lg font-semibold text-left transition-all flex items-center gap-2 " + (
                activeTab === "lifecycle" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              )}
            >
              <Mail className="w-3.5 h-3.5 text-blue-300" />
              <span>1. Email Inbound Lifecycle</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={"px-3.5 py-2 rounded-lg font-semibold text-left transition-all flex items-center gap-2 " + (
                activeTab === "integrations" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              )}
            >
              <Server className="w-3.5 h-3.5 text-blue-300" />
              <span>2. Cloud Mailbox Integration</span>
            </button>

            <button
              onClick={() => setActiveTab("ip_hopping")}
              className={"px-3.5 py-2 rounded-lg font-semibold text-left transition-all flex items-center gap-2 " + (
                activeTab === "ip_hopping" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              )}
            >
              <Network className="w-3.5 h-3.5 text-blue-300" />
              <span>3. IP Hopping &amp; UI Graph</span>
            </button>

            <button
              onClick={() => setActiveTab("gemini_ai")}
              className={"px-3.5 py-2 rounded-lg font-semibold text-left transition-all flex items-center gap-2 " + (
                activeTab === "gemini_ai" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              )}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-300" />
              <span>4. Gemini AI Utilization</span>
            </button>

            <button
              onClick={() => setActiveTab("kid_mode")}
              className={"px-3.5 py-2 rounded-lg font-semibold text-left transition-all flex items-center gap-2 " + (
                activeTab === "kid_mode" ? "bg-purple-600 text-white shadow-lg" : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>5. Kid &amp; Beginner Mode 🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EMAIL INBOUND LIFECYCLE (STEP-BY-STEP) */}
      {activeTab === "lifecycle" && (
        <div className="space-y-4 font-sans">
          <div className="p-5 rounded-xl bg-[#090b10] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-300">
              Inbound Email Execution Flow (From Wire to Tagging in 0.35s)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
              
              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-blue-400 font-bold mb-1">STEP 01</div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">MIME Ingestion</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    FastAPI receives raw RFC-822 email payload via Gmail REST API / PubSub webhook.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-zinc-500 border-t border-white/5 pt-1">
                  parser.py &rarr; Multi-Part Tree
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-blue-400 font-bold mb-1">STEP 02</div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">RFC Verification</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Checks SPF sender IP whitelist, DKIM RSA cryptographic signature, and DMARC alignment.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-zinc-500 border-t border-white/5 pt-1">
                  Authentication-Results Header
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-blue-400 font-bold mb-1">STEP 03</div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">Deep Forensics</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Optical QR Code decoding, inline base64 image OCR, and Smtp multi-hop relay trace.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-zinc-500 border-t border-white/5 pt-1">
                  attachment_scanner.py
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-blue-400 font-bold mb-1">STEP 04</div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">Gemini 3.6 Flash</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Zero-shot intent classification, wire entity extraction, and composite scoring (0-100).
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-zinc-500 border-t border-white/5 pt-1">
                  gemini_nlp.py + scoring.py
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 rounded-lg bg-black/50 border border-red-500/30 flex flex-col justify-between bg-red-950/[0.06]">
                <div>
                  <div className="text-[10px] text-red-400 font-bold mb-1">STEP 05</div>
                  <h4 className="font-bold text-white text-xs mb-1 font-sans">Live Remediation</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    If Threat &ge; 80, calls Gmail API to attach [SUSPICIOUS] label tag and inject warning banner.
                  </p>
                </div>
                <div className="mt-2 text-[9px] text-red-400/80 border-t border-white/5 pt-1">
                  actions.py &rarr; Live Mailbox
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUD INTEGRATIONS (STEP-BY-STEP) */}
      {activeTab === "integrations" && (
        <div className="space-y-4 font-sans">
          <div className="p-5 rounded-xl bg-[#090b10] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-300">
              How Google Workspace &amp; Microsoft 365 Integrations Connect
            </h3>

            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <span>1. Google OAuth2 Authorization &amp; Scopes</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  During initial onboarding, the admin grants ICES OAuth2 access with least-privilege non-destructive scopes:
                  <code className="text-blue-300 block my-1 font-mono text-[11px]">https://www.googleapis.com/auth/gmail.modify · https://www.googleapis.com/auth/gmail.labels</code>
                  This allows ICES to read email headers, inspect raw RFC bytes, and create/modify label tags without deleting or permanently altering user mail.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <span>2. Token Vaulting in Neon Serverless PostgreSQL</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  When Google returns the authorization code, the backend exchanges it for an <code className="text-zinc-200">access_token</code> and <code className="text-zinc-200">refresh_token</code>, storing them securely in the <code className="text-zinc-200">monitored_users</code> table with automatic Google credential refresh lifecycle handling.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <span>3. Real-Time Ingestion &amp; Push Webhooks</span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  ICES supports dual-mode ingestion:
                  <strong className="text-white block mt-1 font-sans">A) Cloud Pub/Sub Webhooks:</strong> Google Cloud pushes a push notification on every incoming email message event.
                  <strong className="text-white block mt-1 font-sans">B) Fast Asynchronous Polling:</strong> The backend checks mailbox streams with sub-50ms cache-first Stale-While-Revalidate responses.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IP HOPPING, RELAY TRACING & UI GRAPH */}
      {activeTab === "ip_hopping" && (
        <div className="space-y-4 font-sans">
          <div className="p-5 rounded-xl bg-[#090b10] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-300">
              Smtp Relay Traversal, IP Verification &amp; ReactFlow Graph Rendering
            </h3>

            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">1. Reverse Header Traversal</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  When an email travels across the internet, every mail server stamps a <code className="text-zinc-200">Received: from ... by ... with ...</code> header at the top of the envelope. ICES parses these headers in <strong>reverse chronological order</strong> back to the originating client IP (Hop 1).
                </p>
                <div className="p-2.5 rounded bg-black/80 text-[10px] text-zinc-400 font-mono">
                  Received: from mail.attacker-vps.net ([198.51.100.24]) by mx.google.com with ESMTPS ...
                </div>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">2. MaxMind GeoIP2 &amp; ASN Telemetry Lookup</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  For every relay hop IP, ICES performs an in-memory MaxMind GeoIP2 lookup, resolving:
                  <br />• <strong>Geographic Origin:</strong> City, Country, Latitude/Longitude coordinates.
                  <br />• <strong>Network Autonomous System:</strong> ASN number, ISP organization (e.g. DigitalOcean, OVH, Tor Exit Relay).
                  <br />• <strong>Relay Latency:</strong> Delta time elapsed between each intermediate hop (ms).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">3. Interactive UI Node-Graph Rendering (@xyflow/react)</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  The frontend takes the parsed <code className="text-zinc-200">smtp_hops[]</code> array and transforms each hop into visual ReactFlow nodes and curved connection edges in the SOC Workbench, showing the exact geographic flight path of the email with interactive hop inspection.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HOW GEMINI AI IS UTILIZED */}
      {activeTab === "gemini_ai" && (
        <div className="space-y-4 font-sans">
          <div className="p-5 rounded-xl bg-[#090b10] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-300">
              Google Gemini 3.6 Flash: Prompt Engineering, Schema &amp; Token Economics
            </h3>

            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-300 font-bold block">1. Strict JSON Schema &amp; Prompt Instruction</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  ICES feeds Gemini 3.6 Flash with complete metadata (Display Name, RFC from, Reply-To, SPF/DKIM/DMARC status, VIP baseline, attachment OCR text) and enforces pure JSON response output with strict fields:
                </p>
                <pre className="p-2.5 rounded bg-black/80 text-[10px] text-purple-200 overflow-x-auto">
{`{
  "is_threat": true,
  "threat_category": "BEC_EXECUTIVE_IMPERSONATION",
  "confidence_score": 0.96,
  "urgency_score": 90,
  "executive_summary": "High-risk CEO wire fraud demand to external routing coordinates.",
  "financial_analysis": { "requested_amount_usd": 50000, "routing_number": "121000248" }
}`}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">2. Concurrency Semaphore &amp; 429 Backoff</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  To prevent rate limiting, outbound calls are queued through an <code className="text-zinc-200">asyncio.Semaphore(1)</code> with automatic 1.5s exponential backoff retry on HTTP <code className="text-blue-400">429</code>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">3. Live Token Accounting &amp; Cost Estimation</span>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  Every response metadata usage (<code className="text-zinc-200">promptTokenCount</code> + <code className="text-zinc-200">candidatesTokenCount</code>) is aggregated in real time and displayed in the SOC telemetry ribbon with exact dollar cost calculation (<code className="text-zinc-200">$0.15 per 1M tokens</code>).
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KID & BEGINNER STORY MODE */}
      {activeTab === "kid_mode" && (
        <div className="space-y-4 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-400 text-lg">
                  🎭
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">1. The Fake King &amp; Wax Seals (BEC Spoofing)</h3>
                  <span className="text-[11px] font-mono text-zinc-400">Display Name Spoofing Explained</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Imagine an impostor dressing up as the King, writing a letter that says <em>"Quick! Give all the gold to my friend!"</em>.
              </p>
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] text-zinc-400 space-y-1 font-mono">
                <p>🛡️ <strong>How CloudNet Catches It:</strong> Kings stamp their wax seal (<strong className="text-blue-400">DKIM &amp; SPF</strong>) on letters. CloudNet checks the cryptographic signature to verify if the real King sent it or a sneaky impostor!</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-400 text-lg">
                  🚪
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">2. The Secret Trick Door (QR Code Quishing)</h3>
                  <span className="text-[11px] font-mono text-zinc-400">Optical Decoding Explained</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bad guys hide dangerous secret trap doors inside black-and-white puzzle pictures (QR codes) because normal filters only read text!
              </p>
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] text-zinc-400 space-y-1 font-mono">
                <p>👁️ <strong>How CloudNet Catches It:</strong> CloudNet has optical vision eyes that decode the QR puzzle and test the hidden website before you scan it on your phone.</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};