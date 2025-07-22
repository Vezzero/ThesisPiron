import React from "react";
import { Col, Row } from "react-bootstrap";
import MenuButton from "../menu/MenuButton";
import { BASE_URL } from "../App";
import "./Credits.css";

export default function Credits() {
  return (
    <div className="container-fluid">
      <Row>
        <Col
          md={2}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <MenuButton />
        </Col>
        <Col
          md={8}
          style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}
        >
          <img
            className="logo"
            alt="Core KB Logo"
          />
        </Col>
        <Col md={2}></Col>
      </Row>

      <h3 className="text-align-center margin-top-1rem">Credits</h3>

      <div className="d-flex justify-content-center py-5 text-center">
        <Row>
          {/* ---- Person 1 ---- */}
          <Col lg={3} md={3} className="p-4">
            <a
              className="cardLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.dei.unipd.it/~giachell/"
            >
              <img
                className="img-fluid mx-auto rounded-circle person_img"
                src="https://gda.dei.unipd.it/static/images/credits/fabio_480x480.jpg"
                alt="Fabio Giachelle"
                width={200}
              />
              <h6 className="person_name">
                <b>Fabio Giachelle</b>
              </h6>
            </a>
            <p className="mb-0">giachell@dei.unipd.it</p>
          </Col>

          {/* ---- Person 2 ---- */}
          <Col lg={3} md={3} className="p-4">
            <a
              className="cardLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.dei.unipd.it/~marches1"
            >
              <img
                className="img-fluid mx-auto rounded-circle person_img"
                src="https://gda.dei.unipd.it/static/images/credits/stefano_480x480.png"
                alt="Stefano Marchesin"
                width={200}
              />
              <h6 className="person_name">
                <b>Stefano Marchesin</b>
              </h6>
            </a>
            <p className="mb-0">stefano.marchesin@dei.unipd.it</p>
          </Col>

          {/* ---- Person 3 ---- */}
          <Col lg={3} md={3} className="p-4">
            <a
              className="cardLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.dei.unipd.it/~silvello"
            >
              <img
                className="img-fluid mx-auto rounded-circle person_img"
                src="https://gda.dei.unipd.it/static/images/credits/gian_960x960.jpg"
                alt="Gianmaria Silvello"
                width={200}
              />
              <h6 className="person_name">
                <b>Gianmaria Silvello</b>
              </h6>
            </a>
            <p className="mb-0">silvello@dei.unipd.it</p>
          </Col>

          {/* ---- Person 4 ---- */}
          <Col lg={3} md={3} className="p-4">
            <a
              className="cardLink"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.khoury.northeastern.edu/people/omar-alonso/"
            >
              <img
                className="img-fluid mx-auto rounded-circle person_img"
                src="https://gda.dei.unipd.it/static/images/credits/omar_480x480.jpg"
                alt="Omar Alonso"
                width={200}
              />
              <h6 className="person_name">
                <b>Omar Alonso</b>
              </h6>
            </a>
          </Col>
        </Row>
      </div>

      <Row>
        <h6 style={{ textAlign: "center", fontWeight: 600 }}>
          Acknowledgments
        </h6>
      </Row>
      <Row className="justify-content-center">
        <p className="text-align-justify" style={{ maxWidth: "80vw", width: "auto" }}>
          This work is supported by the{" "}
          <a
            href="https://www.examode.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ExaMode
          </a>{" "}
          project, as part of the European Union Horizon 2020 program under
          Grant Agreement no. 825292.{" "}
          <a
            href="https://www.examode.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${BASE_URL}/static/images/examode.png`}
              alt="ExaMode Logo"
              style={{ maxHeight: 50, width: "auto" }}
            />
          </a>
        </p>
      </Row>

      <Row>
        <footer>
          <div style={{ textAlign: "center", marginTop: "5%" }}>
            <a
              href="https://www.unipd.it/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="logo-footer"
                src={`${BASE_URL}/static/images/unipd-logo.png`}
                alt="UniPD Logo"
              />
            </a>
            <a
              href="https://www.dei.unipd.it/home-page"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="logo-footer"
                src={`${BASE_URL}/static/images/dei-logo_white.png`}
                alt="DEI Logo"
              />
            </a>
            <a
              href="http://iiia.dei.unipd.it/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="logo-footer"
                src={`${BASE_URL}/static/images/iiia-logo.png`}
                alt="IIIA Logo"
              />
            </a>
          </div>
        </footer>
      </Row>
    </div>
  );
}
