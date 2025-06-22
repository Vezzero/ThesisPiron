import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PaperDetails.css";

export default function PaperDetails() {
  const { paperId } = useParams();
  const navigate    = useNavigate();

  const [paper, setPaper]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function loadPaper() {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch(
          `/api/paper_details/?paperId=${encodeURIComponent(paperId)}`
        );
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || resp.statusText);
        }
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
        setPaper(data.paper);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadPaper();
  }, [paperId]);

  if (loading) return <p>Loading paper…</p>;
  if (error)   return <p className="tm-error">Error: {error}</p>;
  if (!paper)  return <p>No paper found.</p>;

  return (
    <div className="paper-container">
      <button onClick={() => navigate(-1)} className="tm-button">
    Back
      </button>

      <div className="paper-card">
        <h2>Paper ID: {paper.paperid}</h2>

        <p>
          <a
            href={paper.uri}
            target="_blank"
            rel="noopener noreferrer"
          >
            <code className="code-underline"> {paper.uri} </code>
          </a>
        </p>

        <p><h3>Title:</h3> {paper.titletext}</p>
        <p><h3>Abstract:</h3>{paper.abstracttext}</p>
        <p><strong>Authors:</strong> {paper.author}</p>
        <p><strong>Journal:</strong> {paper.journal}</p>
        <p><strong>Publication Year:</strong> {paper.pubYear}</p>
        <p><strong>Collection:</strong> {paper.collection}</p>
      </div>
    </div>
  );
}
