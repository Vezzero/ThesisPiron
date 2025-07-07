import React, { useState, useEffect, useMemo } from "react";
import { fetchTermMentions } from "../services/graphServices";
import "./TermMentions.css";
import ClassDetails from "../pages/ClassDetails";
import "../pages/PaperDetails.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Select from 'react-select'
import Fuse from 'fuse.js'
import AsyncSelect from 'react-select/async'

export default function TermMentions() {
  const [term, setTerm] = useState("");
  const [mentions, setMentions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedMention, setSelectedMention] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relationsList, setRelationsList] = useState([]); 
  const [relationCount, setRelationCount] = useState(0);
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
  const [filterField, setFilterField] = useState(null);
  const [filterValue, setFilterValue] = useState([]);
  const [allIndividuals, setAllIndividuals] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedPaperId,    setSelectedPaperId]    = useState(null);
  const [selectedPaper,      setSelectedPaper]      = useState(null);
  const [paperLoading,       setPaperLoading]       = useState(false);
  const [paperError,         setPaperError]         = useState(null);
 const [selectedClassIri,     setSelectedClassIri]     = useState(null);
 const [selectedClassLabel,   setSelectedClassLabel]   = useState(null);
 const [classLoading,         setClassLoading]         = useState(false);
 const [classError,           setClassError]           = useState(null);
 const [classIndividuals,     setClassIndividuals]     = useState([]);

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

useEffect(() => {
  (async () => {
    try {
      const resp = await fetch("/api/list_authors/");
      if (!resp.ok) throw new Error(await resp.text());
      const { authors } = await resp.json();    // [{name,count},...]
      setAllAuthors(authors);
    } catch (err) {
      console.error("Could not load authors:", err);
    }
  })();
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

  const { paperId } = useParams();

  useEffect(() => {
    if (paperId) {
      setSelectedPaperId(paperId);
      loadPaperDetails(paperId);
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
      setAllPapers(json.papers);
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
  let q = (overrideTerm ?? term).trim();
  if (!q) {
    return;
  }

  navigate(`/search?term=${encodeURIComponent(q)}`);
  setTerm(q);
  setCurrentPage(1);

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


  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/list_all_individuals/");
        const { individuals } = await resp.json();
        setAllIndividuals(individuals);
      } catch (err) {
        console.error("Failed to load all individuals", err);
      }
    })();
  }, []);

  useEffect(() => {
    const anyModalOpen = showRelModal || showObjectsModal || selected;
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRelModal, showObjectsModal, selected]);

    const handlePropClick = async (propIri) => {
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
        setShowObjectsModal(true);
      } catch (e) {
        setError("Failed loading objects: " + e.message);
      }
};

