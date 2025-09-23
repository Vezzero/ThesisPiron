import React, {useContext, useEffect} from 'react'
import '../styles/sideBar.css';
import {AppContext, BASE_URL} from "../App.jsx";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Slide from '@mui/material/Slide';

function SideBar(){

    const {_showbar } = useContext(AppContext);
    const [showBar,setShowBar] = _showbar;

    useEffect(()=>{
        const height = document.documentElement.scrollHeight
        if(document.getElementById('sidenav') !== null){
            document.getElementById('sidenav').style.height = height.toString() + 'px'

        }
    },[showBar])


    return (
        <Slide direction="right" in={showBar} mountOnEnter unmountOnExit>

                <div className="sidenav" id='sidenav' style={{textAlign:'center'}}>
                    <button onClick={()=>setShowBar(false)} className='closeButtonMenu'><FontAwesomeIcon icon={faTimes} size='2x'/></button>
                    <div style={{textAlign:'center',marginTop:'20%',marginBottom:'10%'}}>
                    </div>
                    <img src="https://hereditary.dei.unipd.it/app/gutbrainkb/img/gutbrain-logo-png.PNG" alt="Gut-Brain KB" style={{maxWidth: '200px', width: '100%'}}/>
                <hr />
                    <a onClick={()=>setShowBar(false)} href={`${BASE_URL}/`}>Home</a>
                    <a onClick={()=>setShowBar(false)} href={`${BASE_URL}/about`}>About</a>
                    <a onClick={()=>setShowBar(false)} href={`${BASE_URL}/credits`}>Credits</a>
                </div>
        </Slide>
    );
}

export default SideBar
