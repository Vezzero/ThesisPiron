import React from "react";
import { IoIosClose } from "react-icons/io";

export default function MentionInfoModal({ selectedMention, sentenceCount, paperCount, onClose }) {
  if (!selectedMention) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose 
         className="tm-modal-close" 
         onClick={onClose}
         style={{top:'0.25rem'}}/>
        <h3 className="h3-title">Mention Information</h3>
        <p>
          The mention <strong>{selectedMention.mentiontext}</strong> has been found in {sentenceCount}{" "}
          {sentenceCount === 1 ? "sentence" : "sentences"} from {paperCount}{" "}
          {paperCount === 1 ? "paper." : "papers."}
        </p>
      </div>
    </div>
  );
}
