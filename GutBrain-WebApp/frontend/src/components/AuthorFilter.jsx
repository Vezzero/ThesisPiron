import React, { useState, useEffect, useMemo } from "react";
import Accordion from 'react-bootstrap/Accordion';


export default function AuthorFilter({
  allAuthors,
  selectedAuthors,
  onChange,
  isOpen,
  onToggle,
}) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [search,       setSearch]       = useState("");
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
    setVisibleCount(5);
   }, [isOpen]);

  const filtered = useMemo(
    () =>
      allAuthors
        .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allAuthors, search]
  );

  const toShow = filtered.slice(0, visibleCount);

  const toggleOne = name => {
    if (selectedAuthors.includes(name)) {
      onChange(selectedAuthors.filter(n => n !== name));
    } else {
      onChange([...selectedAuthors, name]);
    }
  };

  return (
    <div className="tm-filter-item author-box">
      <Accordion activeKey={isOpen ? "0" : null} onSelect={onToggle}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Author</Accordion.Header>
          <Accordion.Body>
            {toShow.map(({ name, count }) => (
              <label key={name} className="tm-filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAuthors.includes(name)}
                  onChange={() => toggleOne(name)}
                />
                {name} ({count})
              </label>
            ))}

                  {visibleCount < filtered.length && (
                  <button
                    className="tm-filter-show-more"
                    onClick={() => setVisibleCount(c => c + 5)}
                  >
                    Show more…
                  </button>
                )}

            <input
              type="text"
              className="tm-filter-search"
              placeholder="Search authors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
