import React from "react";

export default function RelationsModal({ open, relationsList, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <button className="tm-modal-close" onClick={onClose}>×</button>
        <h3>All Relations</h3>
        <ul className="tm-relations-list">
          {relationsList.map(({ prop, label, count }) => (
            <li key={prop}>
              <strong
                style={{ cursor: "pointer", color: "#4A6EE0" }}
                onClick={() => { onSelect(prop, label); onClose(); }}
              >
                {label}
              </strong>{" "}
              → {count} {count === 1 ? "object" : "objects"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