async function loadPaperDetails(paperId) {
  setPaperLoading(true);
  setPaperError(null);
  try {
    const resp = await fetch(
      `/api/paper_details/?paperId=${encodeURIComponent(paperId)}`
    );
    if (!resp.ok) throw new Error(await resp.text());
    const { paper } = await resp.json();
    setSelectedPaper(paper);
  } catch (e) {
    setPaperError(e.message);
    setSelectedPaper(null);
  } finally {
    setPaperLoading(false);
  }
}


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

  if (filterField && filterValue) {
    const values = Array.isArray(filterValue)
      ? filterValue.map(v => v.toLowerCase())
      : [filterValue.toLowerCase()];

    switch (filterField) {

      case "author":
        return m.author
          .split(";")
          .map(x => x.trim().toLowerCase())
          .some(name => 
            values.some(v => name.includes(v))
          );

      case "journal":
        return values.some(v => m.journal.toLowerCase().includes(v));

      case "collection":
        return values.some(v =>
          (m.collection || "").toLowerCase().includes(v)
        );

      case "year":
        return values.some(v =>
          m.pubYear.toString().includes(v)
        );

      default:
        return true;
    }
  }
  return true;
});

  const optionsMap = {
  year: allYears.map(y => ({
    value: y.value,
    label: `${y.value} (${y.count})`
  })),
  journal: allJournals.map(j => ({
    value: j.value,
    label: `${j.value} (${j.count})`
  })),

  collection: allCollections.map(c => ({
    value: c.value,
    label: `${c.value} (${c.count})`
  })),

  paper: allPapers.map(p => ({ value: p, label: p })),
  author: allAuthors.map(a => ({ value: a, label: a })),
};

  const placeholderMap = {
    year:       'Select year…',
    author:     'Select author…',
    journal:    'Select journal…',
    collection: 'Select collection…'
  }

  const totalRows = filteredMentions.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginated = filteredMentions.slice(startIdx, startIdx + rowsPerPage);

  const same = mentions.filter(
  m => m.mentiontext === selectedMention?.mentiontext
  );
  const sentenceCount = same.length;
  const paperCount = new Set(same.map(m => m.paperid)).size;

  useEffect(() => setCurrentPage(1), [sentenceFilter, paperTitleFilter, paperJournalFilter, paperYearFilter, mentionFilter, filterField, filterValue, rowsPerPage]);


  return (
    <div className="tm-container">
      <header className="tm-header">
  <h2>Gut-Brain KB</h2>
  <div className="tm-search-bar">
    <div className="tm-search-left" />
    <div className="tm-search-center">
    <AsyncSelect
      className="tm-input"
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
    />

    <button
      className="tm-button"
      onClick={() => {
        handleSearch();
        setMenuIsOpen(false);
      }}
      disabled={loading}
    >
      {loading ? "Searching…" : "Search"}
    </button>
    </div>
    <div className="tm-search-right">
   {(selectedPaperId || selectedClassIri) && (
  <button
    className="tm-button-back"
    onClick={() => {
      navigate(-1);
      setSelectedPaperId(null);
      setSelectedPaper(null);
      setSelectedClassIri(null);
      setSelectedClassLabel(null);
    }}
    style={{ marginRight: "1rem" }}
  >
  Back
  </button>
)}

  </div>
  </div>
</header>


      {/* ===== PAGE WRAPPER: SIDEBAR + CONTENT ===== */}
      <div className="tm-page-wrapper">
        {/* -- 1) Sticky Sidebar -- */}
        <aside className="tm-sidebar">
  <span className="tm-filter-title">Filter by:</span>

  {/* AUTHOR */}
  <div className="tm-filter-item">
    <button
      className={`tm-filter-btn${filterField === "author" ? " active" : ""}`}
      onClick={() => {
        setFilterField(filterField === "author" ? null : "author");
        setFilterValue([]);
      }}
    >
      Author
    </button>
    {filterField === "author" && (
      <div className="tm-filter-dropdown">
        <Select
          options={allAuthors.map(a => ({
            value: a.name,
            label: `${a.name} (${a.count})`
          }))}
          isMulti
          placeholder="Select author…"
          value={allAuthors
            .filter(a => filterValue.includes(a.name))
            .map(a => ({ value: a.name, label: `${a.name} (${a.count})` }))}
          onChange={opts => setFilterValue(opts ? opts.map(o => o.value) : [])}
          styles={{
            container: base => ({ ...base, width: 200 }),
            menu:      base => ({ ...base, zIndex: 999 })
          }}
        />
      </div>
    )}
  </div>

  {/* COLLECTION */}
  

  {/* PAPER */}
  <div className="tm-filter-item">
    <button
      className={`tm-filter-btn${filterField === "paper" ? " active" : ""}`}
      onClick={() => {
        setFilterField(filterField === "paper" ? null : "paper");
        setFilterValue([]);
      }}
    >
      Paper
    </button>

    {filterField === "paper" && (
      <div className="tm-subfilters">
        {[
          { key: "journal",    label: "Journal" },
          { key: "year",       label: "Year" },
          { key: "collection", label: "Collection" }
        ].map(sf => (
          <button
            key={sf.key}
            className={`tm-filter-btn sub${filterField === sf.key ? " active" : ""}`}
            onClick={() => {
              setFilterField(sf.key);
              setFilterValue([]);
            }}
          >
            {sf.label}
          </button>
        ))}
      </div>
    )}

    {/* one dropdown for whichever paper sub‐filter is active */}
    {[ "journal", "year", "collection"].includes(filterField) && (
      <div className="tm-filter-dropdown">
        <Select
          options={optionsMap[filterField].map(v => ({
            value: v.value,
            label: v.label
          }))}
          isMulti
          placeholder={placeholderMap[filterField]}
          value={optionsMap[filterField].filter(o =>
            filterValue.includes(o.value)
          )}
          onChange={opts => setFilterValue(opts ? opts.map(o => o.value) : [])}
          styles={{
            container: base => ({ ...base, width: 200 }),
            menu:      base => ({ ...base, zIndex: 999 })
          }}
        />
      </div>
    )}
  </div>
</aside>



        {/* -- 2) Main Content Column -- */}
        <main className="tm-content">
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
          <h3>Uri:</h3>
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
            <h3>Title:</h3>
            <p>{selectedPaper.titletext}</p>
          </div>
          <div className="paper-field">
            <h3>Abstract:</h3>
            <p className="tm-abstract">
              {selectedPaper.abstracttext}
            </p>
          </div>

          <p><strong>Authors:</strong> {selectedPaper.author}</p>
          <p><strong>Journal:</strong> {selectedPaper.journal}</p>
          <p><strong>Year:</strong> {selectedPaper.pubYear}</p>
          <p><strong>Collection:</strong> {selectedPaper.collection}</p>
          <p><strong>Paper Id:</strong> {selectedPaper.paperid}</p>
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
  onClick={() =>
    loadClassDetails(mentions[0].classIri, mentions[0].classLabel)
  }
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
                  <p>
                    <strong>{mentions[0].indname}</strong> has in total{" "}
                    <strong>{relationCount}</strong>{" "}
                    {relationCount === 1 ? "relation" : "relations"}.
                  </p>
                  <ul className="tm-relations-list">
        {relationsList.map(r => (
          <li key={r.prop}>
            <button
              className="tm-link-button"
              onClick={() => handlePropClick(r.prop)}
            >
              {r.label}
            </button>
            &nbsp;({r.count})
          </li>
        ))}
      </ul>
                </div>
              </div>

              {/* • Mentions Table */}
              <div className="tm-table-wrapper">
                <table className="tm-table">
                  <thead>
                    <tr>
                      <th>Sentence</th>
                      <th>Paper Title</th>
                      <th>Journal</th>
                      <th>Publication Year</th>
                      <th>Mention</th>
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
                    {paginated.map((m, idx) => (
                      <tr key={`${m.indname}-${startIdx + idx}`}>
                        <td className="tm-truncate">
                          <span
                            className="tm-clickable color-sentence"
                            onClick={() => setSelected(m)}
                            title={m.senttext}
                          >
                            {m.senttext}
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
                        <td className="tm-truncate">
                          <span
                            className="tm-clickable color-sentence"
                            onClick={() => setSelectedMention(m)}
                            title={m.mentiontext}
                          >
                            {m.mentiontext}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="tm-pagination">
              <label>Rows per page:
                <select value={rowsPerPage} onChange={e=>setRowsPerPage(+e.target.value)}>
                  {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1}>‹</button>
              <span className="label-class">{startIdx+1}–{Math.min(startIdx+rowsPerPage,totalRows)} of {totalRows}</span>
              <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>›</button>
            </div>
              </div>
            </>
          )}

          {/* 1) Relations Modal */}
          {showRelModal && (
            <div
              className="tm-modal-overlay"
              onClick={() => setShowRelModal(false)}
            >
              <div
                className="tm-modal"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="tm-modal-close"
                  onClick={() => setShowRelModal(false)}
                >
                  ×
                </button>
                <h3>All Relations for {mentions[0].indname}</h3>
                <ul className="tm-relations-list">
                  {relationsList.map(({ prop, label, count }) => (
                    <li key={prop}>
                      <strong>{label}</strong> → {count}{" "}
                      {count === 1 ? "object" : "objects"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

{/* 2) Objects Modal */}
{showObjectsModal && (
  <div
    className="tm-modal-overlay"
    onClick={() => setShowObjectsModal(false)}
  >
    <div
      className="tm-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="tm-modal-close"
        onClick={() => setShowObjectsModal(false)}
      >
        ×
      </button>
      <div className="tm-table-wrapper">
        <table className="tm-objects-table">
          <thead>
            <tr>
              <th>Object Label</th>
              <th>Object URI</th>
            </tr>
          </thead>
          <tbody>
            {objectsList.map((o, idx) => (
              <tr key={`${o.uri}-${idx}`}>
                <td>
                  <button
                    className="tm-link-button"
                    onClick={() => {
                      setShowObjectsModal(false);
                      handleSearch(o.label);
                    }}
                  >
                    {o.label}
                  </button>
                </td>
                <td>
                  <a
                    href={o.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <code className="code-underline">
                      {o.uri}
                    </code>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* 3) Sentence Info Modal */}
{selected && (
  <div
    className="tm-modal-overlay"
    onClick={() => setSelected(null)}
  >
    <div
      className="tm-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="tm-modal-close"
        onClick={() => setSelected(null)}
      >
        ×
      </button>
      <h3 className="h3-title">Sentence Information</h3>
      <p>
        <strong>Sentence:</strong> {selected.senttext}
      </p>
      <p>
        <strong>URI: </strong>
        <code className="code-underline">
          {selected.sent}
        </code>
      </p>
    </div>
  </div>
)}

{selectedTitle && (
  <div
    className="tm-modal-overlay"
    onClick={() => setSelectedTitle(null)}
  >
    <div
      className="tm-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="tm-modal-close"
        onClick={() => setSelectedTitle(null)}
      >
        ×
      </button>
      <h3 className="h3-title">Title Information</h3>
      <p>
        <strong>Title:</strong> {selectedTitle.titletext}
      </p>
      <p><strong>Paper Information:</strong></p>
      <div className="tm-paper-link">
          <button
          className="tm-link-button"
          onClick={() => {
          navigate(`/paper/${selectedTitle.paperid}`, { replace: false });
          setSelectedPaperId(selectedTitle.paperid);
          loadPaperDetails(selectedTitle.paperid);
          setSelectedTitle(null)
          }}
          >
                              {selectedTitle.paper}
                            </button>

                          </div>
    </div>
  </div>
)}

{selectedJournal && (
  <div
    className="tm-modal-overlay"
    onClick={() => setSelectedJournal(null)}
  >
    <div
      className="tm-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="tm-modal-close"
        onClick={() => setSelectedJournal(null)}
      >
        ×
      </button>
      <h3 className="h3-title">Journal Information</h3>
      <p>
        <strong>Journal:</strong> {selectedJournal.journal}
      </p>
    </div>
  </div>
)}

{selectedMention && (
  <div
    className="tm-modal-overlay"
    onClick={() => setSelectedMention(null)}
  >
    <div
      className="tm-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="tm-modal-close"
        onClick={() => setSelectedMention(null)}
      >
        ×
      </button>
      <h3 className="h3-title">Mention Information</h3>

      <p>
        The mention{" "}
        <strong>{selectedMention.mentiontext}</strong>
        {" has been found in "}
        {sentenceCount}{" "}
        {sentenceCount === 1 ? "sentence" : "sentences"}
        {" from "}
        {paperCount}{" "}
        {paperCount === 1 ? "paper." : "papers."}
      </p>
    </div>
  </div>
  
       )}
        </>
          )}
          </main>
      </div>
    </div>
  );
}
