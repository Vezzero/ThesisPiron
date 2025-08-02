import React from 'react';
import { IoIosClose } from 'react-icons/io';

export default function SentenceInfoModal({ selected, onClose }) {
  if (!selected) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose 
         className="tm-modal-close" 
         onClick={onClose}
         />
        <h3 className="h3-title">Sentence Information</h3>
        <p className="uri">
          <code className="code-underline-uri">{selected.sent}</code>
        </p>
        <p><strong>Sentence:</strong> {selected.senttext}</p>
      </div>
    </div>
  );
}
