import React from "react";

export default function JournalInfoModal({ selectedJournal, onClose }) {
  if (!selectedJournal) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <button className="tm-modal-close" onClick={onClose}>×</button>
        <h3 className="h3-title">Journal Information</h3>
        <p><strong>Journal Title:</strong> {selectedJournal.journal}</p>
      </div>
    </div>
  );
}
