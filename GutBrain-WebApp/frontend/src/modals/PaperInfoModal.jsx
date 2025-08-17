import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { IoIosClose } from "react-icons/io";

export default function PaperInfoModal({ selectedTitle, onClose }) {
  const navigate = useNavigate();
  if (!selectedTitle) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose 
          className="tm-modal-close" 
          onClick={onClose}
          style={{top:'0.25rem'}}
          />
        <h3 className="h3-title">Paper Information</h3>
        <p className="uri">
          <code className="code-underline-uri">{selectedTitle.paper}</code>
        </p>
        <p><strong>Title:</strong> {selectedTitle.titletext}</p>
        <div className="tm-paper-link">
          <Button variant="outline-dark"
            className="tm-link-button button-paper-mobile"
            style={{
                cursor: "pointer",
                margin: "16px 0",
                textAlign: "center",
                width: "100%"
              }}
            onClick={() => {
              navigate(`/paper/${selectedTitle.paperid}`);
              onClose();
            }}
          >
            Check Paper Information
          </Button>
        </div>
      </div>
    </div>
  );
}
