import React, {useState} from "react";
import {Carousel, Row} from "react-bootstrap";
import '../App.css';

export default function ControlledCarousel() {
    const [index, setIndex] = useState(0);
    const slides = [
    { id: 0, src: "./img/carouselImg/carouselhome.png", alt: "Main search interface providing three sample queries.", caption: "Main search interface providing three sample queries." },
    { id: 1, src: "./img/carouselImg/carousel1.png", alt: "Search results overview",  caption: "Main search results for <i>Alzheimer's Disease</i>." },
    { id: 2, src: "./img/carouselImg/carousel2.png", alt: "Paper details view",       caption: "Example of a Paper Details page with title, abstract, and metadata." },
    { id: 3, src: "./img/carouselImg/carousel3.png", alt: "Class details view",       caption: "<i>Disease, Disorder, or Finding</i> Details page with its URI, description, top ten individuals, and a chart." },
    { id: 4, src: "./img/carouselImg/carousel4.png", alt: "Graph visualization",      caption: "Interactive graph view of entities and relations of the entity <i>Human Gut Microbiome</i>." },
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