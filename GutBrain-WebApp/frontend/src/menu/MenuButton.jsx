import React, {useContext} from "react";
import {
    faBars,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {AppContext} from "../App";



function MenuButton() {
    const {
        _showbar,
    } = useContext(AppContext);
    const [_showBar, setShowBar] = _showbar;

    function toggleSideBar() {
        setShowBar((prev) => !prev);
    }

    return <FontAwesomeIcon className={"menu-sidebar-icon"} icon={faBars} size="2x" onClick={() => {
        toggleSideBar();
    }}/>;
}

export default MenuButton;