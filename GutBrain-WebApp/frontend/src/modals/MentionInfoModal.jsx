import React from 'react';
import { IoIosClose } from 'react-icons/io';
import Accordion from 'react-bootstrap/Accordion';
import HighlightMention from '../components/HighlightMention';
import { Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';

export default function MentionInfoModal({ selectedMention, onClose }) {
  if (!selectedMention) return null;

  const { mentiontext, paper, sentences, id } = selectedMention;
  const sentenceCount = sentences.length;
  const paperCount = new Set(sentences.map(s => s.paper)).size;
  const navigate = useNavigate();

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <IoIosClose
          className="tm-modal-close"
          onClick={onClose}
          style={{top:'0.25rem'}}
        />

        <h3 className="h3-title">Mention Information</h3>
          <p>
            The mention <strong>{mentiontext}</strong> appears in{' '}
            {sentenceCount} {sentenceCount===1 ? 'sentence' : 'sentences'}.
          </p>

        <Accordion defaultActiveKey="0" className="tm-mention-accordion">
          {sentences.map((row, idx) => (
            <Accordion.Item eventKey={idx.toString()} key={idx}>
                <Accordion.Header>
                  Sentence #{idx + 1}
                </Accordion.Header>
              <Accordion.Body>
                <p><strong>Full sentence: {" "}</strong> 
                <HighlightMention
                 sentence={row.senttext}
                 mention={row.mentiontext}
                 />
                </p>
                <p><strong>Paper:</strong> {row.paper}</p>
                <Button variant="outline-dark"
                  className="tm-link-button"
                  style={{
                      cursor: "pointer",
                      margin: "16px 0",
                      textAlign: "center",
                    }}
                  onClick={() => {
                    navigate(`/paper/${row.id}`);
                    onClose();
                  }}
                  >
                  Check Paper Information
                </Button>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
