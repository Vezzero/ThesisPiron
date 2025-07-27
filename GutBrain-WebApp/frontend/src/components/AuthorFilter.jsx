 import React, { useState, useEffect } from "react";
 
 function AuthorFilter({
   allAuthors,
   selectedAuthors,
   onChange,
   isOpen,
   onToggle,
 }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(isOpen);
  const [search,   setSearch]  = useState("");

  useEffect(() => {
   setOpen(isOpen);
 }, [isOpen]);

  const filtered = allAuthors
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
    a.name.localeCompare(b.name))

  const toShow = showAll ? filtered : filtered.slice(0,5);

  const toggleOne = name => {
    if (selectedAuthors.includes(name)) {
      onChange(selectedAuthors.filter(n => n !== name));
    } else {
      onChange([...selectedAuthors, name]);
    }
  };

  return (
    <div className="tm-filter-item author-box">
      <div
       className={`tm-filter-header ${open ? "tm-filter-header--active" : ""}`}
       onClick={onToggle}
       >
        <span>Author</span>
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
                checked={selectedAuthors.includes(name)}
                onChange={() => toggleOne(name)}
              />
              {name} ({count})
          </label>
        ))}

        {!showAll && filtered.length>5 && (
          <button
            className="tm-filter-show-more"
            onClick={()=>setShowAll(true)}
          >Show more…</button>
        )}
        <input
          type="text"
          className="tm-filter-search"
          placeholder="Search author…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
      )}
    </div>
  );
}

export default AuthorFilter;