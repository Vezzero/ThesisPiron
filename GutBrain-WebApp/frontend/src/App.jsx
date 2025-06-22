import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ClassDetails   from "./pages/ClassDetails";
import PaperDetails from "./pages/PaperDetails";
import TermMentions from "./components/TermMentions";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<TermMentions />} />
        <Route path="/class/:className" element={<ClassDetails />} />
        <Route path="/paper/:paperId" element={<PaperDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
