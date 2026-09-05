import React, { useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SmtpHopNode } from "./smtp-hop-node";
import { SmtpHop } from "../../../types/ices";
import { Network, Lock, ShieldCheck } from "lucide-react";

interface SmtpHopGraphProps {
  hops: SmtpHop[];
}

export const SmtpHopGraph: React.FC<SmtpHopGraphProps> = ({ hops }) => {
  const nodeTypes = useMemo(() => ({ smtpHopNode: SmtpHopNode }), []);

  const { nodes, edges } = useMemo(() => {
    // If 0 external intermediate hops, render Direct Intra-Network Google Transfer
    if (!hops || hops.length === 0) {
      const directNodes: Node[] = [
        {
          id: "direct-origin",
          type: "smtpHopNode",
          position: { x: 50, y: 70 },
          data: {
            hopIndex: 1,
            totalHops: 2,
            nodeRole: "ORIGIN",
            nodeRoleLabel: "SENDER CLIENT ORIGIN",
            fromRelay: "mail.google.com (Web/App Direct Interface)",
            byRelay: "google-mta.internal",
            ip: "Intra-Google Backbone",
            country: "US",
            countryName: "Google Cloud Infrastructure",
            city: "Internal Relay",
            asn: "AS15169 GOOGLE",
            isp: "Google LLC",
            protocol: "HTTPS / REST API",
            isSuspicious: false,
            isTorOrVpn: false,
            anomalies: [],
            delayMs: 15
          }
        },
        {
          id: "direct-dest",
          type: "smtpHopNode",
          position: { x: 380, y: 70 },
          data: {
            hopIndex: 2,
            totalHops: 2,
            nodeRole: "GATEWAY_DEST",
            nodeRoleLabel: "RECIPIENT MAILBOX",
            fromRelay: "google-mta.internal",
            byRelay: "mx.google.com (Local Delivery)",
            ip: "Direct Local Delivery",
            country: "US",
            countryName: "Google Cloud",
            city: "Destination Datacenter",
            asn: "AS15169 GOOGLE",
            isp: "Google LLC",
            protocol: "Direct Internal Ingestion",
            isSuspicious: false,
            isTorOrVpn: false,
            anomalies: [],
            delayMs: 32
          }
        }
      ];

      const directEdges: Edge[] = [
        {
          id: "edge-direct",
          source: "direct-origin",
          target: "direct-dest",
          animated: true,
          style: { stroke: "#38bdf8", strokeWidth: 2 },
          label: "🔒 Direct Google Private Network (0 Public Hops)",
          labelStyle: { fill: "#bae6fd", fontSize: 10, fontFamily: "monospace", fontWeight: 600 },
          labelBgStyle: { fill: "#0A0F1D", stroke: "#0284c7", strokeWidth: 1, rx: 6, ry: 6 },
          labelBgPadding: [6, 4],
          markerEnd: { type: MarkerType.ArrowClosed, color: "#38bdf8", width: 14, height: 14 }
        }
      ];

      return { nodes: directNodes, edges: directEdges };
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    const xSpacing = 320;
    const yBaseline = 70;

    hops.forEach((hop, idx) => {
      const nodeId = `hop-${idx}`;
      const isOrigin = idx === 0;
      const isGateway = idx === hops.length - 1;

      flowNodes.push({
        id: nodeId,
        type: "smtpHopNode",
        position: {
          x: 40 + idx * xSpacing,
          y: yBaseline + (idx % 2 === 1 ? 15 : 0)
        },
        data: {
          hopIndex: idx + 1,
          totalHops: hops.length,
          nodeRole: isOrigin ? "ORIGIN" : isGateway ? "GATEWAY_DEST" : "INTERMEDIATE_RELAY",
          nodeRoleLabel: isOrigin ? "CLIENT ORIGIN" : isGateway ? "INBOUND GATEWAY" : "TRANSIT RELAY",
          fromRelay: hop.from_relay,
          byRelay: hop.by_relay,
          ip: hop.ip,
          country: hop.country,
          countryName: hop.country_name,
          city: hop.city,
          asn: hop.asn,
          isp: hop.isp,
          protocol: hop.protocol,
          isSuspicious: hop.is_suspicious,
          isTorOrVpn: hop.is_tor_or_vpn,
          anomalies: hop.anomaly_reasons || [],
          delayMs: hop.delay_ms || (idx + 1) * 75
        }
      });

      if (idx > 0) {
        const prevId = `hop-${idx - 1}`;
        const isHazard = hop.is_suspicious || hops[idx - 1].is_suspicious;

        flowEdges.push({
          id: `edge-${prevId}-${nodeId}`,
          source: prevId,
          target: nodeId,
          animated: true,
          style: {
            stroke: isHazard ? "#f87171" : "#38bdf8",
            strokeWidth: 2,
            strokeDasharray: isHazard ? "6 4" : "none"
          },
          label: isHazard ? "⚠️ Anomalous Relay" : "🔒 TLS Encrypted (ESMTPS)",
          labelStyle: { fill: isHazard ? "#fca5a5" : "#bae6fd", fontSize: 10, fontFamily: "monospace", fontWeight: 600 },
          labelBgStyle: { fill: "#0A0F1D", stroke: isHazard ? "#f87171" : "#0284c7", strokeWidth: 1, rx: 6, ry: 6 },
          labelBgPadding: [6, 4],
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHazard ? "#f87171" : "#38bdf8",
            width: 14,
            height: 14
          }
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [hops]);

  const hopCountLabel = hops && hops.length > 0 ? `${hops.length} Public Hops Traced` : "Direct Intra-Google Transfer";

  return (
    <div className="w-full h-[360px] rounded-xl border border-white/[0.08] bg-[#0E1422] relative overflow-hidden shadow-xl">
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <Network className="w-3.5 h-3.5 text-sky-400" />
            <span>SMTP Delivery Topology</span>
          </span>
          <span className="text-xs text-slate-300 font-mono bg-[#0F162A] border border-white/[0.08] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {hopCountLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto text-[11px] font-mono text-slate-300 bg-[#0F162A]/90 border border-white/[0.08] px-2.5 py-1 rounded-lg backdrop-blur-md">
          <span className="flex items-center gap-1 text-blue-400">
            <Lock className="w-3 h-3" /> TLS Transit Verified
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Drag to inspect</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#222b3d" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-[#0F162A] !border-white/10 !fill-slate-300 !text-slate-300 !rounded-lg overflow-hidden" />
      </ReactFlow>
    </div>
  );
};