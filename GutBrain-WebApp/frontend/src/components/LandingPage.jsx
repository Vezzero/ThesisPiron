import React, { useState, useEffect, useMemo, useContext } from "react";
import { fetchTermMentions } from "../services/graphServices";
import "../styles/LandingPage.css";
import ClassDetails from "../pages/ClassDetails";
import PaperDetails from "../pages/PaperDetails";
import FacetFilter from "./FacetFilters";
import "../styles/PaperDetails.css";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Fuse from 'fuse.js'
import AsyncSelect from 'react-select/async'
import { Chart } from "react-google-charts";
import Alert from '@mui/material/Alert';
import { FaDownload } from "react-icons/fa6";
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
import PublicationModal from "../modals/PublicationModal";
import AuthorFilter from "./AuthorFilter";
import useAuthors from "../hooks/useAuthors";
import usePublicationChart from "../hooks/usePublicationChart";
import { useClassesWithIndividuals } from "../hooks/useClassesWithIndividuals";
import { usePaperDetails } from "../hooks/usePaperDetails";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import Spinner from 'react-bootstrap/Spinner';
import { FiArrowUp } from "react-icons/fi";
import { FiArrowDown } from "react-icons/fi";
import { LuArrowUpDown } from "react-icons/lu";
import HighlightMention from '../components/HighlightMention';
import DownloadButtonMenu from '../components/DownloadButtonMenu';
import useAllIndividuals from "../hooks/useAllIndividuals";


