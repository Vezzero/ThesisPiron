import React from "react";
import {AppContext, BASE_URL} from "../App";
//import AboutCarousel from "./AboutCarousel"; //TODO ADD THE CAROUSEL AT THE END  OF THE WORK
import {Col, Row, Container} from "react-bootstrap";
import MenuButton from "../menu/MenuButton.jsx";

export function About() {
    return (
            <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Row className="justify-content-between align-items-center mb-4" style={{ marginTop: '20px' }}>
                    <Col xs="auto">
                    <MenuButton />
                    </Col>

                    <Col className="text-center">
                    <img
                        src="/static/img/gb-logo-text.JPEG"
                        alt="Gut-Brain KB"
                        style={{ maxWidth: '200px', width: '100%' }}
                    />
                    </Col>

                    <Col xs="auto" />
                </Row>

                  <Row className="justify-content-center mb-5">
                    <Col xs="auto">
                      <h3 style={{fontWeight:'700'}}>About</h3>
                    </Col>
                  </Row>
                <div className={'display-flex-justify-content-center'}>
                    <p className="text-align-justify max-width-80vw padding-05rem line-height-1_8">
                    <strong>Gut-Brain KB</strong> is a web platform that lets researchers, clinicians, and healthcare professionals
                    quickly uncover verified facts about the gut–brain axis. It supports both natural-language and faceted searches
                    with autocomplete, filters, and structured queries.  
                    By leveraging <span style={{ borderBottom: "#4A6EE0 solid 2px" }}>fine-grained relationships</span> between gut
                    and brain entities, Gut-Brain KB not only surfaces relevant scientific evidence (e.g. linked PubMed papers), but
                    also visualizes those associations in an interactive graph. The result is an intuitive, end-to-end tool for
                    exploring and validating experimental data on gut–brain interactions.
                    </p>

                </div>
                <div className="d-flex justify-content-center my-4">
                    <p className="text-center w-80vw">
                        For full details on our <strong>ontology</strong> and source <strong>data</strong>, please visit the&nbsp;
                        <a
                        href="https://hereditary.dei.unipd.it/ontology/gutbrain/"
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        Hereditary Gut-Brain Documentation
                        </a>.
                    </p>
                </div>
            </Container>
    );
}