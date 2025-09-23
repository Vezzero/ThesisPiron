import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import MenuButton from "../menu/MenuButton";
import { AiFillLinkedin } from "react-icons/ai";
import { BASE_URL } from "../App";
import "../App.css";

const people = [
  {
    name: "Samuel Piron",
    img: "./person/piron.jpg",
    email: "pironsamue@dei.unipd.it",
    linkedInLink: "https://www.linkedin.com/in/samuel-piron",
  },
  {
    name: "Marco Martinelli",
    img: "https://iiia.dei.unipd.it/static/images/person/martinelli.jpeg",
    email: "marco.martinelli.4@phd.unipd.it",
    link: "https://www.dei.unipd.it/~martinell2/",
    linkedInLink: "https://www.linkedin.com/in/martinelli-marco/",
  },
  {
    name: "Gianmaria Silvello",
    img: "https://gda.dei.unipd.it/static/images/credits/gian_960x960.jpg",
    email: "silvello@dei.unipd.it",
    link: "https://www.dei.unipd.it/~silvello",
    linkedInLink: "https://www.linkedin.com/in/gianmariasilvello/",
  },
  {
    name: "Fabio Giachelle",
    img: "https://gda.dei.unipd.it/static/images/credits/fabio_480x480.jpg",
    email: "giachell@dei.unipd.it",
    link: "https://www.dei.unipd.it/~giachell/",
    linkedInLink: "https://www.linkedin.com/in/fabiogiachelle/",
  },
  {
    name: "Ornella Irrera",
    img:  "https://iiia.dei.unipd.it/static/images/person/irrera.jpg",
    email: "irreraorne@dei.unipd.it",
    link: "https://www.dei.unipd.it/~irreraorne/",
    linkedInLink: "https://www.linkedin.com/in/ornella-irrera/",
  },
  {
    name: "Simone Merlo",
    img: "https://iiia.dei.unipd.it/static/images/person/merlo.jpeg",
    email: "simone.merlo@phd.unipd.it",
    link: "https://www.dei.unipd.it/~merlosimon/",
    linkedInLink: "https://www.linkedin.com/in/simone-merlo-2858882a9/",
  }

];

export function Credits() {
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
      <h3 style={{fontWeight:'700'}}>Credits</h3>
    </Col>
  </Row>

      <Row className="justify-content-center">
        {people.map(({ name, img, email, link, linkedInLink }) => (
          <Col
            key={name}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            className="text-center mb-4"
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
            <img
            src={img}
            alt={name}
            width={200}
            height={200}
            className="rounded-circle mb-3"
            style={{ objectFit: "cover" }}
            />
           </a>

            <h6 style={{ fontWeight: 700 }}>
            {name === "Samuel Piron" ? (
                name
            ) : (
                <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="person-name-link"
                >
                {name}
                </a>
            )}
            </h6>
            <p
              style={{
                wordBreak: "break-word",
                marginBottom: "0.5rem",
              }}
            >
              {email}
            </p>

            <a href={linkedInLink} target="_blank" rel="noopener noreferrer">
             <AiFillLinkedin size="2em"/>
            </a>
          </Col>
        ))}
      </Row>
                <div style={{ backgroundColor: '#f4fdfaff', borderRadius: '25px'}}>
                <Row>
                    <h5 style={{textAlign:'center', fontWeight:'700', marginTop: '15px'}}>Acknowledgments</h5>
                </Row>
                <Row style={{display:'flex', justifyContent:'center', marginTop: '20px', marginBottom: '20px'}}>
                    <p className={'text-align-justify'} style={{maxWidth:'80vw', width:'auto'}}>
                        This work is partially supported by the <a href="https://hereditary-project.eu/"
                                                         target={"_blank"} rel={"noopener noreferrer"}>HEREDITARY</a> Project, as part of the
                        European Union's Horizon Europe research and innovation program under grant agreement No GA 101137074.
                        &nbsp;
                        <a href="https://hereditary-project.eu/"
                           target={"_blank"} rel={"noopener noreferrer"}>
                            <img src={"https://hereditary-project.eu/wp-content/uploads/2024/04/Hereditary_Horizontal_primary.png"} style={{maxHeight:'50px', width:'auto'}} alt={"ExaMode European Project"}/></a>
                    </p>


                </Row>
                </div>
                <Row>
                    <footer className="app-footer">
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <a href="https://www.unipd.it/" target="_blank" rel="noopener noreferrer">
                        <img
                            className="logo-footer"
                            src="./footer/unipd-logo.png"
                            alt="UniPD"
                        />
                        </a>
                        <a href="https://www.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
                        <img
                            className="logo-footer"
                            src="./footer/dei-logo_white.png"
                            alt="DEI"
                        />
                        </a>
                        <a href="https://iiia.dei.unipd.it/" target="_blank" rel="noopener noreferrer">
                        <img
                            className="logo-footer"
                            src="./footer/iiia-logo.png"
                            alt="IIIA"
                        />
                        </a>
                    </div>
                    </footer>
        </Row>
            </Container>

    );
}