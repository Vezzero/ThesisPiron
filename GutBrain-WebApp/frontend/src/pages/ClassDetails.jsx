import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";

import "./ClassDetails.css";

export default function ClassDetails() {
  const { className } = useParams();
  const { state }     = useLocation();
  const navigate      = useNavigate();
  const classIri      = state?.classIri || decodeURIComponent(className);
  const classLabel    = state?.classLabel || className;

  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [labelFilter, setLabelFilter] = useState("");
  const [uriFilter,   setUriFilter]   = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await fetch(
          `/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`
        );
        if (!resp.ok) throw new Error(await resp.text());
        const { individuals } = await resp.json();
        setIndividuals(individuals);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classIri]);

  const filteredIndividuals = individuals.filter(ind => {
   const lab = ind.label.toLowerCase();
   const uri = ind.uri.toLowerCase();
   return (
     lab.includes(labelFilter.toLowerCase()) &&
     uri.includes(uriFilter.toLowerCase())
   );
  });

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="tm-error">{error}</p>;

  return (
    <div className="cd-container">
      <button onClick={() => navigate(-1)} className="tm-button margin-bottom">
        Back
      </button>
      <div className="cd-card">
        <h2>{classLabel}</h2>
        <p>
          <strong>URI:</strong>{" "}
          <a href={classIri} target="_blank" rel="noopener noreferrer">
            <code className="code-underline">{classIri}</code>
          </a>
        </p>
        <p>
          <strong>Individuals Count:</strong> {individuals.length}
        </p>
      </div>

      <div className="cd-table-wrapper">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Individual Name</th>
              <th>IRI</th>
            </tr>
            <tr className="cd-filters">
              <th>
                <input
                  className="cd-filter-input"
                  type="text"
                  placeholder="Filter Label…"
                  value={labelFilter}
                  onChange={e => setLabelFilter(e.target.value)}
                />
              </th>
              <th>
                <input
                  className="cd-filter-input"
                  type="text"
                  placeholder="Filter URI…"
                  value={uriFilter}
                  onChange={e => setUriFilter(e.target.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIndividuals.map((ind, i) => (
              <tr key={`${ind.uri}-${i}`}>
                <td>
                  <Link
                    to={`/search?term=${encodeURIComponent(ind.label)}`}
                    className="tm-link-button"
                  >
                    {ind.label}
                  </Link>
                </td>
                <td>
                  <a
                    href={ind.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="code-underline"
                  >
                    <code className="code-underline">{ind.uri}</code>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
