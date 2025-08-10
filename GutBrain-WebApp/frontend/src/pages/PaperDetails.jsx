import React, { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

export default function PaperDetails({ paperId }) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true); setError(""); setPaper(null);
      try {
        const resp = await fetch(`/api/paper_details/?paperId=${encodeURIComponent(paperId)}`);
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        if (!abort) setPaper(data.paper || null);
      } catch (e) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoading(false);
      }
    }
    if (paperId) load();
    return () => { abort = true; };
  }, [paperId]);

  if (loading) {
    return (
      <div className="tm-loading-bar-container">
        <Spinner animation="grow" style={{ color: "#00809d" }} />
      </div>
    );
  }
  if (error)   return <div className="tm-error">Error: {error}</div>;
  if (!paper)  return <div className="tm-error">Paper “{paperId}” not found.</div>;

  return (
    <div className="paper-inline">
      <div className="paper-card">
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

          <h3 className="h3-title">Paper {paper.paperid}</h3>

          <p>
            <a href={paper.uri} target="_blank" rel="noopener noreferrer">
              <code className="code-underline">{paper.uri}</code>
            </a>
          </p>

          <div className="paper-field">
            <h3 className="paper-h3-subdef">Title:</h3>
            <p>{paper.titletext}</p>
          </div>

          <div className="paper-field">
            <h3 className="paper-h3-subdef">Abstract:</h3>
            <p className="tm-abstract">{paper.abstracttext}</p>
          </div>

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
            <h3 className="paper-h3-subdef">Collections:</h3>
            <p>{paper.collection || "-"}</p>
        </div>
      </div>
    </div>
  );
}
