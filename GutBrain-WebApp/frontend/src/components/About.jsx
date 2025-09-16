import React from "react";
import {AppContext, BASE_URL} from "../App";
import AboutCarousel from "../carousel/AboutCarousel"
import {Col, Row, Container} from "react-bootstrap";
import MenuButton from "../menu/MenuButton.jsx";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import Button from 'react-bootstrap/Button'

export function About() {
    return (
            <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Row className="justify-content-between align-items-center mb-4" style={{ marginTop: '20px' }}>
                    <Col xs="auto">
                    <MenuButton />
                    </Col>

                    <Col className="text-center">
                    <img
                        src="./img/gb-logo-text.JPEG"
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
                <Row>
                    <h5 style={{textAlign:'center', fontWeight:'700', marginTop: '15px', marginBottom:'25px'}}>Gut-Brain Axis Scheme</h5>
                </Row>
                <TransformWrapper initialScale={1} centerOnInit onInit={(ref) => {
                        ref.centerView();
                    }}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                            <Button variant="outline-dark" onClick={() => zoomIn()}>
                            <FiPlus /> Zoom In
                            </Button>
                            <Button variant="outline-dark" onClick={() => zoomOut()}>
                            <FiMinus /> Zoom Out
                            </Button>
                            <Button variant="outline-dark" onClick={() => resetTransform()}>
                            Reset
                            </Button>
                        </div>

                        <TransformComponent
                            wrapperStyle={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: 300,
                            marginBottom: 50
                            }}
                            contentStyle={{ display: 'flex', justifyContent: 'center'}}
                        >
                            <img
                            src="./img/gutbrainimgv0.png"
                            alt="Gut-Brain Scheme"
                            style={{
                                width: '100%',
                                height: "auto"
                            }}
                            />
                        </TransformComponent>
                        </>
                    )}
                    </TransformWrapper>
                    <Row className="justify-content-center my-5">
                        <Col xs={12} md={10} lg={9}>
                        <h5 style={{ textAlign: "center", fontWeight: 700, marginBottom: 16 }}>
                            Gallery Carousel
                        </h5>
                        <AboutCarousel/>
                        </Col>
                    </Row>
            </Container>
    );
}