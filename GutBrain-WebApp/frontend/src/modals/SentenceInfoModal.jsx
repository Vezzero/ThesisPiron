import React from 'react';
import { IoIosClose } from 'react-icons/io';
import HighlightMention from '../components/HighlightMention';

export default function SentenceInfoModal({ selected, onClose }) {
  if (!selected) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal tm-modal-sentence-mobile" onClick={e => e.stopPropagation()}>
        <IoIosClose 
         className="tm-modal-close" 
         onClick={onClose}
         style={{top:'0.25rem'}}
         />
        <h3 className="h3-title">Sentence Information</h3>
        <p className="uri">
          <code className="code-underline-uri"> {selected.sent}</code>
        </p>
        <p><strong>Sentence: {" "}</strong> 
        <HighlightMention
      sentence={selected.senttext}
      mention={selected.mentiontext}
    />
        </p>
      </div>
    </div>
  );
}
