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

// Custom Node Renderer with Titanium Styling
function CustomGraphNode({ data, selected }: NodeProps) {
  const nodeType = data.type as string;

  const getBadgeStyle = () => {
    switch (nodeType) {
      case "Project":
        return { bg: "bg-blue-950/60", border: "border-blue-600/60", text: "text-blue-300", icon: Database };
      case "TeamMember":
        return { bg: "bg-emerald-950/60", border: "border-emerald-600/60", text: "text-emerald-300", icon: User };
      case "Handoff":
        return { bg: "bg-purple-950/60", border: "border-purple-600/60", text: "text-purple-300", icon: GitCommit };
      case "Decision":
        return { bg: "bg-amber-950/60", border: "border-amber-600/60", text: "text-amber-300", icon: CheckCircle2 };
      case "APIContract":
        return { bg: "bg-cyan-950/60", border: "border-cyan-600/60", text: "text-cyan-300", icon: FileCode2 };
      case "Module":
        return { bg: "bg-stone-900", border: "border-stone-700", text: "text-stone-300", icon: Layers };
      case "Conflict":
        return { bg: "bg-red-950/80", border: "border-red-600", text: "text-red-300", icon: AlertTriangle };
      default:
        return { bg: "bg-[#1A1C22]", border: "border-[#2D303B]", text: "text-gray-300", icon: Info };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <div
      className={`relative min-w-[190px] max-w-[240px] rounded-xl px-3.5 py-2.5 transition-all shadow-md ${
        style.bg
      } ${style.border} border ${
        selected ? "ring-2 ring-white shadow-xl scale-105" : "hover:border-gray-400"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#7E7972] !w-2 !h-2" />
      
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${style.text}`} />
        <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${style.text}`}>
          {nodeType}
        </span>
        {Boolean(data.status) && (
          <span className="ml-auto text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-gray-400">
            {String(data.status)}
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-gray-100 truncate" title={String(data.label || "")}>
        {String(data.label || "")}
      </div>

      {Boolean(data.subtitle) && (
        <div className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">
          {String(data.subtitle)}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-[#7E7972] !w-2 !h-2" />
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
    <div className="relative w-full h-[650px] lg:h-[760px] rounded-xl border border-[#23252E] bg-[#0E0F13] overflow-hidden flex flex-col">
      {/* Control Toolbar */}
      <div className="p-3 bg-[#13141A] border-b border-[#23252E] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Filter View:
          </span>
          {["ALL", "Handoff", "APIContract", "Decision", "Module", "Conflict"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                filterType === type
                  ? "bg-[#272A35] text-white border border-[#3E4252]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#1A1C23]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGraph}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B1D25] hover:bg-[#232630] border border-[#2B2E3A] text-xs text-gray-300 font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload Graph</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Drawer */}
      <div className="relative flex-1 w-full h-full">
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
          <Background color="#1E2028" gap={20} size={1} />
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
            maskColor="rgba(14, 15, 19, 0.7)"
            style={{ background: "#13141A", borderRadius: 8, border: "1px solid #23252E" }}
          />
        </ReactFlow>

        {/* Node Inspection Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 md:w-96 max-h-[90%] bg-[#14151B]/95 backdrop-blur-md border border-[#2B2E38] rounded-xl p-4 shadow-2xl z-20 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#23252E]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  Node Inspector
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {selectedNode.data.label}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-[#1D1F27]"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E2028]">
                <span className="text-gray-400">Node Type</span>
                <span className="font-mono text-gray-200">{selectedNode.data.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E2028]">
                <span className="text-gray-400">Node ID</span>
                <span className="font-mono text-gray-400 text-[11px] truncate max-w-[180px]">{selectedNode.id}</span>
              </div>

              {selectedNode.data.properties && (
                <div className="pt-2">
                  <span className="text-gray-400 block mb-1 font-mono text-[11px]">Raw Graph Properties:</span>
                  <pre className="p-2.5 rounded bg-[#0A0B0E] border border-[#1E2026] font-mono text-[10px] text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-60">
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
