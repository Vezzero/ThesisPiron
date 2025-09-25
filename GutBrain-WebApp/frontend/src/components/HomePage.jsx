import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Fuse from "fuse.js";
import useAllIndividuals from "../hooks/useAllIndividuals";
import AsyncSelect from "react-select/async";
import "../styles/LandingPage.css";
import '../styles/HomePage.css';
import Chip from '@mui/material/Chip';
import { Link } from "react-router-dom";
import { BASE_URL } from "../App";

export default function HomePage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { individuals: allIndividuals } = useAllIndividuals();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);


const handleSearch = (overrideTerm) => {
  const q = (overrideTerm ?? term).trim();
  if (!q) return;

  navigate(`/search?term=${encodeURIComponent(q)}`);
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const fuse = useMemo(
    () =>
      new Fuse(allIndividuals.map((i) => i.label), {
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [allIndividuals]
  );

  const loadOptions = (inputValue) => {
    if (!inputValue || inputValue.length < 3) return Promise.resolve([]);
    const results = fuse.search(inputValue).slice(0, 10);
    return Promise.resolve(
      results.map((r) => ({
        label: r.item,
        value: r.item,
      }))
    );
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
        <div className="background">
        <span></span>
  <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   <span></span>
   </div>
      <Container
        fluid
        className="vh-100 d-flex justify-content-center align-items-center"
      >
        <div className="landing-card text-center">
          <Form onKeyDown={handleKeyPress}>
            {/* Logo */}
            <Row className="mb-4">
              <Col>
                <img
                  src={BASE_URL + `/img/gutbrain-logo-png.PNG`}
                  alt="Gut-Brain KB"
                  className="landing-logo"
                />
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8} className="d-flex gap-2 justify-content-center">
                <AsyncSelect
                  className="tm-input flex-grow-1"
                  classNamePrefix="tm-input"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions={false}
                  isClearable
                  placeholder="Type a term…"
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
                  onInputChange={(val) => setTerm(val)}
                  onChange={(opt, meta) => {
                    if (opt?.value) {
                      setSelectedOption(opt);
                      setTerm(opt.value);
                      handleSearch(opt.value);
                    } else if (meta.action === "clear") {
                      setTerm("");
                      setSelectedOption(null);
                      setMenuIsOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                      setMenuIsOpen(false);
                    }
                  }}
                  styles={{
                    container: (base) => ({ ...base, width: "100%" }),
                    control: (base) => ({ ...base, width: "100%" }),
                    menu: (base) => ({ ...base, width: "100%" }),
                  }}
                />

                <Button
                  variant="dark"
                  className="tm-button"
                  onClick={() => {
                    handleSearch();
                    setMenuIsOpen(false);
                  }}
                  disabled={loading}
                >
                  {loading ? "Searching…" : "Search"}
                </Button>
              </Col>
              <Row>
                <p style={{textAlign: 'center', fontSize: '0.7rem', margin: '10px'}}>Looking for an example? Try these queries:
                </p>
              </Row>
                <Row style={{display: 'flex', justifyContent: 'center'}}>
                    <Col md={3} style={{width:'auto', margin:'5px'}}>
                        <Chip
                            label="Alzheimers Disease"
                            variant="outlined"
                            size="small"
                            clickable
                            component={Link}
                            to={`/search?term=${encodeURIComponent('Alzheimers Disease')}`}/>
                        </Col>
                            <Col md={3} style={{width:'auto', margin:'5px'}}>
                        <Chip 
                            label="Progressive Neurological Conditions" 
                            component={Link} 
                            clickable 
                            variant="outlined" 
                            size="small" 
                            to={`/search?term=${encodeURIComponent('Progressive Neurological Conditions')}`} />
                        </Col>
                            <Col md={3} style={{width:'auto', margin:'5px'}}>
                        <Chip 
                            label="Intestinal Microbiome" 
                            component={Link} 
                            clickable 
                            variant="outlined" 
                            size="small" 
                            to={`/search?term=${encodeURIComponent('Intestinal Microbiome')}`} />
                        </Col>
                </Row>
            </Row>
            <Row>
                 <footer>
                   <div style={{ textAlign: "center", marginTop: '25px' }}>
                     <a href="https://www.unipd.it/" target="_blank" rel="noopener noreferrer">
                       <img
                         className="logo-footer"
                         src={BASE_URL + `/footer/unipd-logo.png`}
                         alt="UniPD"
                       />
                     </a>
                     <a href="https://www.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
                       <img
                         className="logo-footer"
                         src={BASE_URL + `/footer/dei-logo_white.png`}
                         alt="DEI"
                       />
                     </a>
                     <a href="https://iiia.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
                       <img
                         className="logo-footer"
                         src={BASE_URL + `/footer/iiia-logo.png`}
                        alt="IIIA"
                       />
                     </a>
                   </div>
                 </footer>
               </Row>
          </Form>
        </div>
      </Container>
    </div>
  );
}