export default function LandingPage() {
  const { paperId, label: classLabelParam } = useParams();
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
  const [noResultsQuery, setNoResultsQuery] = useState(null);
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
  const [showPubModal, setShowPubModal] = useState(false);
  const [pubYearClicked, setPubYearClicked] = useState(null);
  const [pubPapers, setPubPapers] = useState([]);
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
const { individuals: allIndividuals, loading:individualsLoading, error:individualsError} = useAllIndividuals();
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
       `/app/gutbrainkb/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`
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
      return {
        key,
        direction: direction === 'asc' ? 'desc' : 'asc'
      };
    } else {
      return { key: columnKey, direction: 'asc' };
    }
  });
}

  const EmptyResults = ({ mentions = [], loading = false, error = null }) => {
    const [params] = useSearchParams();
    const term = (params.get("term") || "").trim();

    if (!term) return null;
    if (loading || error) return null;

    if (Array.isArray(mentions) && mentions.length === 0) {
      return (
        <Alert severity="error" className="tm-empty">
          No results for query: <strong>{term}</strong>
        </Alert>
      );
    }
    return null;
  };


  const ONTOLOGY_URLS = {
  STATO:     "https://ontobee.org/ontology/STATO",
  UMLS:      "https://www.nlm.nih.gov/research/umls/index.html",
  NCIT:      "https://ontobee.org/ontology/NCIT",
  NCBITaxon: "https://ontobee.org/ontology/NCBITaxon",
  CHEBI:     "https://ontobee.org/ontology/CHEBI",
  FOODON:    "https://ontobee.org/ontology/FOODON",
  GO:        "https://ontobee.org/ontology/GO",
  BTO:       "https://ontobee.org/ontology/BTO",
  MeSH:      "https://meshb.nlm.nih.gov/",
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

  useEffect(() => {
  setSelectedPaperId(paperId ?? null);
  if (paperId) {
    setSelectedClassIri(null);
    setSelectedClassLabel(null);
    setSelectedClass(null);
  }
}, [paperId]);

  useEffect(() => {
    if (!classLabelParam) return;
    const label = classLabelParam;
    const found = allClasses.find(
      c => (c.classLabel || "").toLowerCase() === label.toLowerCase()
    );
    if (found) {
      setSelectedClassIri(found.classIri);
      setSelectedClassLabel(found.classLabel);
      loadClassDetails(found.classIri, found.classLabel);
    }
  }, [classLabelParam, allClasses]);

  useEffect(() => {
  if (!classLabelParam) {
    setSelectedClassIri(null);
    setSelectedClassLabel(null);
    setSelectedClass(null);
  }
}, [classLabelParam]);

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

  async function fetchResults(q) {
  setError(null);
  setLoading(true);

  try {
    const results = await fetchTermMentions(q);
    setMentions(results);

    if (results.length === 0) {
      setNoResultsQuery(q);
      setRelationsList([]);
      setRelationCount(0);
    } else {
      setNoResultsQuery(null);
       const resp2 = await fetch(
        `/app/gutbrainkb/api/list_property_term/?term=${encodeURIComponent(q)}`
      );
      if (!resp2.ok) {
        throw new Error(await resp2.text());
      }
      const { relations } = await resp2.json();
      setRelationsList(relations);
      setRelationCount(relations.length);
    }

  } catch (e) {
    setError(e.message);
    setMentions([]);
    setRelationsList([]);
    setRelationCount(0);
  } finally {
    setLoading(false);
  }
}

const handleSearch = async (overrideTerm) => {
  const q = (overrideTerm ?? term).trim();
  if (!q) return;

  setSelectedClassIri(null);
  setSelectedClassLabel(null);
  setSelectedClass(null);
  setSelectedPaperId(null);
  setMentions([]);

  navigate(`/search?term=${encodeURIComponent(q)}`);
  setTerm(q);

  // always coerce to an array
  const firstResults = (await fetchResults(q).catch(() => [])) ?? [];
  if (firstResults.length > 0) return;

  const [best] = fuse.search(q) ?? [];
  if (best?.item && best.item.toLowerCase() !== q.toLowerCase()) {
    const corrected = best.item;
    setTerm(corrected);
    navigate(`/search?term=${encodeURIComponent(corrected)}`, { replace: true });
    await fetchResults(corrected);
  }
};


  const handlePropClick = async (propIri, propLabel) => {
  try {
    const seedLabel = mentions[0].indname;

    const resp = await fetch(
      `/app/gutbrainkb/api/list_property_objects/`
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

  const arr = [...filteredMentions];
  arr.sort((a, b) => {
    let vA = a[sortConfig.key];
    let vB = b[sortConfig.key];

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

const urlRegex = /(https?:\/\/[^\s\]]+)/g;

function renderDefinition(definition) {
  if (!definition) return "-";
  const parts = definition.split(urlRegex);

  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4A6EE0' }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}


const filteredPublicationChart = useMemo(() => {
  if (!filteredMentions.length) {
    return [["Year", "Papers", { role: "annotation" }]];
  }

  const byYear = new Map();
  const seen = new Set();

  for (const m of filteredMentions) {
    const key = `${m.paperid}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const y = String(m.pubYear ?? "");
    byYear.set(y, (byYear.get(y) || 0) + 1);
  }

  const rows = [...byYear.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, count]) => [year, count, String(count)]);

  return [["Year", "Papers", { role: "annotation" }], ...rows];
}, [filteredMentions]);


const pubChartEvents = useMemo(() => ([
  {
    eventName: "select",
    callback: ({ chartWrapper }) => {
      const chart = chartWrapper.getChart();
      const sel = chart.getSelection?.() ?? [];
      if (!sel.length) return;

      const row = sel[0].row;
      const year = filteredPublicationChart[row + 1]?.[0];
      if (!year) return;

      const unique = new Map();
for (const m of filteredMentions) {
  if (String(m.pubYear) !== String(year)) continue;
  if (!unique.has(m.paperid)) {
    unique.set(m.paperid, {
      paperid: m.paperid,
      uri: m.uri,
      title: m.titletext,
      titletext: m.titletext,
      journal: m.journal,
      authors: m.author,
      author:  m.author,
      pubYear: m.pubYear,
    });
  }
}

setPubYearClicked(year);
setPubPapers(Array.from(unique.values()));
setShowPubModal(true);

    }
  }
]), [filteredMentions, filteredPublicationChart]);


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

function countsFromMentionsDistinctPapers(mentions) {
  const byJournal    = new Map();
  const byYear       = new Map();
  const byCollection = new Map();
  const byAuthor     = new Map();

  const add = (map, key, paperId) => {
    const k = (key || "").trim();
    if (!k || !paperId) return;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k).add(String(paperId));
  };

  for (const m of mentions) {
    const pid = m.paperid ?? m.paperId ?? m.paper_id;
    add(byJournal,    m.journal,    pid);
    add(byYear,       String(m.pubYear), pid);
    add(byCollection, m.collection, pid);

    (m.author || "")
      .split(";")
      .map(a => a.trim())
      .filter(Boolean)
      .forEach(a => add(byAuthor, a, pid));
  }

  const toItems = (map) =>
    [...map.entries()]
      .map(([name, set]) => ({ name, count: set.size }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    facetJournals:    toItems(byJournal),
    facetYears:       toItems(byYear),
    facetCollections: toItems(byCollection),
    facetAuthors:     toItems(byAuthor),
  };
}


const {
  facetJournals,
  facetYears,
  facetCollections,
  facetAuthors
} = useMemo(() => countsFromMentionsDistinctPapers(mentions), [mentions]);

  const deepLinkingClass = !!classLabelParam;
  const waitingClassData = deepLinkingClass && classesLoading && !selectedClassIri;

  const deepLinkingPaper   = !!paperId;
  const waitingPaperData   = deepLinkingPaper && paperLoading && !selectedPaper;

  const tooltipHTML = (label, count) => `
  <div class="tm-tip">
    <div><b>${label}</b></div>
    <div>Count: ${count}</div>
    <div class="tm-tip-foot">Click for more info</div>
  </div>
`;

function addTooltips(table) {
  if (!Array.isArray(table) || table.length < 2) return table;
  const header = table[0];

  if (header.some(c => c && typeof c === "object" && c.role === "tooltip")) return table;

  const tooltipCol = { type: "string", role: "tooltip", p: { html: true } };
  const insertAt = 2;

  const newHeader = [
    ...header.slice(0, insertAt),
    tooltipCol,
    ...header.slice(insertAt),
  ];

  const newRows = table.slice(1).map(r => {
    const label = r[0];
    const count = r[1];
    const tip = tooltipHTML(label, count);
    return [...r.slice(0, insertAt), tip, ...r.slice(insertAt)];
  });

  return [newHeader, ...newRows];
}

const dataWithTooltips = useMemo(
  () => addTooltips(filteredPublicationChart),
  [filteredPublicationChart]
);

const chartDataWithTooltips = useMemo(() => {
  const header = [
    "Relation Name",
    "Count",
    { role: "style" },
    { type: "string", role: "tooltip", p: { html: true } },
    { role: "annotation" },
  ];

  const rows = (relationsList ?? []).map(r => [
    r.label,
    r.count,
    colorMap[r.label] || "#888888",
    tooltipHTML(r.label, r.count),
    String(r.count),
  ]);

  return [header, ...rows];
}, [relationsList]);

const resetSearchUI = () => {
  setTerm("");
  setSelectedOption(null);
  setMentions([]);
  setRelationsList([]);
  setRelationCount(0);
  setError(null);
  setNoResultsQuery(null);
};

  useEffect(() => {
  window.scrollTo(0, 0);
}, [paperId]);

//const base = String(BASE_URL || "").replace(/\/+$/, "");


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
          <Link to={`https://hereditary.dei.unipd.it/app/gutbrainkb/`} aria-label="Go to Home">
            <img
               src={BASE_URL + `/img/gutbrain-logo-png.PNG`}
              alt="Gut-Brain KB"
              style={{ maxWidth: "200px", width: "100%" }}
            />
            </Link>
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
                  placeholder="Type a term..."
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
                      resetSearchUI();
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
                    container: (b) => ({ ...b, width: "100%", minWidth: 0 }),
                    control:   (b) => ({ ...b, width: "100%", minWidth: 0 }),
                    menu:      (b) => ({ ...b, width: "100%" }),
                  }}
                />

                <Button variant="dark"
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
                    window.open (
                      "https://hereditary.dei.unipd.it/ontology/gutbrain/",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  title="Go to Ontology Documentation"
                >
                  <img 
                    src={BASE_URL + `/img/images.png`}
                    alt="Ontology Documentation" 
                    style={{ width: "24px", height: "24px", objectFit: "contain" }} 
                  />
                </div>
                <a
                  href="./rdfdb/hero_gutbrain_entities.ttl"
                  download="hero_gutbrain_entities.ttl"
                  className="tm-home-icon-download"
                  title="Download the RDF dataset"
                >
                  <FaDownload size={20} />
                </a>
                {(selectedPaperId || selectedClassIri) && (
                  <Button variant="secondary" style={{justifyContent:'space-between'}}
                    onClick={() => {
                      navigate(-1);
                      setSelectedPaperId(null);
                      setSelectedClassIri(null);
                      setSelectedClassLabel(null);
                    }}
                  >
                    Back
                  </Button>
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
    allAuthors={facetAuthors}
    selectedAuthors={filterAuthors}
    onChange={setFilterAuthors}
  />
  
  {/* - Journal - */}
    <FacetFilter
    title="Journal"
    items={facetJournals}
    selectedItems={filterJournals}
    onChange={setFilterJournals}
  />

  {/* — Year — */}
  <FacetFilter
    title="Year"
    items={facetYears}
    selectedItems={filterYears}
    onChange={setFilterYears}
  />

  {/* — Collection — */}
  <FacetFilter
    title="Collection"
    items={facetCollections}
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
        navigate("/search", { replace: true });
      }}
      >
      Reset all filters
      </Button>
   </aside>

        {/* -- 2) div Content Column -- */}
        <div className="tm-content">
          {loading && (
            <div className="tm-loading-bar-container">
             <Spinner animation="grow" style={{'color': '#00809d'}}/>
            </div>
          )}

              {noResultsQuery && (
                <Alert severity="warning">
                  No results for query: <strong>{noResultsQuery}</strong>
                </Alert>
              )}

          {waitingClassData && (
            <div className="tm-loading-bar-container">
              <Spinner animation="grow" style={{ color: '#00809d' }} />
            </div>
          )}

          {waitingPaperData && (
            <div className="tm-loading-bar-container">
              <Spinner animation="grow" style={{ color: '#00809d' }} />
            </div>
          )}

          {paperError && (
            <div className="tm-error">Error: {paperError}</div>
          )}
          
          {error && <div className="tm-error">{error}</div>}

            {paperId ? (
            <PaperDetails paperId={paperId} />
          )
            : selectedClassIri ? (
            <ClassDetails
            classIri={selectedClassIri}
            classLabel={selectedClassLabel}
           />
            ) : (
            <>
            {Array.isArray(mentions) && mentions.length > 0 && (
              <>
              {/* • Results Cards Grid */}
              <div className="tm-results-wrapper">
                {/* Card #1 */}
                <div className="tm-results-card">
                  <div className="tm-header-grid1">
                    <div className="d-flex align-items-center justify-content-between py-2">
                      <h2 className="h2-title mb-0 ">{mentions[0].indname}</h2>
                      <DownloadButtonMenu
                        individual={mentions[0]}
                        relationsList={relationsList}
                        mentions={filteredMentions}
                      />
                    </div>
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
                <strong>Definition:</strong>{" "}{renderDefinition(mentions[0]?.definition)}
              </p>

              {(() => {
                const match = mentions[0].ontologyMatch?.trim();
                const url = ONTOLOGY_URLS[match];
                return (
                  <div className="ontology-row">
                    <strong>Ontology Match:</strong>{" "}
                    {match ? (
                      url ? (
                        <a>{match}</a>
                      ) : (
                        <span>{match}</span>
                      )
                    ) : (
                      <Alert severity="info" sx={{ display: 'inline-flex', ml: 1 }}>
                        No Ontology Match.
                      </Alert>
                    )}
                  </div>

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
                      data={chartDataWithTooltips}
                      options={{
                        bars: "horizontal",
                        legend: { position: "none" },
                        chartArea: { left: 120, top: 40, width: "75%", height: "75%" },
                        hAxis: { minValue: 0, textStyle: { color: "#000" } },
                        vAxis: { textStyle: { fontSize: 12, color: "#000" } },
                        annotations: {
                          alwaysOutside: true,
                          highContrast: false,
                          textStyle: {
                            color: "#000",
                            auraColor: "none",
                            fontSize: 12,
                          },
                        },
                        tooltip: { isHtml: true },
                      }}
                      width="100%"
                      height="150px"
                      chartEvents={[
                        {
                          eventName: "select",
                          callback({ chartWrapper }) {
                            const chart = chartWrapper.getChart();
                            const sel = chart.getSelection();
                            if (!sel.length) return;
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
                <h4 className="h4-title">Number of supporting <strong>publications</strong> per year</h4>
                      {filteredPublicationChart.length > 1 ? (
                        <Chart
                          chartType="ColumnChart"
                          data={dataWithTooltips}
                          options={{
                            legend: { position: "none" },
                            bar: { groupWidth: "45%" },
                            chartArea: { left: 40, top: 40, width: "100%", height: "50%" },
                            tooltip: { isHtml: true },
                            annotations: {
                              alwaysOutside: true,
                              textStyle: { fontSize: 12, color: "#000", auraColor: "none" },
                              stem: { color: "transparent", length: 4 },
                            },
                            vAxis: {
                              viewWindow: { min: 0 },
                              minValue: 0,
                              maxValue:
                                Math.max(...filteredPublicationChart.slice(1).map(r => r[1])) + 1,
                            },
                            colors: ["#82D4BB"],
                          }}
                          width="100%"
                          height="150px"
                          chartEvents={pubChartEvents}
                        />
                        ) : (
                            <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                              <Alert severity="info">No publications found for this term.</Alert>
                            </div>
                      )}
                      <PublicationModal
                        open={showPubModal}
                        year={pubYearClicked}
                        papers={pubPapers}
                        onClose={() => setShowPubModal(false)}
                      />
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
             src={BASE_URL + `/footer/unipd-logo.png`}
             alt="UniPD"
           />
         </a>
         <a href="https://www.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
           <img
             className="logo-footer"
             src={BASE_URL + `/footer/dei-logo_white.png`}
             alt="DEI"
           />
         </a>
         <a href="https://iiia.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
           <img
             className="logo-footer"
             src={BASE_URL + `/footer/iiia-logo.png`}
            alt="IIIA"
           />
         </a>
       </div>
     </footer>
   </Row>
   </>
  );

  
}
