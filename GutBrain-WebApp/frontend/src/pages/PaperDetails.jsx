import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import "../styles/PaperDetails.css";

export default function PaperDetails({ paperId }) {
  const [paper, setPaper]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
  if (!loading && paper) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
   }
  }, [loading, paper]);

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true); setError(""); setPaper(null);
      try {
        const resp = await fetch(`/app/gutbrainkb/api/paper_details/?paperId=${encodeURIComponent(paperId)}`);
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        if (!abort) setPaper(data.paper || null);
      } catch (e) {
        if (!abort) setError(e.message || "Failed to load paper");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    if (paperId) load();
    return () => { abort = true; };
  }, [paperId]);

  if (error)   return <div className="tm-error">Error: {error}</div>;
  if (!paper) return null;

  return (
    <div className="paper-inline">
      <div className="paper-card">
        <h3 className="h3-title text-center mb-2">Paper {paper.paperid}</h3>

        <div className="text-end mb-3">
          <Button
            as="a"
            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.paperid}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline-primary"
            className="paper-card-header"
          >
            View in PubMed
          </Button>
        </div>

        <div className="paper-details-accordion">
          <p className="mb-3 text-center">
            <a href={paper.uri} target="_blank" rel="noopener noreferrer">
              <code className="code-underline">{paper.uri}</code>
            </a>
          </p>

          <Accordion alwaysOpen defaultActiveKey={["title", "abstract"]}>
            <Accordion.Item eventKey="title">
              <Accordion.Header className="accordion-button-paper-size">
                Title
              </Accordion.Header>
              <Accordion.Body className="accordion-body-paper-details">
                <p className="mb-0">{paper.titletext}</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="abstract">
              <Accordion.Header className="accordion-button-paper-size">
                Abstract
              </Accordion.Header>
              <Accordion.Body className="accordion-body-paper-details">
                <p className="tm-abstract mb-0">{paper.abstracttext}</p>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="metadata">
              <Accordion.Header className="accordion-button-paper-size">
                Metadata
              </Accordion.Header>
              <Accordion.Body className="accordion-body-paper-details">
                <div className="paper-info-line">
                  <h3 className="paper-h3-subdef">Authors:</h3>
                  <p>{paper.author}</p>
                </div>
                <div className="paper-info-line">
                  <h3 className="paper-h3-subdef">Journal:</h3>
                  <p>{paper.journal}</p>
                </div>
                <div className="paper-info-line">
                  <h3 className="paper-h3-subdef">Publication Year:</h3>
                  <p>{paper.pubYear}</p>
                </div>
                <div className="paper-info-line">
                  <h3 className="paper-h3-subdef">Collection:</h3>
                  <p>{paper.collection || "-"}</p>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
