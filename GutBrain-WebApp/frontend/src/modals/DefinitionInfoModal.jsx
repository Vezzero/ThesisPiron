import React from 'react';
import { IoIosClose } from 'react-icons/io';

export default function DefinitionInfoModal({ selectedDefinition, onClose }) {
  if (!selectedDefinition) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose 
         className="tm-modal-close" 
         onClick={onClose}
         />
        <h3 className="h3-title">Definition</h3>
        <p>{selectedDefinition.definition}</p>
      </div>
    </div>
  );
}
