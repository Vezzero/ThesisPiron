import React, { useState, useEffect, useMemo } from "react";
import { fetchTermMentions } from "../services/graphServices";
import "./TermMentions.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Select from 'react-select'
import Fuse from 'fuse.js'
import AsyncSelect from 'react-select/async'

export default function TermMentions() {
  const [term, setTerm] = useState("");
  const [mentions, setMentions] = useState([]);
  const [selected, setSelected] = useState(null);
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
  const [paperFilter,    setPaperFilter]    = useState("");
  const [mentionFilter,  setMentionFilter]  = useState("");
  const [filterField, setFilterField] = useState(null);
  const [filterValue, setFilterValue] = useState([]);
  const [allIndividuals, setAllIndividuals] = useState([]);
  const [allAnnotators, setAllAnnotators] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null)


  const uniqueInds = Array.from(
  new Map(allIndividuals.map(ind => [ind.uri, ind])).values()
);

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
    (async () => {
      try {
        const resp = await fetch("/api/list_details/");
        if (!resp.ok) throw new Error(await resp.text());
        const {
          annotators,
          papers,
          collections,
          years,
          journals,
          authors
        } = await resp.json();

        setAllAnnotators(annotators);
        setAllPapers(papers);
        setAllCollections(collections);
        setAllYears(years);
        setAllJournals(journals);
        setAllAuthors(authors);

      } catch (err) {
        console.error("Could not load facet lists:", err);
      }
    })();
  }, []);

  async function fetchResults(q) {
  setError(null)
  setLoading(true)
  try {
    const results = await fetchTermMentions(q)
    setMentions(results)

    if (results.length > 0) {
      const uri   = results[0].indname
      const resp2 = await fetch(
        `/api/list_property_term/?term=${encodeURIComponent(uri)}`
      )
      if (!resp2.ok) throw new Error(await resp2.text())
      const { relations } = await resp2.json()
      setRelationsList(relations)
      setRelationCount(relations.length)
    } else {
      setRelationsList([])
      setRelationCount(0)
    }
  } catch (e) {
    setError(e.message)
    setMentions([])
    setRelationsList([])
    setRelationCount(0)
  } finally {
    setLoading(false)
  }
}

 const handleSearch = (overrideTerm) => {
   let q = (overrideTerm ?? term).trim()

   const labelsLC = allIndividuals.map(i => i.label.toLowerCase())
   if (q && !labelsLC.includes(q.toLowerCase())) {
     const [best] = fuse.search(q)
     if (best?.item) {
       console.log(`typo? correcting "${q}" → "${best.item}"`)
       q = best.item
     }
   }

   if (!q) {
     setError("Please type something to search.")
     return
   }

   navigate(`/search?term=${encodeURIComponent(q)}`, { replace: true })
    setTerm(q)
   fetchResults(q)
 }


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
  const filteredMentions = mentions.filter(m => {
    const sent = m.senttext.toLowerCase();
    const pap  = m.titletext.toLowerCase();
    const men  = m.mentiontext.toLowerCase();

    if (
      !sent.includes(sentenceFilter.toLowerCase()) ||
      !pap .includes(paperFilter   .toLowerCase()) ||
      !men .includes(mentionFilter .toLowerCase())
    ) return false;

    if (filterField && filterValue) {
      const fv = filterValue.toLowerCase();
      switch (filterField) {
        case "annotator":
          return m.annotator.toLowerCase() === fv;
        case "author":
          return m.author.toLowerCase().includes(fv);
        case "paper":
          return m.paper.toLowerCase().includes(fv);
        case "journal":
          return m.journal.toLowerCase().includes(fv);
        case "collection":
          return (m.collection || "").toLowerCase().includes(fv);
        case "year":
          return m.pubYear.toString().includes(fv);
        default:
          return true;
      }
    }

    return true;
  });


  const optionsMap = {
    annotator:  allAnnotators.map(a => ({ value: a, label: a })),
    year:       allYears.map(y => ({ value: y, label: y })),
    author:     allAuthors.map(a => ({ value: a, label: a })),
    paper:      allPapers.map(p => ({ value: p, label: p })),
    journal:    allJournals.map(j => ({ value: j, label: j })),
    collection: allCollections.map(c => ({ value: c, label: c }))
  }

  const placeholderMap = {
    annotator:  'Select an annotator…',
    year:       'Select year…',
    author:     'Select author…',
    paper:      'Select paper…',
    journal:    'Select journal…',
    collection: 'Select collection…'
  }


  return (
    <div className="tm-container">
      <div className="tm-header-bar">
       <h2 className="tm-title">Discover the Gut–Brain Axis Database</h2>
        <button
         onClick={() => navigate(-1)}
         className="tm-button tm-back-button"
        >
        Back
       </button>
       <hr />
      </div>
      
        <div className="tm-search">
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
          } else if (meta.action === 'clear') {
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

        <div className="tm-all-dropdown">
      <select
          className="tm-all-select"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select an individual…
          </option>
                {uniqueInds.map(ind => (
        <option key={ind.uri} value={ind.label}>
          {ind.label}
        </option>
            ))}
        </select>
      </div>
      </div>
      <div className="tm-extra-filters">
        <span>Filter by:</span>
        {[
          { key: "author",    label: "Author"    },
          { key: "annotator", label: "Annotator" },
          { key: "paper",     label: "Paper"     },
          { key: "journal",   label: "Journal"   },
          { key: "collection",label: "Collection"},
          { key: "year",      label: "Year"      }
        ].map(f => (
          <button
            key={f.key}
            className={
              "tm-filter-btn" +
              (filterField === f.key ? " active" : "")
            }
            onClick={() => {
              if (filterField === f.key) {
                setFilterField(null);
                setFilterValue("");
              } else {
                setFilterField(f.key);
                setFilterValue("");
              }
            }}
          >
            {f.label}
          </button>
        ))}
        {filterField && (
     <div className="tm-filter-control">
     <Select
        className="tm-filter-btn-select"
        classNamePrefix="tm-select"

        options={optionsMap[filterField]}
        isMulti
        maxMenuHeight={200}
        value={ optionsMap[filterField]
                  .filter(o => filterValue.includes(o.value)) 
              || [] 
        }

        onChange={opts => {
          if (opts) {
            setFilterValue(opts.map(o => o.value))
          } else {
            setFilterValue([])
          }
        }}

        placeholder={placeholderMap[filterField]}
        isClearable

        styles={{
          control: provided => ({
            ...provided,
            maxWidth: '300px',
          }),
          menu: provided => ({
            ...provided,
            maxHeight: '200px'
          })
          }}
          />

          </div>
          )}

      </div>

      {error && <div className="tm-error">{error}</div>}

      {mentions.length > 0 && (
        <>
         <div className="tm-results-wrapper">
          <div className="tm-results-card">
          <div className="tm-header-grid1">
            <h3 className="h3-title">{mentions[0].indname}</h3>
            <p>
              <a
                href={mentions[0].ind}
                target="_blank"
                rel="noopener noreferrer">
                <code className="code-underline">
                  {mentions[0].ind}
                </code>
              </a>
            </p>
            <p>
              <strong>Full Name:</strong> {mentions[0].indname}
            </p>

            {mentions[0].classIri && (
              (() => {
                const local = mentions[0].classIri.split("/").pop();
                return (
                  <p>
                    <strong>Class:</strong>{" "}
                    <Link
                      to={`/class/${encodeURIComponent(local)}`}
                      state={{ classIri: mentions[0].classIri,
                            classLabel: mentions[0].classLabel}}
                      className="tm-link-button-class"
                    >
                      {mentions[0].classLabel || local}
                    </Link>
                  </p>
                );
              })()
            )}
            <p>
              <strong>Definition:</strong> {mentions[0].definition ? mentions[0].definition : "-"}
            </p>
            <p>
              <strong>Ontology Match:</strong> {mentions[0].ontologyMatch?.trim() || "-"}
            </p>
          </div>
          </div>

    <div className="tm-results-card">
      <p>
        <strong>{mentions[0].indname}</strong> has{" "} in total{" "}
        <strong>{relationCount}</strong> {relationCount === 1 ? "relation": "relations"}. </p>
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

          <div className="tm-table-wrapper">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Sentence</th>
                  <th>Paper</th>
                  <th>Mention</th>
                </tr>
                <tr className="tm-filters">
                  <th>
                    <input
                      type="text"
                      className="tm-filter-input"
                      placeholder="Filter sentence…"
                      value={sentenceFilter}
                      onChange={e => setSentenceFilter(e.target.value)}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      className="tm-filter-input"
                      placeholder="Filter paper…"
                      value={paperFilter}
                      onChange={e => setPaperFilter(e.target.value)}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      className="tm-filter-input"
                      placeholder="Filter mention…"
                      value={mentionFilter}
                      onChange={e => setMentionFilter(e.target.value)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMentions.map((mention, idx) => (
                  <tr key={`${mention.indname}-${idx}`}>
                    <td className="tm-truncate">
                  <span
                    className="tm-clickable color-sentence"
                    onClick={() => setSelected(mention)}>
                    {mention.senttext}
                  </span>
                </td>
                <td>
                    <div className="tm-paper-cell">
                      <div className="tm-paper-link">
                    <Link
                      to={`/paper/${mention.paperid}`}
                      className="tm-clickable"
                    >
                      {mention.paper}
                    </Link>
                    </div>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${mention.paperid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tm-pubmed-button"
                    >
                      View in PubMed
                    </a>
                  </div>
                </td>
                    <td className="tm-truncate">
                      {mention.mentiontext}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && mentions.length === 0 && (
        <div className="tm-empty">
          No results yet. Please enter a term and click Search.
        </div>
      )}
      {showRelModal && (
  <div className="tm-modal-overlay" onClick={() => setShowRelModal(false)}>
    <div className="tm-modal" onClick={e => e.stopPropagation()}>
      <button className="tm-modal-close" onClick={() => setShowRelModal(false)}>
        ×
      </button>
      <h3>All Relations for {mentions[0].indname}</h3>
      <ul className="tm-relations-list">
        {relationsList.map(({ prop, label, count }) => (
          <li key={prop}>
            <strong>{label}</strong> → {count} {count === 1 ? "object" : "objects"}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

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
                  {o.label}</button>
                </td>
                <td>
                <code className="code-underline">{o.uri}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


      {selected && (
        <div
          className="tm-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="tm-modal"
            onClick={(e) => e.stopPropagation()}
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
              <strong>URI: </strong><code className="code-underline"> {selected.sent}</code>
            </p>
            <p>
              <strong>Annotator: </strong> {selected.annotator}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
