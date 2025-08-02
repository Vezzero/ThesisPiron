import React from "react";
import { IoIosClose } from "react-icons/io";

export default function JournalInfoModal({ selectedJournal, onClose }) {
  if (!selectedJournal) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" style={{minWidth:'400px', minHeight:'100px'}} onClick={e => e.stopPropagation()}>

        <IoIosClose 
          className="tm-modal-close" 
          onClick={onClose}
          style={{top:'0.25rem'}}
          />
        <h3 className="h3-title">Journal Information</h3>
        <p><strong>Journal Title:</strong> {selectedJournal.journal}</p>
      </div>
    </div>
  );
}
