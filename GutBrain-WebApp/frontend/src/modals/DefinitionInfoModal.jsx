import React from 'react';

export default function DefinitionInfoModal({ selectedDefinition, onClose }) {
  if (!selectedDefinition) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <button className="tm-modal-close" onClick={onClose}>×</button>
        <h3 className="h3-title">Definition</h3>
        <p>{selectedDefinition.definition}</p>
      </div>
    </div>
  );
}
