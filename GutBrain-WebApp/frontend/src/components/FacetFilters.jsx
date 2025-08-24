import React, { useState, useMemo } from "react";
import Accordion from "react-bootstrap/Accordion";
import '../styles/LandingPage.css';

export default function FacetFilter({
  title,
  items,
  selectedItems,
  onChange,
}) {

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const filtered = useMemo(
    () =>
      items
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, search]
  );
  const toShow = filtered.slice(0, visibleCount);

  const toggleOne = name =>
    selectedItems.includes(name)
      ? onChange(selectedItems.filter(n => n !== name))
      : onChange([...selectedItems, name]);

  return (
    <div className="tm-filter-item author-box">
      <Accordion defaultActiveKey="">
        <Accordion.Item eventKey="0">
          <Accordion.Header>{title}</Accordion.Header>
          <Accordion.Body>
            {toShow.map(({ name, count }) => (
              <label key={name} className="tm-filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(name)}
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
              placeholder={`Search ${title.toLowerCase()}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
