import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Chart } from "react-google-charts";
import Alert from '@mui/material/Alert';
import "../styles/ClassDetails.css";
import "../styles/LandingPage.css";
import { BASE_URL} from "../App";
import "../modals/DefinitionInfoModal.jsx";
import DefinitionInfoModal from "../modals/DefinitionInfoModal.jsx";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { FiArrowUp } from "react-icons/fi";
import { FiArrowDown } from "react-icons/fi";
import { LuArrowUpDown } from "react-icons/lu";
import Spinner from 'react-bootstrap/Spinner';


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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const top10Individuals = useMemo(() => {
    return [...individuals]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [individuals]);

  function handleSort(columnKey) {
  setSortConfig(({ key, direction }) => {
    if (key === columnKey) {
      return {
        key,
        direction: direction === 'asc' ? 'desc' : 'asc'
      };
    } else {
      return { key: columnKey, direction: 'asc' };
    }
  });
}

const filteredIndividuals = useMemo(() => {
  return individuals.filter(ind => {
    const lab = ind.label.toLowerCase();
    const uri = ind.uri.toLowerCase();
    const def = (ind.definition || "").toLowerCase();
    const cnt = ind.count.toString();
    const min = parseInt(countFilter, 10) || 0;

    return (
      lab.includes(labelFilter.toLowerCase()) &&
      def.includes(definitionFilter.toLowerCase()) &&
      uri.includes(uriFilter.toLowerCase()) &&
      cnt.includes(countFilter.toLowerCase()) &&
      (countFilter === "" || Number(cnt) >= min)
    );
  });
}, [individuals, labelFilter, definitionFilter, uriFilter, countFilter]);

const sortedIndividuals = useMemo(() => {
  if (!sortConfig.key) return filteredIndividuals;

  // Copy array to avoid mutating original
  const arr = [...filteredIndividuals];
  arr.sort((a, b) => {
    let vA = a[sortConfig.key];
    let vB = b[sortConfig.key];

    // if numeric (e.g. pubYear), convert
    if (sortConfig.key === 'count') {
      vA = Number(vA) || 0;
      vB = Number(vB) || 0;
    } else {
      vA = vA?.toString().toLowerCase() || '';
      vB = vB?.toString().toLowerCase() || '';
    }

    if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (vA > vB) return sortConfig.direction === 'asc' ?  1 : -1;
    return 0;
  });
  return arr;
}, [filteredIndividuals, sortConfig]);

const visibleIndividuals = useMemo(() => {
  return sortedIndividuals.slice(0, visibleCount);
}, [sortedIndividuals, visibleCount]);

  const chartDataPie = useMemo(() => {
    if (!top10Individuals.length) return [];
    return [
      ["Individual", "Count"], 
      ...top10Individuals.map(ind => [
        `${ind.label}`,
         ind.count])
    ];
  }, [top10Individuals]);

  const [chartH, setChartH] = useState(window.innerWidth < 576 ? 220 : 260);
    useEffect(() => {
      const onResize = () => setChartH(window.innerWidth < 576 ? 220 : 260);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await fetch(
          `/app/gutbrainkb/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`
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


  if (loading) {
  return (
    <div className="tm-loading-bar-container">
      <Spinner animation="grow" style={{ color: '#00809d' }} />
    </div>
  );
}
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
        legend: { position: "right", textStyle: { fontSize: 12 } },
        pieSliceText: "value",
        chartArea: { width: "100%", height: "100%" },
        pieHole: 0.4,
      }}
      width="100%"
      height={`${chartH}px`}
    />
  </div>
  </div>
</div>


      <div className="tm-table-wrapper">
        <table className="tm-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('label')} style={{ cursor: 'pointer' }}>
                Individual Name{" "}
               {sortConfig.key === 'label' ? sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown /> : <LuArrowUpDown />}
               </th>
               <th onClick={() => handleSort('definition')} style={{ cursor: 'pointer' }}>
                Definition{" "}
               {sortConfig.key === 'definition' ? sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown /> : <LuArrowUpDown />}
               </th>
               <th onClick={() => handleSort('uri')} style={{ cursor: 'pointer' }}>
                URI{" "}
               {sortConfig.key === 'uri' ? sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown /> : <LuArrowUpDown />}
               </th>
              <th onClick={() => handleSort('count')} style={{ cursor: 'pointer' }}>
                Paper Count{" "}
               {sortConfig.key === 'count' ? sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown /> : <LuArrowUpDown />}
               </th>
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
            {visibleIndividuals
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
                  <Button variant="outline-dark"
                    onClick={() => setVisibleCount(c => c + 5)}>
                    Load more…
                  </Button>
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
