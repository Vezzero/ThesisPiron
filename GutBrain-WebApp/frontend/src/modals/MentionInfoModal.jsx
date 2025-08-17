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
      <div className="tm-modal tm-modal-mention-mobile" onClick={e => e.stopPropagation()}>
        <IoIosClose
          className="tm-modal-close"
          onClick={onClose}
          style={{top:'0.25rem'}}
        />

        <h3 className="h3-title">Mention Information</h3>
          <p>
            The mention <strong>{mentiontext}</strong> appears in{' '}
            <strong>{sentenceCount}{' '}</strong>
            {sentenceCount === 1 ? 'sentence' : 'sentences'}.
          </p>

          <p>
            <strong>Paper:</strong>{' '}
              {paper}
          </p>

          <div style={{ marginBottom: '16px' }}>
            <Button
              variant="outline-dark"
              className="button-paper-mobile"
              onClick={() => {
                navigate(`/paper/${id}`);
                onClose();
              }}
            >
              Check Paper Information
            </Button>
          </div>
        <Accordion defaultActiveKey="0" className="tm-mention-accordion" alwaysOpen>
          {sentences.map((row, idx) => (
            <Accordion.Item eventKey={idx.toString()} key={idx}>
                <Accordion.Header>
                  Sentence #{idx + 1}
                </Accordion.Header>
              <Accordion.Body> 
                <HighlightMention
                 sentence={row.senttext}
                 mention={row.mentiontext}
                 />
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
