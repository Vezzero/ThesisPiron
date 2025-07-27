import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaperInfoModal({ selectedTitle, onClose }) {
  const navigate = useNavigate();
  if (!selectedTitle) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <button className="tm-modal-close" onClick={onClose}>×</button>
        <h3 className="h3-title">Paper Information</h3>
        <p className="uri">
          <code className="code-underline-uri">{selectedTitle.paper}</code>
        </p>
        <p><strong>Title:</strong> {selectedTitle.titletext}</p>
        <div className="tm-paper-link">
          <button
            className="tm-link-button"
            onClick={() => {
              navigate(`/paper/${selectedTitle.paperid}`);
              onClose();
            }}
          >
            Check Paper Information
          </button>
        </div>
      </div>
    </div>
  );
}
