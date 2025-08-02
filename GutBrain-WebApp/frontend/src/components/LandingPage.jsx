import React, { useState, useEffect, useMemo, useContext } from "react";
import { fetchTermMentions } from "../services/graphServices";
import "./LandingPage.css";
import ClassDetails from "../pages/ClassDetails";
import FacetFilter from "./FacetFilters";
import "../pages/PaperDetails.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Fuse from 'fuse.js'
import AsyncSelect from 'react-select/async'
import { Chart } from "react-google-charts";
import Alert from '@mui/material/Alert';
import { FaNewspaper } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import { Row, Col, Container } from "react-bootstrap";
import { BASE_URL } from "../App";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "bootstrap/dist/css/bootstrap.min.css";
import { AppContext } from "../App";
import SideBar from "./Sidebar";
import MenuButton from "../menu/MenuButton";
import SentenceInfoModal from '../modals/SentenceInfoModal';
import PaperInfoModal from "../modals/PaperInfoModal";
import JournalInfoModal from "../modals/JournalInfoModal";
import RelationsModal from "../modals/RelationsModal";
import ObjectsModal from "../modals/ObjectsModal";
import MentionInfoModal from "../modals/MentionInfoModal";
import AuthorFilter from "./AuthorFilter";
import useAuthors from "../hooks/useAuthors";
import usePublicationChart from "../hooks/usePublicationChart";
import { useClassesWithIndividuals } from "../hooks/useClassesWithIndividuals";
import { usePaperDetails } from "../hooks/usePaperDetails";
//import { useClassIndividuals } from "../hooks/useClassIndividuals";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FiArrowUp } from "react-icons/fi";
import { FiArrowDown } from "react-icons/fi";
import { LuArrowUpDown } from "react-icons/lu";
import HighlightMention from '../components/HighlightMention';


