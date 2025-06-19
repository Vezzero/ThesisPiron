import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to the Homepage of the Hereditary Gut-Brain Axis Database</h1>
      </header>
      <div className="home-content">
        <div className="home-intro">
          <p>
            On this website, you can find information about specific gut-brain-related topics,
            such as Parkinson's Disease, statistical techniques, animals used for the experiments and also bacteria.
          </p>
          <Link to="/search/" className="start-link">
            <span></span> Search
          </Link>
        </div>
        <aside className="home-stats">
          <h2>Gut-Brain Axis Database Information</h2>
          <ul>
            <li>13 Categories</li>
            <li>1000 Individuals</li>
            <li>107,000 Triples</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
