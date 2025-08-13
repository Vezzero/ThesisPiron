import React from "react";
import { IoIosClose } from "react-icons/io";
import Button from "react-bootstrap/Button";

export default function JournalInfoModal({ selectedJournal, onClose }) {
  if (!selectedJournal) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal journalModal" onClick={e => e.stopPropagation()}>

        <IoIosClose 
          className="tm-modal-close" 
          onClick={onClose}
          style={{top:'0.25rem'}}
          />
        <h3 className="h3-title">Journal Information</h3>
        <p><strong>Journal Title:</strong> {selectedJournal.journal}</p>
        <Button
          variant="outline-dark"
          className="tm-link-button"
          style={{
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={() => {
            const q = encodeURIComponent(selectedJournal.journal);
            window.open(
              `https://www.google.com/search?q=${q}`, 
              "_blank",
              "noopener,noreferrer"
            );
            onClose();
          }}
        >
          Visit Journal Site
        </Button>
      </div>
    </div>
  );
}
