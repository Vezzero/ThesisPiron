import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClassDetails   from "./pages/ClassDetails";
import PaperDetails from "./pages/PaperDetails";
import TermMentions from "./components/TermMentions";
import "bootstrap/dist/css/bootstrap.min.css";

// Mode
// export const mode = "development";
export const mode = "production";

// Domain
export const domain = "https://gda.dei.unipd.it";   // Production URL
export const domain_dev = "http://localhost:5173"; // Development domain:port


export var BASE_URL = "";

if (mode === "production") {
    BASE_URL = domain;
} else {
    BASE_URL = domain_dev;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/search" element={<TermMentions />} />
        <Route path="/class/:className" element={<TermMentions />} />
        <Route path="/paper/:paperId" element={<TermMentions />} />
      </Routes>
    </BrowserRouter>
  );
}
