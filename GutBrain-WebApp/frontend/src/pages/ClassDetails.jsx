import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Chart } from "react-google-charts";
import Alert from '@mui/material/Alert';
import "./ClassDetails.css";
import "../components/TermMentions.css";


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
  const [uriFilter,   setUriFilter]   = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const top10Individuals = useMemo(() => {
    return [...individuals]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [individuals]);

  useEffect(() => {
    setVisibleCount(5);
  }, [individuals]);

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
   const labelCount = ind.count || 1;
   return (
     lab.includes(labelFilter.toLowerCase()) &&
     uri.includes(uriFilter.toLowerCase()) &&
      labelCount > 0 
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
            </tr>
            <tr className="tm-filters">
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