export default function LandingPage() {
  const { paperId } = useParams();
  const [term, setTerm] = useState("");
  const [mentions, setMentions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedMention, setSelectedMention] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relationsList, setRelationsList] = useState([]); 
  const [_relationCount, setRelationCount] = useState(0);
  const [showRelModal, setShowRelModal] = useState(false);
  const [objectsList, setObjectsList]     = useState([]);
  const [showObjectsModal, setShowObjectsModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [sentenceFilter, setSentenceFilter] = useState("");
  const [paperTitleFilter,    setPaperTitleFilter]    = useState("");
  const [paperJournalFilter,    setPaperJournalFilter]    = useState("");
  const [paperYearFilter, setPaperYearFilter] = useState("");
  const [mentionFilter,  setMentionFilter]  = useState("");
  const [filterAuthors,      setFilterAuthors]      = useState([]);
  const [filterJournals,     setFilterJournals]     = useState([]);
  const [filterYears,        setFilterYears]        = useState([]);
  const [filterCollections,  setFilterCollections]  = useState([]);
  const [allIndividuals, setAllIndividuals] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(paperId || null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedClassIri,     setSelectedClassIri]     = useState(null);
  const [selectedClassLabel,   setSelectedClassLabel]   = useState(null);
  const [_classLoading,         setClassLoading]         = useState(false);
  const [classError,           setClassError]           = useState(null);
  const [_classIndividuals,     setClassIndividuals]     = useState([]);
  const [selectedClass, setSelectedClass]   = useState(null);
  const [classInds, setClassInds]           = useState([]);
  const [_selectedPropIri,   setSelectedPropIri]   = useState(null);
  const [selectedPropLabel, setSelectedPropLabel] = useState(null);
  const [selectedTermLabel, setSelectedTermLabel] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const { _showbar } = useContext(AppContext);
  const [, _setShowBar] = _showbar;
  
 
  useEffect(() => {
  setVisibleCount(5);
}, [
  sentenceFilter,
  paperTitleFilter,
  paperJournalFilter,
  paperYearFilter,
  mentionFilter,
  filterAuthors,
  filterJournals,
  filterYears,
  filterCollections,
  term
]);

const { authors: allAuthors, error: authorsError } = useAuthors();
const { chartData: publicationChart, error: pubChartError } = usePublicationChart(term);
const { classes: allClasses,   loading: classesLoading, error: classesError } = useClassesWithIndividuals();
const { paper: selectedPaper, loading: paperLoading, error: paperError } = usePaperDetails(selectedPaperId);
const anyModalOpen = showRelModal || showObjectsModal || !!selected;
useLockBodyScroll(anyModalOpen);
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


 async function loadClassDetails(classIri, classLabel) {
   setClassLoading(true);
   setClassError(null);
   setSelectedClassIri(classIri);
   setSelectedClassLabel(classLabel);
   try {
     const resp = await fetch(
       `/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`
     );
     if (!resp.ok) throw new Error(await resp.text());
     const { individuals } = await resp.json();
     setClassIndividuals(individuals);
   } catch (e) {
     setClassError(e.message);
     setClassIndividuals([]);
   } finally {
     setClassLoading(false);
   }
 }

function handleSort(columnKey) {
  setSortConfig(({ key, direction }) => {
    if (key === columnKey) {
      // same column: toggle direction
      return {
        key,
        direction: direction === 'asc' ? 'desc' : 'asc'
      };
    } else {
      // new column: default to ascending
      return { key: columnKey, direction: 'asc' };
    }
  });
}


 useEffect(() => {
  async function loadAllIndividuals() {
    const resp = await fetch("/api/list_all_individuals");
    if (!resp.ok) throw new Error(await resp.text());
    const { individuals } = await resp.json();
    setAllIndividuals(individuals);
  }
  loadAllIndividuals().catch(console.error);
}, []);

  const ONTOLOGY_URLS = {
  UMLS:      "https://www.nlm.nih.gov/research/umls/index.html",
  NCIT:      "https://ontobee.org/ontology/NCIT",
  NCBITaxon: "https://ontobee.org/ontology/NCBITaxon",
  CHEBI:     "https://ontobee.org/ontology/CHEBI",
  FOODON:    "https://ontobee.org/ontology/FOODON",
  GO:        "https://ontobee.org/ontology/GO",
  BTO:       "https://ontobee.org/ontology/BTO",
  MESH:      "https://meshb.nlm.nih.gov/",
  OMIT:      "https://ontobee.org/ontology/OMIT",
  OHMI:      "https://ontobee.org/ontology/OHMI",
};

const colorMap = {
  "locatedIn":          "#4caf4f91",
  "interact":           "#B0CA87",
  "influence":          "#FFC107",
  "changeExpression":   "#9FD8CB",
  "partOf":             "#3F51B5",
  "producedBy":         "#CFE8EF",
  "impact":             "#8BC34A",
  "administered":       "#009688",
  "strike":             "#795548",
  "changeAbundance":    "#A8D1D1",
  "affect":             "#00BCD4",
  "isA":                "#B2C8DF",
  "target":             "#FFCCB3",
  "changeEffect":       "#8D8E8E",
  "usedBy":             "#2196F3",
  "isLinkedTo":         "#D4B2D8",
  "comparedTo":         "#FFEB3B",
};

const chartData = [
  ["Relation Name", "Count", { role: "style" }, { role: "annotation" }],
  ...relationsList.map(r => [
    r.label,
    r.count,
    colorMap[r.label] || "#888888",
    r.count.toString()
  ])
];


  useEffect(() => {
    if (paperId) {
      setSelectedPaperId(paperId);
    }
  }, [paperId]);

  const fuse = useMemo(() => {
  return new Fuse(
    allIndividuals.map(i => i.label), 
    { threshold: 0.3,
      ignoreLocation: true,
    }
  )
}, [allIndividuals])

const loadOptions = (inputValue) => {
  if (inputValue.length < 3) {
    return Promise.resolve([])
  }
  const results = fuse.search(inputValue).slice(0, 10)
  return Promise.resolve(
    results.map(r => ({
      label: r.item,
      value: r.item
    }))
  )
}

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q      = params.get("term")?.trim();
    if (q) {
      fetchResults(q);
      setTerm(q);
    }
  }, [location.search]);

  useEffect(() => {
  fetch("/api/list_details/")
    .then(r => r.json())
    .then(json => {
      setAllCollections(json.collections);
      setAllYears(json.years);
      setAllJournals(json.journals);
    });
}, []);

  async function fetchResults(q) {
  setError(null);
  setLoading(true);

  let results = [];
  try {
    results = await fetchTermMentions(q);
    setMentions(results);

    if (results.length > 0) {
      const resp2 = await fetch(
        `/api/list_property_term/?term=${encodeURIComponent(q)}`
      );
      if (!resp2.ok) {
        throw new Error(await resp2.text());
      }
      const { relations } = await resp2.json();
      setRelationsList(relations);
      setRelationCount(relations.length);
    } else {
      setRelationsList([]);
      setRelationCount(0);
    }

    return results;
  } catch (e) {
    setError(e.message);
    setMentions([]);
    setRelationsList([]);
    setRelationCount(0);
    return [];
  } finally {
    setLoading(false);
  }
}

 const handleSearch = overrideTerm => {
  setMentions([]);
  let q = (overrideTerm ?? term).trim();
  if (!q) {
    return;
  }

  navigate(`/search?term=${encodeURIComponent(q)}`);
  setTerm(q);

  fetchResults(q).then(firstResults => {
    if (firstResults.length > 0) return;

    const [best] = fuse.search(q);
    if (best?.item && best.item.toLowerCase() !== q.toLowerCase()) {
      const corrected = best.item;
      console.log(`no hits for "${q}", retrying as "${corrected}"`);

      setTerm(corrected);
      navigate(
        `/search?term=${encodeURIComponent(corrected)}`,
        { replace: true }
      );

      fetchResults(corrected);
    }
  });
};

  const handlePropClick = async (propIri, propLabel) => {
  try {
    const seedLabel = mentions[0].indname;

    const resp = await fetch(
      `/api/list_property_objects/`
      + `?term=${encodeURIComponent(seedLabel)}`
      + `&prop=${encodeURIComponent(propIri)}`
    );
    if (!resp.ok) throw new Error(await resp.text());
    const { objects } = await resp.json();

    setObjectsList(objects);
    setSelectedTermLabel(seedLabel);
    setSelectedPropIri(propIri);
    setSelectedPropLabel(propLabel);

    setShowObjectsModal(true);

  } catch (e) {
    setError("Failed loading objects: " + e.message);
  }
};



  const filteredMentions = mentions.filter(m => {
  const sent = m.senttext.toLowerCase();
  const pap  = m.titletext.toLowerCase();
  const jou  = m.journal.toLowerCase();
  const yea  = m.pubYear.toLowerCase();
  const men  = m.mentiontext.toLowerCase();

  if (
    !sent.includes(sentenceFilter.toLowerCase()) ||
    !pap .includes(paperTitleFilter   .toLowerCase()) ||
    !jou .includes(paperJournalFilter   .toLowerCase()) ||
    !yea .includes(paperYearFilter   .toLowerCase()) ||
    !men .includes(mentionFilter .toLowerCase())
  ) return false;

  if (filterAuthors.length > 0) {
    const paperAuthors = m.author
      .split(";")
      .map(a => a.trim().toLowerCase());
    if (
      !filterAuthors
        .map(f => f.toLowerCase())
        .some(f => paperAuthors.some(a => a.includes(f)))
    ) {
      return false;
    }
  }

  if (
    filterJournals.length > 0 &&
    !filterJournals.some(fj =>
      m.journal.toLowerCase().includes(fj.toLowerCase())
    )
  ) {
    return false;
  }

  if (
    filterYears.length > 0 &&
    !filterYears.some(fy => m.pubYear.toString().includes(fy))
  ) {
    return false;
  }

  if (
    filterCollections.length > 0 &&
    !filterCollections.some(fc =>
      (m.collection || "").toLowerCase().includes(fc.toLowerCase())
    )
  ) {
    return false;
  }

  return true;
});

