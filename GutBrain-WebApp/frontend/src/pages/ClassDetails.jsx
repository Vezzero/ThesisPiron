import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Chart } from "react-google-charts";
import Alert from '@mui/material/Alert';
import "./ClassDetails.css";
import "../components/LandingPage.css";
import { BASE_URL} from "../App";
import "../components/LandingPage.css";
import "../modals/DefinitionInfoModal.jsx";
import DefinitionInfoModal from "../modals/DefinitionInfoModal.jsx";


export default function ClassDetails({
   classIri: propIri,
   classLabel: propLabel
 }) {
   const { className } = useParams();
   const { state }     = useLocation();

  const classIri   = propIri ?? state?.classIri ?? decodeURIComponent(className);
  const classLabel = propLabel ?? state?.classLabel ?? className;

  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [labelFilter, setLabelFilter] = useState("");
  const [uriFilter, setUriFilter] = useState("");
  const [countFilter, setCountFilter] = useState("");
  const [definitionFilter, setDefinitionFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedDefinition, setSelectedDefinition] = useState(null);

  const top10Individuals = useMemo(() => {
    return [...individuals]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [individuals]);

  useEffect(() => {
    setVisibleCount(5);
  }, [labelFilter, uriFilter, countFilter, definitionFilter]);

  const chartDataPie = useMemo(() => {
    if (!top10Individuals.length) return [];
    return [
      ["Individual", "Count"], 
      ...top10Individuals.map(ind => [
        `${ind.label} (${ind.count})`,
         ind.count])
    ];
  }, [top10Individuals]);

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
  const def = (ind.definition || "").toLowerCase();
  const cnt = ind.count.toString();

  const min = parseInt(countFilter, 10);

  return (
    lab.includes(labelFilter.toLowerCase()) &&
    def.includes(definitionFilter.toLowerCase()) &&
    uri.includes(uriFilter.toLowerCase()) &&
    cnt.includes(countFilter.toLowerCase()) &&
    (!countFilter || cnt >= min)
  );
});


  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="tm-error">{error}</p>;

  return (
    <div className="cd-container">
      <div className="cd-card">
        <div className="cd-overview">
  {/* ── LEFT COLUMN ── */}
  <div className="cd-card__left">
    <h3 className="h3-title">{classLabel}</h3>
    <p>
      <a href={classIri} target="_blank" rel="noopener noreferrer">
        <code className="code-underline">{classIri}</code>
      </a>
    </p>
    <p>
      <strong>Number of individuals of this class:</strong>{" "}
      {individuals.length}
    </p>
    <p>
      <strong>Class description:</strong>{" "}
      <span className="cd-class-comment">
        {individuals[0]?.comment || (
                            <p style={{
                            'font-size': '0.8rem',
                            'text-align': 'left'
                             }}><Alert severity="info">No Description to Display.</Alert></p>
                          )}
      </span>
    </p>
  </div>

  {/* ── RIGHT COLUMN ── */}
  <div className="cd-card__right">
    <h4 className="h4-title">
    The 10 {classLabel} individuals most found in the collections
  </h4>
    <Chart
      chartType="PieChart"
      data={chartDataPie}
      options={{
        title: ``,
        legend: { position: "right", textStyle: { fontSize: 12 } },
        pieSliceText: "value",
        chartArea: { width: "100%", height: "100%" },
      }}
      width="100%"
      height="250px"
    />
  </div>
  </div>
</div>


      <div className="tm-table-wrapper">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Individual Name</th>
              <th>Definition</th>
              <th>URI</th>
              <th>Paper Count</th>
            </tr>
            <tr className="tm-filters">
              <th>
                <input
                  className="tm-filter-input"
                  type="text"
                  placeholder="Filter Label..."
                  value={labelFilter}
                  onChange={e => setLabelFilter(e.target.value)}
                />
              </th>
              <th>
                <input
                  className="tm-filter-input"
                  type="text"
                  placeholder="Filter Definition..."
                  value={definitionFilter}
                  onChange={e => setDefinitionFilter(e.target.value)}
                />
              </th>
              <th>
                <input
                  className="tm-filter-input"
                  type="text"
                  placeholder="Filter URI..."
                  value={uriFilter}
                  onChange={e => setUriFilter(e.target.value)}
                />
              </th>
              <th>
                <input
                  className="tm-filter-input"
                  type="text"
                  placeholder="Filter Count..."
                  value={countFilter}
                  onChange={e => setCountFilter(e.target.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIndividuals
            .slice(0, visibleCount)
            .map((ind, i) => (
              <tr key={`${ind.uri}-${i}`}>
                <td className="tm-truncate">
                   <Link
                    to={`${BASE_URL}/search?term=${encodeURIComponent(ind.label)}`}
                    className="tm-link-button"
                    title={`Search for ${ind.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    {ind.label}
                    </Link>
                </td>
                <td className="tm-truncate">
                  <span
                    className="tm-clickable color-sentence"
                    onClick={() => setSelectedDefinition(ind)}
                    title={ind.definition || "No description available"}
                    >
                    {ind.definition || (
                    <span className="cd-class-comment">
                      <Alert severity="info">No Description to Display.</Alert>
                    </span>
                  )}
                    </span>
                </td>
                <td className="tm-truncate">
                  <a
                    href={ind.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="code-underline"
                  >
                    <code className="code-underline">{ind.uri}</code>
                  </a>
                </td>
                <td className="tm-truncate">
                  {ind.count || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleCount < filteredIndividuals.length && (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <button
                    className="tm-button"
                    onClick={() => setVisibleCount(c => c + 5)}
                  >
                    Load more…
                  </button>
                </div>
                )}

        <DefinitionInfoModal
          selectedDefinition={selectedDefinition}
          onClose={() => setSelectedDefinition(null)}
        />      
      </div>
    </div>
  );
}
