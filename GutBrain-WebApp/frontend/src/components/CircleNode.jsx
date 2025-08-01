import React from 'react';
import { Handle, Position } from 'reactflow';

export default function CircleNode({ data }) {
  return (
    <div
      style={{
        width: data.size,
        height: data.size,
        borderRadius: '50%',
        background: data.background,
        border: data.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: data.fontSize,
        textAlign: 'center',
        padding: 4,
        boxSizing: 'border-box'
      }}
    >
      {data.label}
      {/* Outgoing handles */}
      <Handle type="source" position={Position.Top}    id="top"    style={{ background: '#333' }} />
      <Handle type="source" position={Position.Right}  id="right"  style={{ background: '#333' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#333' }} />
      <Handle type="source" position={Position.Left}   id="left"   style={{ background: '#333' }} />
      {/* Incoming handles */}
      <Handle type="target" position={Position.Top}    id="t-top"    style={{ background: '#333' }} />
      <Handle type="target" position={Position.Right}  id="t-right"  style={{ background: '#333' }} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ background: '#333' }} />
      <Handle type="target" position={Position.Left}   id="t-left"   style={{ background: '#333' }} />
    </div>
  );
}