const sortedMentions = useMemo(() => {
  if (!sortConfig.key) return filteredMentions;

  // Copy array to avoid mutating original
  const arr = [...filteredMentions];
  arr.sort((a, b) => {
    let vA = a[sortConfig.key];
    let vB = b[sortConfig.key];

    // if numeric (e.g. pubYear), convert
    if (sortConfig.key === 'pubYear') {
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
}, [filteredMentions, sortConfig]);


  const visible = sortedMentions.slice(0, visibleCount);
  const same = mentions.filter(
  m => m.mentiontext === selectedMention?.mentiontext
  );
  const sentenceCount = same.length;
  const paperCount = new Set(same.map(m => m.paperid)).size;

useEffect(() => {
}, [
  sentenceFilter,
  paperTitleFilter,
  paperJournalFilter,
  paperYearFilter,
  mentionFilter,
  filterAuthors,
  filterJournals,
  filterYears,
  filterCollections,

]);

window.addEventListener('DOMContentLoaded', function() {
  let x = 0.1;
  setInterval(function() {
    document.querySelector('#progress-bar').value = (x >= 100) ? 100 : x;
    x += 0.1;
  }, 25);
})


  return (
    <>
   <SideBar />
      <header className="tm-header">
      {/* full-width container (no side-gutters) */}
      <Container fluid className="px-0">
        {/* 1) Top row: hamburger + logo */}
        <Row className="align-items-center justify-content-between py-2">
          <Col xs="auto">
            <MenuButton />
          </Col>
          <Col className="text-center">
            <img
              src="/static/img/gb-logo-text.JPEG"
              alt="Gut-Brain KB"
              style={{ maxWidth: "200px", width: "100%" }}
            />
          </Col>
          <Col xs="auto">
          </Col>
        </Row>

        {/* 2) Second row: centered search bar */}
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8} lg={6}>
            <div className="tm-search-bar">
              <div className="tm-search-left" />
              <div className="tm-search-center d-flex">
                <AsyncSelect
                  className="tm-input flex-grow-1"
                  classNamePrefix="tm-input"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions={false}
                  isClearable
                  placeholder="Type a term (e.g. brain, mouse)…"
                  menuIsOpen={menuIsOpen}
                  onMenuOpen={() => setMenuIsOpen(true)}
                  onMenuClose={() => setMenuIsOpen(false)}
                  inputValue={term}
                  value={
                    selectedOption
                      ? selectedOption
                      : term
                      ? { label: term, value: term }
                      : null
                  }
                  onInputChange={val => setTerm(val)}
                  onChange={(opt, meta) => {
                    if (opt?.value) {
                      setSelectedOption(opt);
                      setTerm(opt.value);
                      handleSearch(opt.value);
                    } else if (meta.action === "clear") {
                      setTerm("");
                      setSelectedOption(null);
                      handleSearch("");
                      setMenuIsOpen(false);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                      setMenuIsOpen(false);
                    }
                  }}
                  styles={{
                    container: base => ({ ...base, width: "300px" }),
                    control: base => ({ ...base, width: "300px" }),
                    menu: base => ({ ...base, width: "300px" }),
                  }}
                />

                <Button variant="outline-dark"
                  className="tm-button ms-2"
                  onClick={() => {
                    handleSearch();
                    setMenuIsOpen(false);
                  }}
                  disabled={loading}
                >
                  {loading ? "Searching…" : "Search"}
                </Button>
              </div>
              <div className="tm-search-right d-flex align-items-center">
                <div
                  className="tm-home-icon me-3"
                  onClick={() => {
                    window.location.href =
                      "https://hereditary.dei.unipd.it/ontology/gutbrain/";
                  }}
                  title="Go to Ontology Documentation"
                >
                  <FaNewspaper />
                </div>
                <a
                  href="./assets/hero_gutbrain_entities.ttl"
                  download="hero_gutbrain_entities.ttl"
                  className="tm-home-icon-download"
                  title="Download Gut-Brain entities TTL"
                >
                  <FaFileDownload size={20} />
                </a>
                {(selectedPaperId || selectedClassIri) && (
                  <button
                    className="tm-button-back ms-3"
                    onClick={() => {
                      navigate(-1);
                      setSelectedPaperId(null);
                      //setSelectedPaper(null);
                      setSelectedClassIri(null);
                      setSelectedClassLabel(null);
                    }}
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </header>



      {/* ===== PAGE WRAPPER: SIDEBAR + CONTENT ===== */}
      <div>
      <div className="tm-page-wrapper">
        {/* -- 1) Sticky Sidebar -- */}
        <aside className="tm-sidebar">
        <span className="tm-filter-title">Search by:</span>
        {/* INDIVIDUALS and CLASS */}
        <div className="tm-all-dropdown">
        {/** 1) Class selector **/}
        <Form.Group className="mb-2">
          {/* optional label for a11y; visuallyHidden hides it */}
          <Form.Label visuallyHidden>
            Select a Class
          </Form.Label>
          <Form.Select
        className="tm-filter-btn"
        aria-label="Select a Class"
        value={selectedClass?.classIri || ""}
        onChange={e => { 
              const iri = e.target.value;
              const cls = allClasses.find(c => c.classIri === iri);
              setSelectedClass(cls);
              setClassInds(cls ? cls.individuals : []);
            }} 
      >
        <option value="" disabled hidden>
          Select a Class…
        </option>
        {allClasses.map(c => (
          <option key={c.classIri} value={c.classIri}>
            {c.classLabel}
          </option>
        ))}
      </Form.Select>

  </Form.Group>

  {/** 2) Individual selector **/}
  {selectedClass && (
    <Form.Group className="mb-2">
      <Form.Label visuallyHidden>
        Select an Individual
      </Form.Label>
      <Form.Select
        className="tm-filter-btn"
        aria-label="Select an Individual"
        defaultValue=""
        onChange={e => handleSearch(e.target.value)}
      >
        <option value="" disabled>
          Select an individual…
        </option>
        {classInds.map(ind => (
          <option key={ind.uri} value={ind.label}>
            {ind.label} ({ind.count})
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )}
</div>

  <span className="tm-filter-title">Filter by:</span>
  
  {/* AUTHOR */}
  <AuthorFilter
    isOpen={showAuthorFilter}
    onToggle={() => setShowAuthorFilter(o => !o)}
    allAuthors={allAuthors}
    selectedAuthors={filterAuthors}
    onChange={setFilterAuthors}
  />
  
  {/* - Journal - */}
    <FacetFilter
    title="Journal"
    items={allJournals.map(j => ({ name: j.value, count: j.count }))}
    selectedItems={filterJournals}
    onChange={setFilterJournals}
  />

  {/* — Year — */}
  <FacetFilter
    title="Year"
    items={allYears.map(y => ({ name: y.value.toString(), count: y.count }))}
    selectedItems={filterYears}
    onChange={setFilterYears}
  />

  {/* — Collection — */}
  <FacetFilter
    title="Collection"
    items={allCollections.map(c => ({ name: c.value, count: c.count }))}
    selectedItems={filterCollections}
    onChange={setFilterCollections}
  />

  {classError && (
        <div className="tm-error">
          Error loading individuals: {classError}
        </div>
      )}

  <Button variant="outline-dark"
    className="tm-button tm-button--reset"
    onClick={e => {
      e.stopPropagation();
      setFilterAuthors([])
      setFilterJournals([]);
      setFilterYears([]);
      setFilterCollections([]);
      setSentenceFilter("");
      setPaperTitleFilter("");
      setSelectedClass(null);
      handleSearch("");
      setSelectedOption(null);
      setTerm("");
    }}
  >
    Reset all filters
    </Button>
   </aside>



        {/* -- 2) div Content Column -- */}
        <div className="tm-content">
          {loading && (
            <div className="tm-loading-bar-container">
              <span className="tm-loading-label">Loading results…</span>
              <ProgressBar
                animated
                now={100}
                variant="info"
                style={{ height: '8px', width: '200px'}}
              />
            </div>
          )}
          {error && <div className="tm-error">{error}</div>}

          {selectedPaper ? (
          <div className="paper-inline">

      {paperLoading && <p>Loading paper…</p>}
      {paperError   && <p className="tm-error">Error: {paperError}</p>}
            
      {selectedPaper && (
    <div className="paper-card">
      {/* ——— Card Header: back + pubmed ——— */}
      <div className="paper-card-header">
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.paperid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tm-pubmed-button"
        >
          View in PubMed
        </a>
      </div>
          <h3 className="h3-title"> Paper {selectedPaper.paperid}</h3>
          <p>
            <a
              href={selectedPaper.uri}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code className="code-underline">
                {selectedPaper.uri}
              </code>
            </a>
          </p>

          <div className="paper-field">
            <h3 className="paper-h3-subdef">Title:</h3>
            <p>{selectedPaper.titletext}</p>
          </div>
          <div className="paper-field">
            <h3 className="paper-h3-subdef">Abstract:</h3>
            <p className="tm-abstract">
              {selectedPaper.abstracttext}
            </p>
          </div>

          <div className="paper-info-line">
            <h3 className="paper-h3-subdef">Authors:</h3>
            <p>{selectedPaper.author}</p>
          </div>
          <div className="paper-info-line">
            <h3 className="paper-h3-subdef">Journal:</h3>
            <p>{selectedPaper.journal}</p>
          </div>
          <div className="paper-info-line">
            <h3 className="paper-h3-subdef">Publication Year:</h3>
            <p>{selectedPaper.pubYear}</p>
          </div>
          <div className="paper-info-line">
            <h3 className="paper-h3-subdef">Collections:</h3>
            <p>{selectedPaper.collection || "-"}</p>
          </div>
          </div>
           )}
          </div>
           ) : selectedClassIri ? (
            <ClassDetails
            classIri={selectedClassIri}
            classLabel={selectedClassLabel}
           />
            ) : (
            <>
            {mentions.length > 0 && (
              <>
              {/* • Results Cards Grid */}
              <div className="tm-results-wrapper">
                {/* Card #1 */}
                <div className="tm-results-card">
                  <div className="tm-header-grid1">
  <h3 className="h3-title">{mentions[0].indname}</h3>

  <p>
    <a
      href={mentions[0].ind}
      target="_blank"
      rel="noopener noreferrer"
    >
      <code className="code-underline">
        {mentions[0].ind}
      </code>
    </a>
  </p>

  <p>
    <strong>Full Name:</strong> {mentions[0].indname}
  </p>

  {mentions[0].classIri && (
    <p>
      <strong>Class:</strong>{" "}
      <button
  className="tm-link-button-class"
   onClick={() => {
   navigate(
     `/class/${encodeURIComponent(mentions[0].classLabel)}`,
     { replace: false }
   )

   loadClassDetails(
     mentions[0].classIri,
     mentions[0].classLabel
   )
 }}
>
  {mentions[0].classLabel || mentions[0].classIri.split("/").pop()}
</button>
    </p>
  )}

  <p>
    <strong>Definition:</strong>{" "}
    {mentions[0].definition || "-"}
  </p>

  {(() => {
    const match = mentions[0].ontologyMatch?.trim();
    const url = ONTOLOGY_URLS[match];
    return (
      <p>
        <strong>Ontology Match:</strong>{" "}
        {match ? (
          url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="tm-ontology-link"
            >
              {match}
            </a>
          ) : (
            <span>{match}</span>
          )
        ) : (
          <span>-</span>
        )}
      </p>
    );
            })()}
          </div>
          </div>
                {/* Card #2 */}
                <div className="tm-results-card">
                  <h4 className="h4-title">
                    Number of relations for <strong>{mentions[0].indname}</strong>
                  </h4>
                    {relationsList.length > 0 ? (
                    <Chart
                      chartType="BarChart"
                      data={chartData}
                      options={{
                        bars: "horizontal",
                        legend: { position: "none" },
                        chartArea: { left: 120, top: 40, width: "75%", height: "75%" },
                        hAxis: { minValue: 0 },
                        annotations: { alwaysOutside: true },
                        vAxis: { textStyle: { fontSize: 12 } },
                      }}
                      width="100%"
                      height="150px"
                      chartEvents={[
                    {
                        eventName: "select",
                      callback({ chartWrapper }) {
                        const chart = chartWrapper.getChart();
                        const sel   = chart.getSelection();
                        if (sel.length === 0) return;
                        const row = sel[0].row;
                        const rel = relationsList[row];
                        handlePropClick(rel.prop, rel.label);
                      }
                    }
                  ]}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                       <Alert severity="info">No Relations to display.</Alert>
                   </div>
                  )}
                <hr />
                <h4 className="h4-title">Number of supporting publications per year</h4>
                      {publicationChart && (
                      <Chart
                        chartType="ColumnChart"
                        data={publicationChart}
                        options={{
                          legend: { position: "none" },
                          bar: { groupWidth: "45%" },
                          vAxis: { minValue: 0 },
                          chartArea: { left: 40, top: 40, width: "100%", height: "50%" },
                          annotations: { alwaysOutside: true },
                          colors: ["#82D4BB"],
                        }}
                        width="100%"
                        height="150px"
                      />
                      )}
                      {!publicationChart && (
                            <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                              <Alert severity="info">No publications found for this term.</Alert>
                            </div>
                      )}
                </div>
              </div>

              {/* Results Table */}
              <div className="tm-table-wrapper">
                <table className="tm-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('senttext')} style={{ cursor: 'pointer' }}>
                        Sentence{" "}
                        {sortConfig.key === 'senttext' ? sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown /> : <LuArrowUpDown />}
                      </th>
                      <th onClick={() => handleSort('titletext')} style={{ cursor: 'pointer' }}>
                        Paper {sortConfig.key==='titletext' ? (sortConfig.direction==='asc'?<FiArrowUp /> : <FiArrowDown />) : <LuArrowUpDown />}
                      </th>
                      <th onClick={() => handleSort('journal')} style={{ cursor: 'pointer' }}>
                        Journal {sortConfig.key==='journal' ? (sortConfig.direction==='asc'?<FiArrowUp /> : <FiArrowDown />) : <LuArrowUpDown />}
                      </th>
                      <th onClick={() => handleSort('pubYear')} style={{ cursor: 'pointer' }}>
                        Publication Year {sortConfig.key==='pubYear' ? (sortConfig.direction==='asc'?<FiArrowUp /> : <FiArrowDown />) : <LuArrowUpDown />}
                      </th>
                      <th onClick={() => handleSort('mentiontext')} style={{ cursor: 'pointer' }}>
                        Mention {sortConfig.key==='mentiontext' ? (sortConfig.direction==='asc'?<FiArrowUp /> : <FiArrowDown />) : <LuArrowUpDown />}
                      </th>
                    </tr>
                    <tr className="tm-filters">
                      <th>
                        <input
                          type="text"
                          className="tm-filter-input"
                          placeholder="Filter…"
                          value={sentenceFilter}
                          onChange={e => setSentenceFilter(e.target.value)}
                        />
                      </th>
                      <th>
                        <input
                          type="text"
                          className="tm-filter-input"
                          placeholder="Filter…"
                          value={paperTitleFilter}
                          onChange={e => setPaperTitleFilter(e.target.value)}
                        />
                      </th>
                      <th>
                        <input
                          type="text"
                          className="tm-filter-input"
                          placeholder="Filter…"
                          value={paperJournalFilter}
                          onChange={e => setPaperJournalFilter(e.target.value)}
                        />
                      </th>
                      <th>
                        <input
                          type="text"
                          className="tm-filter-input"
                          placeholder="Filter…"
                          value={paperYearFilter}
                          onChange={e => setPaperYearFilter(e.target.value)}
                        />
                      </th>
                      <th>
                        <input
                          type="text"
                          className="tm-filter-input"
                          placeholder="Filter…"
                          value={mentionFilter}
                          onChange={e => setMentionFilter(e.target.value)}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((m, idx) => (
                      <tr key={`row-${idx}`}>
                        <td className="tm-truncate">
                          <span
                            className="tm-clickable color-sentence"
                            onClick={() => setSelected(m)}
                            title={m.senttext}
                          >
                            <HighlightMention
                              sentence={m.senttext}
                              mention={m.mentiontext}
                            />
                          </span>
                        </td>
                        <td className="tm-truncate" data-tooltip={m.titletext}>
                          <span
                            className="tm-clickable color-sentence"
                            onClick={() => setSelectedTitle(m)}
                            title={m.titletext}
                          >
                            {m.titletext}
                          </span>
                        </td>
                        <td className="tm-truncate">
                          <span
                            className="tm-clickable color-sentence"
                            onClick={() => setSelectedJournal(m)}
                            title={m.journal}
                          >
                            {m.journal}
                          </span>
                        </td>
                        <td className="tm-truncate">
                            {m.pubYear}
                        </td>
                        <td
                            className="tm-truncate tm-clickable"
                            onClick={() => {
                              const mention = m.mentiontext;
                              const paper   = m.titletext;
                              const id = m.paperid;

                              const sentences = mentions
                                .filter(x =>
                                  x.mentiontext === mention &&
                                  x.titletext   === paper &&
                                  x.paperid     === id
                                )
                                .map(x => ({
                                  senttext: x.senttext,
                                  paper:   x.titletext,
                                  mentiontext: x.mentiontext,
                                  id : x.paperid 
                                }));

                              setSelectedMention({
                                mentiontext: mention,
                                paper,
                                sentences,
                                id
                              });
                            }}
                          >
                         {m.mentiontext}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleCount < filteredMentions.length && (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  
                  <Button variant="outline-dark" 
                       onClick={() => setVisibleCount(c => c + 5)}>
                    Load more…
                  </Button>
                </div>
                )}

              </div>
            </>
          )}

          <SentenceInfoModal
            selected={selected}
            onClose={() => setSelected(null)}
          />

          <PaperInfoModal
            selectedTitle={selectedTitle}
            onClose={() => setSelectedTitle(null)}
          />
          <JournalInfoModal
            selectedJournal={selectedJournal}
            onClose={() => setSelectedJournal(null)}
          />
          <MentionInfoModal
            selectedMention={selectedMention}
            sentenceCount={sentenceCount}
            paperCount={paperCount}
            onClose={() => setSelectedMention(null)}
          />
          <RelationsModal
            open={showRelModal}
            relationsList={relationsList}
            onClose={() => setShowRelModal(false)}
            onSelect={(prop, label) =>
              handlePropClick(prop, label)
            }
          />
          <ObjectsModal
            open={showObjectsModal}
            objectsList={objectsList}
            termLabel={selectedTermLabel}
            propLabel={selectedPropLabel}
            onClose={() => setShowObjectsModal(false)}
            onSelectObject={label => handleSearch(label)}
          />
          </>
          )}
          </div>
        </div>
      </div>

    <Row>
     <footer className="app-footer">
       <div style={{ textAlign: "center", padding: "1rem 0" }}>
         <a href="https://www.unipd.it/" target="_blank" rel="noopener noreferrer">
           <img
             className="logo-footer"
             src="/assets/unipd-logo.png"
             alt="UniPD"
           />
         </a>
         <a href="https://www.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
           <img
             className="logo-footer"
             src="/assets/dei-logo_white.png"
             alt="DEI"
           />
         </a>
         <a href="https://iiia.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
           <img
             className="logo-footer"
             src="/assets/iiia-logo.png"
            alt="IIIA"
           />
         </a>
       </div>
     </footer>
   </Row>
   </>
  );

  
}
