import React, { useState } from "react";

export default function FacetFilter({
  title,
  items,
  selectedItems,
  onChange,
}) {
  const [open,      setOpen]      = useState(true);
  const [showAll,   setShowAll]   = useState(false);
  const [search,    setSearch]    = useState("");

  const filtered = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
    a.name.localeCompare(b.name))
  const toShow = showAll ? filtered : filtered.slice(0, 5);

  const toggleOne = name =>
    selectedItems.includes(name)
      ? onChange(selectedItems.filter(n => n !== name))
      : onChange([...selectedItems, name]);

  return (
    <div className="tm-filter-item author-box">
      <div
       className={`tm-filter-header ${open ? "tm-filter-header--active" : ""}`}
       onClick={() => setOpen(o => !o)}
       >
        <span>{title}</span>
        <button
          className="tm-filter-toggle"
        >
          {open ? "▼" : "►"}
        </button>
      </div>
      {open && (
        <div className="tm-filter-body">
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

          {!showAll && filtered.length > 5 && (
            <button
              className="tm-filter-show-more"
              onClick={() => setShowAll(true)}
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
        </div>
      )}
    </div>
  );
}
