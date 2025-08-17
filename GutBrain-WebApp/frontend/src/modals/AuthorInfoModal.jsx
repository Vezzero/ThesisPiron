import React from "react";
import { IoIosClose } from "react-icons/io";
import Button from "react-bootstrap/Button";

export default function AuthorInfoModal({ selectedAuthor, onClose }) {
  if (!selectedAuthor) return null;

  const { name} = selectedAuthor;

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal min-width-author" onClick={e => e.stopPropagation()} style={{minWidth: '350px'}}>
        <IoIosClose 
          className="tm-modal-close" 
          onClick={onClose}
          style={{ top: "0.25rem"}}
        />
        <h3 className="h3-title">Author Information</h3>
        <p>
          {name}
        </p>
      </div>
    </div>
  );
}
