import React, { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClassDetails   from "./pages/ClassDetails";
import PaperDetails from "./pages/PaperDetails";
import TermMentions from "./components/TermMentions";
import "bootstrap/dist/css/bootstrap.min.css";
import { Credits } from './credits/Credit';
import { About } from './components/About';
import SideBar from "./components/Sidebar.jsx";
import './App.css';

// Mode
// export const mode = "development";
export const mode = "production";

// Domain
export const domain = "https://gda.dei.unipd.it";   // Production URL
export const domain_dev = "http://localhost:5173"; // Development domain:port


export var BASE_URL = "http://localhost:5173";

//if (mode === "production") {
    //BASE_URL = domain;
//} else {
    //BASE_URL = domain_dev;
//}

export const AppContext = createContext();

export default function App() {

  const showBarState = useState(false);
  return (
    <AppContext.Provider value={{ _showbar: showBarState, }}>
    <BrowserRouter>
    <SideBar />
      <Routes>
        <Route path="/search" element={<TermMentions />} />
        <Route path="/paper/:paperId" element={<TermMentions />} />
        <Route path="/class/:className" element={<TermMentions />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
    </AppContext.Provider>
  );
}
