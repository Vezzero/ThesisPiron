import React from 'react';
import { IoIosClose } from 'react-icons/io';

export default function DefinitionInfoModal({ selectedDefinition, onClose }) {
  if (!selectedDefinition) return null;
  const urlRegex = /(https?:\/\/[^\s\]]+)/g;

  const parts = selectedDefinition.definition.split(urlRegex);

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose 
          style={{ top: '0.25rem' }}
          className="tm-modal-close" 
          onClick={onClose}
        />
        <h3 className="h3-title">Definition</h3>
        <p>
          {parts.map((part, i) =>
            urlRegex.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4A6EE0' }}
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>
      </div>
    </div>
  );
}
