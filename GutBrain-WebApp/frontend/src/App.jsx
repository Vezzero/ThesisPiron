import React, { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Credits } from './credits/Credit';
import { About } from './components/About';
import SideBar from "./components/Sidebar.jsx";
import './App.css';
import HomePage from "./components/HomePage.jsx";

// Mode
export const mode = "production";

// Domain
export const domain = "https://gda.dei.unipd.it";
export const domain_dev = "http://localhost:5173";

export var BASE_URL = "https://hereditary.dei.unipd.it/app/gutbrainkb";

//export var BASE_URL = "http://localhost:8088/app/gutbrainkb";

export const AppContext = createContext();

export default function App() {

  const showBarState = useState(false);
  return (
    <AppContext.Provider value={{ _showbar: showBarState, }}>
    <BrowserRouter basename="/app/gutbrainkb">
    <SideBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<LandingPage />} />
        <Route path="/paper/:paperId" element={<LandingPage />} />
        <Route path="/class/:label" element={<LandingPage/>} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
    </AppContext.Provider>
  );
}
