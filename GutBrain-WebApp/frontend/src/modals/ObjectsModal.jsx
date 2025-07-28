import React from "react";

export default function ObjectsModal({ open, objectsList, termLabel, propLabel, onClose, onSelectObject }) {
  if (!open) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <button className="tm-modal-close" onClick={onClose}>×</button>
        <div className="tm-table-wrapper">
          <table className="tm-objects-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Property</th>
                <th>Object Individual</th>
                <th>Object URI</th>
              </tr>
            </thead>
            <tbody>
              {objectsList.map(o => (
                <tr key={o.uri}>
                  <td>{termLabel}</td>
                  <td>{propLabel}</td>
                  <td>
                    <button
                      className="tm-link-button"
                      onClick={() => { onSelectObject(o.label); onClose(); }}
                    >
                      {o.label}
                    </button>
                  </td>
                  <td className="tm-truncate">
                    <a href={o.uri} target="_blank" rel="noopener noreferrer">
                      <code className="code-underline">{o.uri}</code>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
