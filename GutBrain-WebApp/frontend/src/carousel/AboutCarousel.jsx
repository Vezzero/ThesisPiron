import React, {useState} from "react";
import {Carousel, Row} from "react-bootstrap";
import slide1 from "../assets/carouselhome.png";
import slide2 from "../assets/carousel1.png";
import slide3 from "../assets/carousel2.png";
import slide4 from "../assets/carousel3.png";
import slide5 from "../assets/carousel4.png";
import '../App.css';

export default function ControlledCarousel() {
    const [index, setIndex] = useState(0);
    const slides = [
    { id: 0, src: slide1, alt: "Main search interface providing three sample queries.", caption: "Main search interface providing three sample queries." },
    { id: 1, src: slide2, alt: "Search results overview",  caption: "Main search results for <i>Alzheimer's Disease</i>." },
    { id: 2, src: slide3, alt: "Paper details view",       caption: "Example of a Paper Details page with title, abstract, and metadata." },
    { id: 3, src: slide4, alt: "Class details view",       caption: "<i>Disease, Disorder, or Finding</i> Details page with its URI, description, top ten individuals, and a chart." },
    { id: 4, src: slide5, alt: "Graph visualization",      caption: "Interactive graph view of entities and relations of the entity <i>Human Gut Microbiome</i>." },
  ];
    const [captionText, setCaptionText] = useState(slides[index]["caption"]);
    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
        setCaptionText(slides[selectedIndex]["caption"]);
    };
    return (
        <div>
            <Row>
                <Carousel activeIndex={index} onSelect={handleSelect} variant='dark' className={'carousel-about'}>
                    {slides.map((slide) => (
                    <Carousel.Item key={slide.id}>
                        <img
                            className="d-block w-100"
                            src={slide.src}
                            alt={slide.alt}
                            loading="lazy"
                            style={{ objectFit: "contain", maxHeight: 520 }}
                        />
                        </Carousel.Item>))
                    }
                </Carousel>
            </Row>
            <Row>
                <p className={'text-align-center'} style={{'width': '100%', 'padding': '0.5rem'}} dangerouslySetInnerHTML={{__html: captionText}}></p>
            </Row>
        </div>
    );
}