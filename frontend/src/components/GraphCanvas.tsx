"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  Handle,
  Position,
  NodeProps
} from "@xyflow/react";
import { 
  Database, 
  GitCommit, 
  FileCode2, 
  AlertTriangle, 
  User, 
  Layers, 
  Info,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { GraphData, GraphNode, api } from "@/lib/api";

// Custom Node Renderer with Black & Charcoal Architecture Styling
function CustomGraphNode({ data, selected }: NodeProps) {
  const nodeType = data.type as string;

  const getBadgeStyle = () => {
    switch (nodeType) {
      case "Project":
        return { bg: "bg-[#09090B]", border: "border-blue-500/60", text: "text-blue-400", icon: Database };
      case "TeamMember":
        return { bg: "bg-[#09090B]", border: "border-emerald-500/60", text: "text-emerald-400", icon: User };
      case "Handoff":
        return { bg: "bg-[#09090B]", border: "border-purple-500/60", text: "text-purple-400", icon: GitCommit };
      case "Decision":
        return { bg: "bg-[#09090B]", border: "border-amber-500/60", text: "text-amber-400", icon: CheckCircle2 };
      case "APIContract":
        return { bg: "bg-[#09090B]", border: "border-cyan-500/60", text: "text-cyan-400", icon: FileCode2 };
      case "Module":
        return { bg: "bg-[#09090B]", border: "border-stone-600", text: "text-stone-300", icon: Layers };
      case "Conflict":
        return { bg: "bg-red-950/60", border: "border-red-500", text: "text-red-400", icon: AlertTriangle };
      default:
        return { bg: "bg-[#09090B]", border: "border-[#27272F]", text: "text-[#A1A1AA]", icon: Info };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <div
      className={`relative min-w-[200px] max-w-[250px] rounded-xl px-3.5 py-3 transition-all shadow-xl ${
        style.bg
      } ${style.border} border ${
        selected ? "ring-2 ring-white scale-105" : "hover:border-white/50"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#52525B] !w-2 !h-2" />
      
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${style.text}`} />
        <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${style.text}`}>
          {nodeType}
        </span>
        {Boolean(data.status) && (
          <span className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-black/60 text-[#A1A1AA] border border-[#27272F]">
            {String(data.status)}
          </span>
        )}
      </div>

      <div className="text-xs font-semibold text-white truncate" title={String(data.label || "")}>
        {String(data.label || "")}
      </div>

      {Boolean(data.subtitle) && (
        <div className="text-[10px] text-[#A1A1AA] truncate mt-0.5 font-mono">
          {String(data.subtitle)}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-[#52525B] !w-2 !h-2" />
    </div>
  );
}

export default function GraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");

  const nodeTypes = useMemo(() => ({ custom: CustomGraphNode }), []);

  const loadGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: GraphData = await api.getGraph();
      const formattedNodes = data.nodes.map((n) => ({
        ...n,
        type: "custom",
      }));
      setNodes(formattedNodes as any);
      setEdges(data.edges as any);
    } catch (err: any) {
      console.error("Failed to load graph:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadGraph();
    const handleRefresh = () => loadGraph();
    window.addEventListener("stayqen:refresh", handleRefresh);
    return () => window.removeEventListener("stayqen:refresh", handleRefresh);
  }, [loadGraph]);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const filteredNodes = useMemo(() => {
    if (filterType === "ALL") return nodes;
    return nodes.filter((n: any) => n.data?.type === filterType);
  }, [nodes, filterType]);

  return (
    <div className="relative w-full h-[650px] lg:h-[760px] rounded-2xl border border-[#27272F] bg-[#000000] overflow-hidden flex flex-col shadow-2xl">
      {/* Control Toolbar */}
      <div className="p-3 bg-[#09090B] border-b border-[#27272F] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
            Filter View:
          </span>
          {["ALL", "Handoff", "APIContract", "Decision", "Module", "Conflict"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                filterType === type
                  ? "bg-[#15151B] text-white border border-[#3F3F46]"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#111116]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGraph}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#000000] hover:bg-[#15151B] border border-[#27272F] text-xs text-[#A1A1AA] hover:text-white font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload Graph</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Drawer */}
      <div className="relative flex-1 w-full h-full bg-[#000000]">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#181820" gap={24} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node: any) => {
              switch (node.data?.type) {
                case "Conflict":
                  return "#EF4444";
                case "APIContract":
                  return "#06B6D4";
                case "Decision":
                  return "#F59E0B";
                case "Handoff":
                  return "#A855F7";
                default:
                  return "#3B82F6";
              }
            }}
            maskColor="rgba(0, 0, 0, 0.85)"
            style={{ background: "#09090B", borderRadius: 8, border: "1px solid #27272F" }}
          />
        </ReactFlow>

        {/* Node Inspection Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 md:w-96 max-h-[90%] bg-[#09090B]/95 backdrop-blur-md border border-[#27272F] rounded-xl p-4 shadow-2xl z-20 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272F]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Node Properties
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {selectedNode.data.label}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#A1A1AA] hover:text-white text-xs px-2 py-1 rounded bg-[#15151B]"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1C1C24]">
                <span className="text-[#A1A1AA]">Node Type</span>
                <span className="font-mono text-white">{selectedNode.data.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C24]">
                <span className="text-[#A1A1AA]">Node ID</span>
                <span className="font-mono text-[#71717A] text-[11px] truncate max-w-[180px]">{selectedNode.id}</span>
              </div>

              {selectedNode.data.properties && (
                <div className="pt-2">
                  <span className="text-[#A1A1AA] block mb-1 font-mono text-[11px]">Raw Graph Properties:</span>
                  <pre className="p-2.5 rounded bg-[#000000] border border-[#27272F] font-mono text-[10px] text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-60">
                    {JSON.stringify(selectedNode.data.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
