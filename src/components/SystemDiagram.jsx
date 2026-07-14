import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useReducedMotion } from "motion/react";

// Lazy-loaded from Systems.jsx — React Flow only downloads when a visitor
// opens their first dataflow. Diagrams are data-driven from resume.js.

const nodeStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  borderRadius: 8,
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  padding: "6px 10px",
  width: "auto",
};

export default function SystemDiagram({ diagram }) {
  const reduce = useReducedMotion();

  const nodes = diagram.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: <div title={n.why}>{n.label}</div> },
    sourcePosition: "right",
    targetPosition: "left",
    style: nodeStyle,
  }));

  const edges = diagram.edges.map(([source, target, label]) => ({
    id: `${source}-${target}`,
    source,
    target,
    label,
    animated: !reduce,
    style: { stroke: "var(--accent-soft)", strokeWidth: 1.2, opacity: 0.7 },
    labelStyle: { fill: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: 9 },
    labelBgStyle: { fill: "#060010", fillOpacity: 0.9 },
  }));

  return (
    <div style={{ height: 200 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        preventScrolling={false}
        colorMode="dark"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
