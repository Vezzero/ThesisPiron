import React, { useState} from "react";
import { IoIosClose } from "react-icons/io";
import { Table, Button } from "react-bootstrap";
import PaperInfoModal from "../modals/PaperInfoModal";
import JournalInfoModal from "../modals/JournalInfoModal";
import AuthorInfoModal from "./AuthorInfoModal.jsx";

export default function PublicationModal({ open, year, papers, onClose }) {

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  if (!open) return null;
  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal modal-publication" onClick={e => e.stopPropagation()}>
        <div className="tm-modal-header">
        <IoIosClose className="tm-modal-close" onClick={onClose} />
        </div>
        <div className="tm-table-wrapper table-overflow" style={{overflowX:'hidden'}}>
        <table className="tm-objects-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Journal</th>
              <th>Authors</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={i}>
                <td
                    className="tm-truncate tm-clickable"
                    title={p.titletext}
                    onClick={() => {
                    setSelectedTitle({
                        paper:     p.paper,
                        paperid:   p.paperid,
                        titletext: p.title,
                        journal:   p.journal,
                        author:    p.author
                    });
                    }}
                    >
                    {p.title}
                </td>
                <td className="tm-truncate">
                <span
                    className="tm-clickable color-sentence"
                    onClick={() => setSelectedJournal(p)}
                    title={p.journal}
                >{p.journal}</span></td>
                <td className="tm-truncate">
                    <span
                        className="tm-clickable color-sentence"
                        title={p.author}
                        onClick={() =>
                        setSelectedAuthor({
                            name: p.author,
                        })
                        }
                    >
                        {p.author}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <PaperInfoModal
        selectedTitle={selectedTitle}
        onClose={() => setSelectedTitle(null)}
        />
        <JournalInfoModal
        selectedJournal={selectedJournal}
        onClose={() => setSelectedJournal(null)}
        />
        <AuthorInfoModal
        selectedAuthor={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
        />
      </div>
    </div>
    
  );
}
