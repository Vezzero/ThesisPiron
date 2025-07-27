import React, {useContext, useState} from "react";
import {AppContext, BASE_URL} from "./App";
import {Carousel, Row} from "react-bootstrap";

export default function ControlledCarousel() {
    const [index, setIndex] = useState(0);
    const {
        _showOptions,
        _useMode,
        _action,
        _reportString,
        _institute,
        _language,
        _usecase,
        _updateMenu,
        _useCaseList,
        _languageList,
        _instituteList,
        _username,
        _loadingControl,
        _openFullScreen,
        _cardExpanded,
        _cardExpandedID,
        _phase,
        _step,
        _loadingSankey,
        _loadingRules,
        _tableRowsIn
    } = useContext(AppContext);

    const slides = [{"id": 1, "alt": "Main search interface providing three sample queries.", "caption": "Main search interface providing three sample queries."},
        {"id": 2, "alt": "Search results for query 'Braf oncogene melanoma'", "caption": "Search results for query <q><i>Braf oncogene melanoma </i></q>."},
        {"id": 3, "alt": "Structured search interface providing facets for gene, disease, and gene class", "caption": "Structured search" +
                " interface providing facets for <i>gene</i>," +
                " <i>disease</i>, and <i>gene class</i>."},
        {"id": 4, "alt": "Landing page for gene BRAF", "caption": "Landing page for the human gene <i>BRAF</i>"},
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
                    {slides.map((slide, index) => (
                    <Carousel.Item>
                        <img
                            className="d-block carousel-item"
                            src={BASE_URL + `/static/images/screenshots/slide_${index+1}.jpg`}
                            alt={slide["alt"]}
                            caption={slide["caption"]}
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