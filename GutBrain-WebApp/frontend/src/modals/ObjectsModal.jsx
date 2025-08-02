import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { BASE_URL } from "../App";
import CircleNode from "../components/CircleNode";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import Button from "react-bootstrap/Button";

const nodeTypes = { circleNode: CircleNode };

export default function ObjectsModal({
  open,
  objectsList,
  termLabel,
  propLabel,
  onClose,
}) {
  const [showGraph, setShowGraph] = useState(false);

  const [nodes, edges] = useMemo(() => {
    const center = {
      id: termLabel,
      type: "circleNode",
      data: {
        label: termLabel,
        size: 120,
        background: "#D0E6FF",
        border: "2px solid #3B82F6",
        fontSize: 18,
      },
      position: { x: 300, y: 200 },
    };

    const baseRadius = 180;
    const periphs = objectsList.map((o, i) => {
      const charWidth = 8;
      const padding = 20;
      const nodeSize = Math.max(80, o.label.length * charWidth + padding);
      const angle = (2 * Math.PI * i) / objectsList.length;
      const r = baseRadius + nodeSize / 2;

      return {
        id: o.label,
        type: "circleNode",
        data: {
          label: o.label,
          size: nodeSize,
          background: "#FFF4D0",
          border: "2px solid #FBBF24",
          fontSize: 14,
        },
        position: {
          x: 300 + Math.cos(angle) * r,
          y: 200 + Math.sin(angle) * r,
        },
      };
    });

    function compassSide(angleRad) {
      const deg = ((angleRad * 180) / Math.PI + 360) % 360;
      if (deg < 45 || deg >= 315) return "right";
      if (deg < 135) return "bottom";
      if (deg < 225) return "left";
      return "top";
    }

    const edgeArr = objectsList.map((o, i) => {
      const angle = (2 * Math.PI * i) / objectsList.length;
      const srcSide = compassSide(angle);
      const tgtSide = {
        top: "t-bottom",
        bottom: "t-top",
        left: "t-right",
        right: "t-left",
      }[srcSide];

      return {
        id: `e-${termLabel}-${o.label}`,
        source: termLabel,
        sourceHandle: srcSide,
        target: o.label,
        targetHandle: tgtSide,
        type: "straight",
        label: propLabel,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#333" },
        labelStyle: { fill: "#333", fontWeight: 500 },
        labelBgPadding: [4, 2],
        animated: false,
      };
    });

    return [[center, ...periphs], edgeArr];
  }, [objectsList, termLabel, propLabel]);

  if (!open) return null;

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        {/* Header with Back + Close */}
        <div className="tm-modal-header">
          {showGraph && (
            <IoIosArrowBack
              className="tm-modal-back"
              onClick={() => setShowGraph(false)}
              aria-label="Back to table"
            />
          )}
          <IoIosClose
            className="tm-modal-close"
            onClick={onClose}
            aria-label="Close"
            style={ showGraph ? { top: '0.5rem' } : undefined }
           />
        </div>

        {!showGraph ? (
          <>
            {/* ─────── Table ─────── */}
            <div className="tm-table-wrapper">
              <table className="tm-objects-table">
                <thead>
                  <tr>
                    <th>Entity Name</th>
                    <th>Property</th>
                    <th>Object Individual</th>
                    <th>Object URI</th>
                  </tr>
                </thead>
                <tbody>
                  {objectsList.map((o) => (
                    <tr key={o.uri}>
                      <td>{termLabel}</td>
                      <td>{propLabel}</td>
                      <td>
                        <Link
                          to={`${BASE_URL}/search?term=${encodeURIComponent(
                            o.label
                          )}`}
                          className="tm-link-button"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {o.label}
                        </Link>
                      </td>
                      <td className="tm-truncate">
                        <a
                          href={o.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <code className="code-underline">{o.uri}</code>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─────── “Check Graph” Link ─────── */}
            <Button variant="outline-dark"
              className="tm-graph-link"
              style={{
                cursor: "pointer",
                margin: "16px 0",
                textAlign: "center",
              }}
              onClick={() => setShowGraph(true)}
            >
              Check the Relation Graph
            </Button>
          </>
        ) : (
          /* ─────── Graph ─────── */
          <div className="tm-graph-container">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              style={{ width: '100%', height: '100%', overflow: 'hidden', overflowX: 'hidden' }}
            >
              <Controls />
              <Background gap={16} />
            </ReactFlow>

            <div style={{ width: 700, height: 500, position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                style={{ width: '100%', height: '100%' }}
              >
                <Controls />
                <Background gap={16}/>
              </ReactFlow>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
